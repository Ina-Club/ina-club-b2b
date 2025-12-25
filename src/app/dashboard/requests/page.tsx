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
  Chip,
  Grid,
} from "@mui/material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface RequestGroup {
  id: string;
  title: string;
  description: string;
  category: string;
  participantsCount: number;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string;
  };
}

export default function RequestsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [requestGroups, setRequestGroups] = useState<RequestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchRequests();
  }, [isLoaded, isSignedIn, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/request-groups/relevant");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת הבקשות");
      }

      const data = await res.json();
      setRequestGroups(data.requestGroups || []);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הבקשות");
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
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a2a5a" }}>
          בקשות רלוונטיות
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {requestGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                אין בקשות רלוונטיות כרגע
              </Typography>
              <Typography variant="body2" color="text.secondary">
                בקשות חדשות יופיעו כאן בהתאם לתחום העיסוק של החברה שלך
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {requestGroups.map((request) => (
              <Grid item xs={12} md={6} key={request.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {request.title}
                      </Typography>
                      <Chip label={request.category} size="small" color="primary" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {request.description}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        {request.participantsCount} משתתפים
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.createdAt).toLocaleDateString("he-IL")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
}

