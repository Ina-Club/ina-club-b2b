"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
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
} from "@mui/material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface Participant {
  userId: string;
  name: string | null;
  email: string;
  groups: Array<{
    groupId: string;
    groupTitle: string;
    joinedAt: string;
  }>;
}

export default function ParticipantsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchParticipants();
  }, [isLoaded, isSignedIn, router]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/participants");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת המשתתפים");
      }

      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת המשתתפים");
    } finally {
      setLoading(false);
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
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a2a5a" }}>
          משתתפים
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {participants.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                אין משתתפים כרגע
              </Typography>
              <Typography variant="body2" color="text.secondary">
                משתתפים יופיעו כאן לאחר שירשמו לקבוצות שלך
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 620 }}>
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>אימייל</TableCell>
                  <TableCell>קבוצות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.userId}>
                    <TableCell>{participant.name || "ללא שם"}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {participant.groups.map((group) => (
                          <Chip
                            key={group.groupId}
                            label={group.groupTitle}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
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
