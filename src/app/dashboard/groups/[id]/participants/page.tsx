"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
}

interface GroupInfo {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
}

export default function ParticipantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin?message=login_required");
      return;
    }

    if (session && groupId) {
      fetchParticipants();
    }
  }, [session, status, router, groupId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/active-groups/${groupId}/participants`);

      if (!res.ok) {
        throw new Error("שגיאה בטעינת המשתתפים");
      }

      const data = await res.json();
      setParticipants(data.participants || []);
      setGroupInfo(data.groupInfo || null);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
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
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            component={Link}
            href="/dashboard"
          >
            חזרה ללוח הבקרה
          </Button>
        </Box>

        {groupInfo && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h1" gutterBottom>
                {groupInfo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {groupInfo.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מספר משתתפים: {groupInfo.participantsCount}
              </Typography>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {participants.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h2" gutterBottom>
                אין משתתפים בקבוצה זו
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>שם מלא</TableCell>
                  <TableCell>אימייל</TableCell>
                  <TableCell>טלפון</TableCell>
                  <TableCell>תאריך הצטרפות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.name || "ללא שם"}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.phone || "לא צוין"}</TableCell>
                    <TableCell>
                      {new Date(participant.joinedAt).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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

