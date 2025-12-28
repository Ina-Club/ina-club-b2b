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
  Avatar,
  Grid,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LanguageIcon from "@mui/icons-material/Language";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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

export default function CompanyPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchCompany();
  }, [isLoaded, isSignedIn]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/company");
      if (!res.ok) throw new Error("שגיאה בטעינת פרטי החברה");

      const data = await res.json();
      setCompany(data.company);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <Alert severity="info">לא נמצאה חברה</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
        <CardContent>
          {/* Logo + Title */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              src={company.logo || undefined}
              alt={company.title}
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2,
                boxShadow: 3,
              }}
            />
            <Typography variant="h4" fontWeight="bold">
              {company.title}
              {company.verified && (
                <CheckCircleIcon
                  color="success"
                  sx={{ ml: 1, verticalAlign: "middle" }}
                />
              )}
            </Typography>
          </Box>

          {/* Description */}
          {company.description && (
            <Typography sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
              {company.description}
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* Details */}
          <Grid container spacing={2}>
            {company.address && (
              <Grid item xs={12} md={6}>
                <Detail icon={<LocationOnIcon />} text={`${company.address}, ${company.city}`} />
              </Grid>
            )}
            {company.phone && (
              <Grid item xs={12} md={6}>
                <Detail icon={<PhoneIcon />} text={company.phone} />
              </Grid>
            )}
            {company.email && (
              <Grid item xs={12} md={6}>
                <Detail icon={<EmailIcon />} text={company.email} />
              </Grid>
            )}
            {company.websiteUrl && (
              <Grid item xs={12} md={6}>
                <Detail
                  icon={<LanguageIcon />}
                  text={
                    <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                      {company.websiteUrl}
                    </a>
                  }
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Categories */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              קטגוריות
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {company.categories.map((c) => (
                <Chip key={c.id} label={c.name} />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function Detail({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <Typography>{text}</Typography>
    </Box>
  );
}
