"use client";

import { useState } from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { Menu } from "@mui/icons-material";
import DashboardSidebar from "./dashboard-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <DashboardSidebar />
      </Box>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fff",
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 2 }}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="פתח תפריט"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a2a5a" }}>
            Ina Club B2B
          </Typography>
        </Toolbar>
      </AppBar>
      <DashboardSidebar
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          pt: { xs: 10, md: 3 },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
