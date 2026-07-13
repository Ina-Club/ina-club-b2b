"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Group,
  RequestQuote,
  BarChart,
  People,
  Business,
} from "@mui/icons-material";

const drawerWidth = 280;

const menuItems = [
  {
    id: "overview",
    label: "סקירה כללית",
    icon: Dashboard,
    path: "/dashboard",
    exact: true,
  },
  {
    id: "groups",
    label: "הקבוצות שלי",
    icon: Group,
    path: "/dashboard/groups",
  },
  {
    id: "wish-items",
    label: "מוצרים מבוקשים",
    icon: RequestQuote,
    path: "/dashboard/wish-items",
  },
  {
    id: "analytics",
    label: "נתונים וגרפים",
    icon: BarChart,
    path: "/dashboard/analytics",
  },
  {
    id: "participants",
    label: "משתתפים",
    icon: People,
    path: "/dashboard/participants",
  },
  {
    id: "company",
    label: "פרטי החברה",
    icon: Business,
    path: "/dashboard/company",
  },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
  variant?: "permanent" | "persistent" | "temporary";
}

export default function DashboardSidebar({
  open = true,
  onClose,
  variant = "permanent",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant === "temporary" && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
          Ina Club B2B
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = (item as any).exact 
            ? pathname === item.path 
            : pathname === item.path || pathname.startsWith(item.path + "/");
          
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive ? "#1a2a5a" : "transparent",
                  color: isActive ? "#fff" : "#1a2a5a",
                  "&:hover": {
                    backgroundColor: isActive ? "#243a7a" : "#f5f5f5",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#fff" : "#1a2a5a",
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (variant === "permanent") {
    return (
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderLeft: "1px solid #e0e0e0",
            position: "relative",
            height: "100%",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={variant}
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: { xs: "min(280px, 86vw)", sm: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "min(280px, 86vw)", sm: drawerWidth },
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
