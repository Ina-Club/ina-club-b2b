"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import GroupList from "@/components/dashboard/group-list";
import Link from "next/link";
import { ActiveGroup } from "@/lib/types/group";
import { GroupStatus } from "@/lib/types/status";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [b2bPackage, setB2bPackage] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchDashboardData();
  }, [isLoaded, isSignedIn, router]);

  const fetchDashboardData = async () => {
    try {
      const [packageRes, groupsRes] = await Promise.all([
        fetch("/api/user/b2b-package", { credentials: "include" }),
        fetch("/api/active-groups/my-groups", { credentials: "include" }),
      ]);

      if (packageRes.ok) {
        const packageData = await packageRes.json();
        setB2bPackage(packageData.package);
      } else if (packageRes.status === 404) {
        router.push("/unauthorized");
        return;
      }

      if (!groupsRes.ok) {
        throw new Error("שגיאה בטעינת הקבוצות");
      }
      const groupsData = await groupsRes.json();
      setActiveGroups(groupsData.activeGroups || []);

    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const runningGroups = activeGroups.filter(
    (group) => [GroupStatus.OPEN, GroupStatus.ACTIVATED].includes(group.status)
  );

  if (!isLoaded || loading || !b2bPackage) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="h1">לוח בקרה</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href="/dashboard/create-group"
          >
            צור קבוצה חדשה
          </Button>
        </Box>

        {b2bPackage && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h2" gutterBottom>
                החבילה שלך: {b2bPackage.packageType === "BASIC" ? "בסיסי" : b2bPackage.packageType === "PREMIUM" ? "פרימיום" : "ארגוני"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                קבוצות פעילות: {runningGroups.length} / {b2bPackage.maxGroups}
              </Typography>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <GroupList groups={runningGroups} />
      </Box>
    </DashboardLayout>
  );
}
