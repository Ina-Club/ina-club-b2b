"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

interface Package {
  type: "BASIC" | "PREMIUM" | "ENTERPRISE";
  name: string;
  price: number;
  maxGroups: number;
  features: string[];
}

const packages: Package[] = [
  {
    type: "BASIC",
    name: "בסיסי",
    price: 299,
    maxGroups: 5,
    features: [
      "עד 5 קבוצות פעילות",
      "ניהול משתתפים מלא",
      "תמיכה טכנית",
      "דוחות בסיסיים",
    ],
  },
  {
    type: "PREMIUM",
    name: "פרימיום",
    price: 599,
    maxGroups: 20,
    features: [
      "עד 20 קבוצות פעילות",
      "ניהול משתתפים מלא",
      "תמיכה טכנית עדיפות",
      "דוחות מתקדמים",
      "ניהול תמונות בלתי מוגבל",
    ],
  },
  {
    type: "ENTERPRISE",
    name: "ארגוני",
    price: 1299,
    maxGroups: 100,
    features: [
      "קבוצות פעילות בלתי מוגבלות",
      "ניהול משתתפים מלא",
      "תמיכה טכנית 24/7",
      "דוחות מתקדמים",
      "ניהול תמונות בלתי מוגבל",
      "API מותאם אישית",
      "ניהול משתמשים מרובים",
    ],
  },
];

export default function PackagesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/packages");
      return;
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSelectPackage = async (pkg: Package) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setSelectedPackage(pkg);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/packages/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType: pkg.type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בבחירת החבילה");
      }

      const data = await res.json();

      // Redirect to payment page or dashboard
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "שגיאה בבחירת החבילה");
      setLoading(false);
    }
  };

  if (!isLoaded) {
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            בחר חבילה
          </Typography>
          <Typography variant="h2" color="text.secondary" sx={{ mt: 2 }}>
            בחר את החבילה המתאימה לעסק שלך
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {packages.map((pkg) => (
            <Grid item xs={12} md={4} key={pkg.type}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: selectedPackage?.type === pkg.type ? "2px solid" : "1px solid",
                  borderColor: selectedPackage?.type === pkg.type ? "primary.main" : "#BED6E9",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h2" gutterBottom>
                    {pkg.name}
                  </Typography>
                  <Box sx={{ my: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ fontSize: "2.5rem", fontWeight: "bold", color: "primary.main" }}
                    >
                      ₪{pkg.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      לחודש
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    עד {pkg.maxGroups} קבוצות פעילות
                  </Typography>
                  <List>
                    {pkg.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <Check sx={{ color: "success.main", mr: 1 }} />
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant={selectedPackage?.type === pkg.type ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading && selectedPackage?.type === pkg.type ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "בחר חבילה"
                    )}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

