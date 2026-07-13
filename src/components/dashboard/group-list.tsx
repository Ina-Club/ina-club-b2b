import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";
import Link from "next/link";
import { ActiveGroup } from "@/lib/types/group";
import { statusToLabelAndColorMap } from "@/lib/utils/group";
import { GroupStatus } from "@/lib/types/status";

interface GroupListProps {
  groups: ActiveGroup[];
}

export default function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h2" gutterBottom>
            אין קבוצות פעילות
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            צרו קבוצה חדשה כדי להתחיל
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 760 }}>
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
          {groups.map((group) => (
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
                {/* For now, editing a group is disabled */}
                {/* {group.status === GroupStatus.OPEN || group.status === GroupStatus.ACTIVATED ? (
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
                )} */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
