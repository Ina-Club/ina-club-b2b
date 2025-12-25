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
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface Company {
  id: string;
  title: string;
  websiteUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  verified: boolean;
  categories: Array<{ id: string; name: string }>;
  logo: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function CompanyPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    websiteUrl: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    categoryIds: [] as string[],
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companyRes, categoriesRes] = await Promise.all([
        fetch("/api/company"),
        fetch("/api/categories"),
      ]);

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        if (companyData.company) {
          setCompany(companyData.company);
          setFormData({
            title: companyData.company.title || "",
            websiteUrl: companyData.company.websiteUrl || "",
            description: companyData.company.description || "",
            phone: companyData.company.phone || "",
            email: companyData.company.email || "",
            address: companyData.company.address || "",
            city: companyData.company.city || "",
            categoryIds: companyData.company.categories.map((c: any) => c.id),
          });
        }
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("שגיאה בשמירת הנתונים");
      }

      setSuccess(true);
      fetchData();
    } catch (err: any) {
      setError(err.message || "שגיאה בשמירת הנתונים");
    } finally {
      setSaving(false);
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
          פרטי החברה
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            הנתונים נשמרו בהצלחה
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="שם החברה *"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="אתר אינטרנט"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="תיאור החברה"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="טלפון"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="אימייל"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="כתובת"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="עיר"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>קטגוריות</InputLabel>
                    <Select
                      multiple
                      value={formData.categoryIds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryIds: e.target.value as string[],
                        })
                      }
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => {
                            const category = categories.find((c) => c.id === value);
                            return (
                              <Chip key={value} label={category?.name || value} size="small" />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      backgroundColor: "#1a2a5a",
                      "&:hover": { backgroundColor: "#243a7a" },
                    }}
                  >
                    {saving ? <CircularProgress size={24} /> : "שמור שינויים"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

