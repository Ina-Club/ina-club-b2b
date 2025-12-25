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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Visibility, Edit } from "@mui/icons-material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
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

export default function GroupsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchGroups();
  }, [isLoaded, isSignedIn, router]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/active-groups/my-groups");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת הקבוצות");
      }

      const data = await res.json();
      setActiveGroups(data.activeGroups || []);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הקבוצות");
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

  if (!isLoaded || loading) {
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
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
            הקבוצות שלי
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href="/dashboard/create-group"
            sx={{
              backgroundColor: "#1a2a5a",
              "&:hover": { backgroundColor: "#243a7a" },
            }}
          >
            צור קבוצה חדשה
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                אין קבוצות פעילות
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
      </Box>
    </DashboardLayout>
  );
}

