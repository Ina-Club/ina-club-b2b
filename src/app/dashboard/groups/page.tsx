"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { Add, Visibility, Edit } from "@mui/icons-material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import { ActiveGroup } from "@/lib/types/group";
import { statusToLabelAndColorMap } from "@/lib/utils/group";
import { GroupStatus } from "@/lib/types/status";

export default function GroupsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    fetchGroups();
  }, [isLoaded, isSignedIn, router]);

  const displayedGroups = activeGroups.filter(
    (g) => selectedStatuses.length === 0 || selectedStatuses.includes(g.status)
  );

  const availableStatuses = Object.keys(statusToLabelAndColorMap);

  const handleStatusChange = (event: SelectChangeEvent<typeof selectedStatuses>) => {
    const {
      target: { value },
    } = event;
    // This check is a type guard to ensure that the value is an array
    setSelectedStatuses(typeof value === "string" ? value.split(",") : value);
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/active-groups/my-groups");
      
      if (!res.ok) {
        throw new Error("שגיאה בטעינת הקבוצות");
      }

      const data = await res.json();
      setActiveGroups(data.activeGroups || []);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת הקבוצות");
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
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
            הקבוצות שלי
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="status-filter-label">סנן לפי סטטוס</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                multiple
                value={selectedStatuses}
                onChange={handleStatusChange}
                input={<OutlinedInput label="סנן לפי סטטוס" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={(statusToLabelAndColorMap as any)[value]?.label} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={selectedStatuses.indexOf(status) > -1} />
                    <ListItemText primary={(statusToLabelAndColorMap as any)[status]?.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              href="/dashboard/create-group"
              sx={{
                backgroundColor: "#1a2a5a",
                "&:hover": { backgroundColor: "#243a7a" },
              }}
            >
              צור קבוצה חדשה
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {displayedGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                אין קבוצות להצגה
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                לא נמצאו קבוצות בסטטוסים המבוקשים
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>כותרת</TableCell>
                  <TableCell>קטגוריה</TableCell>
                  <TableCell>מחיר בסיסי</TableCell>
                  <TableCell>מחיר קבוצה</TableCell>
                  <TableCell>משתתפים</TableCell>
                  <TableCell>תאריך יעד</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.title}</TableCell>
                    <TableCell>{group.category}</TableCell>
                    <TableCell>₪{group.basePrice.toFixed(2)}</TableCell>
                    <TableCell>₪{group.groupPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {group.participantsCount}
                      {group.maxParticipants && ` / ${group.maxParticipants}`}
                    </TableCell>
                    <TableCell>
                      {new Date(group.deadline).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusToLabelAndColorMap[group.status].label}
                        color={statusToLabelAndColorMap[group.status].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        href={`/dashboard/groups/${group.id}/participants`}
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      {group.status === GroupStatus.OPEN || group.status === GroupStatus.ACTIVATED ? (
                        <IconButton
                          component={Link}
                          href={`/dashboard/groups/${group.id}/edit`}
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="inherit"
                          size="small"
                          disabled
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DashboardLayout>
  );
}

