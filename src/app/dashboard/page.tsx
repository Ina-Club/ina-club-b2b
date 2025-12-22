"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
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
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Link from "next/link";

interface ActiveGroup {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  basePrice: number;
  groupPrice: number;
  deadline: string;
  participantsCount: number;
  minParticipants?: number;
  maxParticipants?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [b2bPackage, setB2bPackage] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin?message=login_required");
      return;
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [groupsRes, packageRes] = await Promise.all([
        fetch("/api/active-groups/my-groups"),
        fetch("/api/user/b2b-package"),
      ]);

      if (!groupsRes.ok) {
        throw new Error("שגיאה בטעינת הקבוצות");
      }

      const groupsData = await groupsRes.json();
      setActiveGroups(groupsData.activeGroups || []);

      if (packageRes.ok) {
        const packageData = await packageRes.json();
        setB2bPackage(packageData.package);
      } else if (packageRes.status === 404) {
        // No package found, redirect to package selection
        router.push("/packages");
        return;
      }
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "success";
      case "CLOSED":
        return "default";
      case "CANCELED":
        return "error";
      case "EXPIRED":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "פתוח";
      case "CLOSED":
        return "סגור";
      case "CANCELED":
        return "בוטל";
      case "EXPIRED":
        return "פג תוקף";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                קבוצות פעילות: {activeGroups.length} / {b2bPackage.maxGroups}
              </Typography>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h2" gutterBottom>
                אין קבוצות פעילות
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                התחל ליצור קבוצה פעילה חדשה
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                href="/dashboard/create-group"
              >
                צור קבוצה חדשה
              </Button>
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
                {activeGroups.map((group) => (
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
                        label={getStatusLabel(group.status)}
                        color={getStatusColor(group.status) as any}
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
                      <IconButton
                        component={Link}
                        href={`/dashboard/groups/${group.id}/edit`}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      <Footer />
    </>
  );
}

