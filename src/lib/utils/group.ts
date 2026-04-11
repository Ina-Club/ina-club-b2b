// TODO: move to monorepo!!!
import { GroupStatus } from "@/lib/types/status";

export const statusToLabelAndColorMap: Record<GroupStatus,
  { label: string,
    color: "info" | "success" | "default" | "error" | "warning"
  }> = {
  OPEN: {
    label: "פתוחה (לא הופעלה)",
    color: "info"
  },
  ACTIVATED: {
    label: "פעילה",
    color: "warning"
  },
  RESOLVED: {
    label: "סגורה (חויבה)",
    color: "success"
  },
  CANCELED: {
    label: "בוטלה",
    color: "error"
  },
  EXPIRED: {
    label: "פג תוקף",
    color: "error"
  },
  PENDING: {
    label: "ממתינה",
    color: "warning"
  },
  PREVIEW: {
    label: "תצוגה מקדימה",
    color: "info"
  },
};
