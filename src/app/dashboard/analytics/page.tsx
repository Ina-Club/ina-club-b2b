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
  Paper,
} from "@mui/material";
// Charts will be added when recharts is installed
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from "recharts";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface AnalyticsData {
  summary: {
    totalGroups: number;
    totalParticipants: number;
    totalRevenue: number;
    openGroups: number;
    closedGroups: number;
  };
  categoryStats: Array<{
    category: string;
    groups: number;
    participants: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchAnalytics();
  }, [isLoaded, isSignedIn, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/analytics");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת הנתונים");
      }

      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הנתונים");
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

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <Typography>אין נתונים להצגה</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a2a5a" }}>
          נתונים וגרפים
        </Typography>

        {/* Summary Cards */}
        <Box
          sx={{
            mb: 4,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  סה"כ קבוצות
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
                  {data.summary.totalGroups}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  סה"כ משתתפים
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
                  {data.summary.totalParticipants}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  סה"כ הכנסות
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
                  ₪{data.summary.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  קבוצות פתוחות
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
                  {data.summary.openGroups}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Charts */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {data.monthlyRevenue.length > 0 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    הכנסות חודשיות (6 חודשים אחרונים)
                  </Typography>
                  <Box sx={{ p: 2 }}>
                    {data.monthlyRevenue.map((item) => (
                      <Box key={item.month} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.month}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          ₪{item.revenue.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    הערה: להתקנת גרפים, התקן את חבילת recharts
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {data.categoryStats.length > 0 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    הכנסות לפי קטגוריה
                  </Typography>
                  <Box sx={{ p: 2 }}>
                    {data.categoryStats.map((stat) => (
                      <Box key={stat.category} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.category}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          ₪{stat.revenue.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.groups} קבוצות, {stat.participants} משתתפים
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}

