"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Company {
  id: string;
  title: string;
}

export default function CreateGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [groupPrice, setGroupPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minParticipants, setMinParticipants] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin?message=login_required");
      return;
    }

    if (session) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, companiesRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/companies"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.companies || []);
      }
    } catch (err) {
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/active-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          companyId,
          basePrice: parseFloat(basePrice),
          groupPrice: parseFloat(groupPrice),
          deadline,
          minParticipants: minParticipants ? parseInt(minParticipants) : null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          imageUrls: [], // TODO: Add image upload
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה ביצירת הקבוצה");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "שגיאה ביצירת הקבוצה");
    } finally {
      setSaving(false);
    }
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
      <Container maxWidth="md" sx={{ py: 4 }}>
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

        <Card>
          <CardContent>
            <Typography variant="h1" gutterBottom>
              צור קבוצה פעילה חדשה
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                הקבוצה נוצרה בהצלחה! מעביר אותך ללוח הבקרה...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="כותרת"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                />

                <TextField
                  label="תיאור"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  multiline
                  rows={4}
                  fullWidth
                />

                <TextField
                  select
                  label="קטגוריה"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  fullWidth
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="חברה"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                  fullWidth
                >
                  {companies.map((comp) => (
                    <MenuItem key={comp.id} value={comp.id}>
                      {comp.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="מחיר בסיסי (₪)"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />

                <TextField
                  label="מחיר קבוצה (₪)"
                  type="number"
                  value={groupPrice}
                  onChange={(e) => setGroupPrice(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ step: "0.01", min: "0" }}
                />

                <TextField
                  label="תאריך יעד"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="מינימום משתתפים (אופציונלי)"
                  type="number"
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(e.target.value)}
                  fullWidth
                  inputProps={{ min: "1" }}
                />

                <TextField
                  label="מקסימום משתתפים (אופציונלי)"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  fullWidth
                  inputProps={{ min: "1" }}
                />

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/dashboard"
                    disabled={saving}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    disabled={saving}
                  >
                    {saving ? "שומר..." : "צור קבוצה"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

