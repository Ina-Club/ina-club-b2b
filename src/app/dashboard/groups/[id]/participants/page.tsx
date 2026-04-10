"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { ArrowBack, CheckCircle, Lock } from "@mui/icons-material";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Link from "next/link";
import { GroupStatus } from "@/lib/types/status";

interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
  couponCode?: string | null;
}

interface GroupInfo {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  status: GroupStatus;
}

// TODO: move to monorepo!!!
const statusToLabelAndColorMap: Record<GroupStatus,
  { label: string,
    color: "info" | "success" | "default" | "error" | "warning"
  }> = {
  OPEN: {
    label: "פתוחה (לא הופעלה)",
    color: "info"
  },
  ACTIVATED: {
    label: "פעילה",
    color: "warning"
  },
  RESOLVED: {
    label: "סגורה (חויבה)",
    color: "success"
  },
  CANCELED: {
    label: "בוטלה",
    color: "error"
  },
  EXPIRED: {
    label: "פג תוקף",
    color: "error"
  },
  PENDING: {
    label: "ממתינה",
    color: "warning"
  },
  PREVIEW: {
    label: "תצוגה מקדימה",
    color: "info"
  },
};

export default function ParticipantsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [noShowIds, setNoShowIds] = useState<Set<string>>(new Set());
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [exitedUsers, setExitedUsers] = useState<Participant[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isSignedIn && groupId) {
      fetchParticipants();
    }
  }, [isSignedIn, isLoaded, router, groupId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/active-groups/${groupId}/participants`);

      if (!res.ok) {
        throw new Error("שגיאה בטעינת המשתתפים");
      }

      const data = await res.json();
      setParticipants(data.participants || []);
      setExitedUsers(data.exitedUsers || []);
      setGroupInfo(data.groupInfo || null);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateGroup = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await fetch(`/api/active-groups/${groupId}/activate`, {
        method: "POST"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "שגיאה בהפעלת הקבוצה");
      }
      setSuccess("הקבוצה הופעלה בהצלחה. נשלחו הודעות למשתתפים.");
      fetchParticipants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const executeResolveTokens = async () => {
    setResolveDialogOpen(false);
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await fetch(`/api/active-groups/${groupId}/resolve-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noShowUserIds: Array.from(noShowIds) })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "שגיאה בסגירת הקבוצה");
      }
      setSuccess("הקבוצה נסגרה. הפיקדונות טופלו בהצלחה.");
      fetchParticipants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleNoShow = (userId: string) => {
    setNoShowIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h1" gutterBottom>
                    {groupInfo.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {groupInfo.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    מספר משתתפים: {groupInfo.participantsCount}
                  </Typography>
                  {groupInfo.status && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={statusToLabelAndColorMap[groupInfo.status].label || groupInfo.status}
                        color={statusToLabelAndColorMap[groupInfo.status].color || "default"}
                      />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {groupInfo.status === "OPEN" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleActivateGroup}
                      disabled={actionLoading}
                      startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircle />}
                    >
                      הפעל קבוצה (שליחת קופונים)
                    </Button>
                  )}
                  {groupInfo.status === "ACTIVATED" && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setResolveDialogOpen(true)}
                      disabled={actionLoading}
                      startIcon={actionLoading ? <CircularProgress size={20} /> : <Lock />}
                    >
                      סגור קבוצה וחייב לא-מופיעים ({noShowIds.size})
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
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
                  {(groupInfo?.status === "ACTIVATED" || groupInfo?.status === "RESOLVED") && (
                    <TableCell align="center">קוד קופון</TableCell>
                  )}
                  {groupInfo?.status === "ACTIVATED" && (
                    <TableCell align="center">לא הופיע (חיוב פיקדון)</TableCell>
                  )}
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
                    {(groupInfo?.status === "ACTIVATED" || groupInfo?.status === "RESOLVED") && (
                      <TableCell align="center">
                        {participant.couponCode ? (
                          <Chip label={participant.couponCode} size="small" variant="outlined" color="primary" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    )}
                    {groupInfo?.status === "ACTIVATED" && (
                      <TableCell align="center">
                        <Checkbox
                          checked={noShowIds.has(participant.userId)}
                          onChange={() => toggleNoShow(participant.userId)}
                          color="error"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

        <Container maxWidth="lg" sx={{ pt: 0, pb: 4, px: { xs: 0, sm: 3 } }}>
          <Card>
            <CardContent>
              <Typography variant="h1" gutterBottom>
                משתתפים שעזבו ושילמו קנס ({exitedUsers.length})
              </Typography>
              {exitedUsers.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  אין משתתפים שעזבו את הקבוצה.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>שם מלא</TableCell>
                        <TableCell>אימייל</TableCell>
                        <TableCell>טלפון</TableCell>
                        <TableCell>תאריך עזיבה</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exitedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "לא צוין"}</TableCell>
                          <TableCell>
                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("he-IL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "לא ידוע"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Container>

      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
      >
        <DialogTitle>סגירת קבוצה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך לסגור את הקבוצה, לשחרר משתתפים ולחייב את הלא-מופיעים?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResolveDialogOpen(false)} color="inherit">
            ביטול
          </Button>
          <Button onClick={executeResolveTokens} color="error" variant="contained">
            אישור וסגירה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
