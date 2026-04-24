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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add, Visibility, Edit } from "@mui/icons-material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import { ActiveGroup } from "@/lib/types/group";
import { statusToLabelAndColorMap } from "@/lib/utils/group";
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
      <Box>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        {runningGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h2" gutterBottom>
                אין קבוצות פעילות
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                צרו קבוצה חדשה כדי להתחיל
                              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>כותרת</TableCell>
                  <TableCell>קטגוריה</TableCell>
                  <TableCell>מחיר בסיסי</TableCell>
                  <TableCell>מחיר קבוצה</TableCell>
                  <TableCell>משתתפים</TableCell>
                  <TableCell>תאריך יעד</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runningGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.title}</TableCell>
                    <TableCell>{group.category}</TableCell>
                    <TableCell>₪{group.basePrice.toFixed(2)}</TableCell>
                    <TableCell>₪{group.groupPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {group.participantsCount}
                      {group.maxParticipants && ` / ${group.maxParticipants}`}
                    </TableCell>
                    <TableCell>
                      {new Date(group.deadline).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusToLabelAndColorMap[group.status].label}
                        color={statusToLabelAndColorMap[group.status].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        href={`/dashboard/groups/${group.id}/participants`}
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      {group.status === GroupStatus.OPEN || group.status === GroupStatus.ACTIVATED ? (
                        <IconButton
                          component={Link}
                          href={`/dashboard/groups/${group.id}/edit`}
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="inherit"
                          size="small"
                          disabled
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DashboardLayout>
  );
}

