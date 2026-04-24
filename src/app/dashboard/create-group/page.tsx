"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import GroupForm, { GroupFormData } from "@/components/groups/GroupForm";

interface Category {
  id: string;
  name: string;
}

interface Company {
  id: string;
  title: string;
}

export default function CreateGroupPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // Data for the form
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/dashboard/create-group");
      return;
    }

    fetchData();
  }, [isSignedIn, isLoaded, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user's company first to set default
      // We'll assume there's an endpoint or we check the companies list against user ID if available, 
      // but simpler is to fetch "my-company" endpoint if it exists, or filter companies.
      // Based on previous analysis, there is a /api/company endpoint that returns the user's company.

      const [categoriesRes, companiesRes, myCompanyRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/companies"),
        fetch("/api/company"), // Returns user's company if they have one
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.companies || []);
      }

      if (myCompanyRes.ok) {
        const myCompanyData = await myCompanyRes.json();
        if (myCompanyData.company) {
          setUserCompanyId(myCompanyData.company.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/active-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          groupPrice: parseFloat(formData.groupPrice),
          minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : null,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה ביצירת הקבוצה");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/groups");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "שגיאה ביצירת הקבוצה");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          component={Link}
          href="/dashboard/groups"
        >
          חזרה לקבוצות שלי
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
              הקבוצה נוצרה בהצלחה! מעביר אותך לרשימת הקבוצות...
            </Alert>
          )}

          <GroupForm
            categories={categories}
            companies={companies}
            onSubmit={handleSubmit}
            loading={saving}
            userCompanyId={userCompanyId}
          />
        </CardContent>
      </Card>
    </Container>
  );
}

