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
} from "@mui/material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface WishItem {
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

export default function WishItemsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [wishItems, setWishItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchWishItems();
  }, [isLoaded, isSignedIn, router]);

  const fetchWishItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wish-items/relevant");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת המוצרים המבוקשים");
      }

      const data = await res.json();
      setWishItems(data.wishItems || []);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת המוצרים המבוקשים");
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
          מוצרים מבוקשים (Wish Items)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {wishItems.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                אין בחנות שלך מוצרים מבוקשים כרגע
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מוצרים שמבוקשים על ידי משתמשים יופיעו כאן בהתאם לקטגוריות העסק שלך
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {wishItems.map((item) => (
              <Box key={item.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {item.title}
                      </Typography>
                      <Chip label={item.category} size="small" color="primary" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.participantsCount} מתעניינים
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(item.createdAt).toLocaleDateString("he-IL")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

