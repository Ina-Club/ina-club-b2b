"use client";

import { AppBar, Toolbar, Box, Tabs, Tab, Button, Dialog } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { SignedIn, SignedOut, UserButton, SignIn } from "@clerk/nextjs";

const SCROLL_SECTIONS = [
  { id: "why-us", label: "למה לבחור בנו?" },
  { id: "pricing", label: "תוכניות ותמחור" },
  { id: "contact", label: "צור קשר" },
];

export default function Header() {
  const [currentTab, setCurrentTab] = useState(0);
  const [openAuth, setOpenAuth] = useState(false);

  const handleTabClick = useCallback((index: number, id: string) => {
    setCurrentTab(index);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ===== HEADER ===== */}
      <AppBar
        position="sticky"
        sx={{
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/">
            <Image
              src="/InaClubLogo.png"
              alt="Ina Club"
              width={90}
              height={60}
            />
          </Link>

          {/* Tabs */}
          <Tabs value={currentTab}>
            {SCROLL_SECTIONS.map((item, i) => (
              <Tab
                key={item.id}
                label={item.label}
                onClick={() => handleTabClick(i, item.id)}
                sx={{
                  fontWeight: 600,
                  color: "#1a2a5a",
                  textTransform: "none",
                }}
              />
            ))}
          </Tabs>

          {/* Auth buttons */}
          <SignedOut>
            <Button
              variant="contained"
              onClick={() => {
                setOpenAuth(true);
              }}
              sx={authContained}
            >
              התחבר
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* ===== AUTH DIALOG ===== */}
      <Dialog
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Box>
          <SignIn
            appearance={clerkAppearance}
            routing="virtual"
          />
        </Box>
      </Dialog>
    </>
  );
}

/* ===== STYLES ===== */

const authOutlined = {
  color: "#1a2a5a",
  borderColor: "#1a2a5a",
  borderRadius: "10px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#1a2a5a",
    color: "#fff",
  },
};

const authContained = {
  backgroundColor: "#1a2a5a",
  borderRadius: "10px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#243a7a",
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#1a2a5a",
    borderRadius: "10px",
    fontFamily: '"Inter", sans-serif',
  },
  elements: {
    footerAction: { display: "none" },
    card: {
      direction: "rtl",
      textAlign: "right",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    },
    headerTitle: {
      textAlign: "right",
      color: "#1a2a5a",
      fontWeight: "700",
    },
    headerSubtitle: {
      textAlign: "right",
      color: "#6b7280",
    },
    formFieldInput: {
      direction: "rtl",
      textAlign: "right",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      "&:focus": {
        borderColor: "#1a2a5a",
        boxShadow: "0 0 0 2px rgba(26,42,90,0.15)",
      },
    },
    formFieldLabel: {
      textAlign: "right",
      fontWeight: 500,
      color: "#374151",
    },
    formButtonPrimary: {
      backgroundColor: "#1a2a5a",
      fontWeight: 600,
      "&:hover": {
        backgroundColor: "#243a7a",
      },
    },
    socialButtonsBlockButton: {
      borderRadius: "8px",
      border: "1px solid #d1d5db",
    },
    footerPageLink: {
      color: "#1a2a5a",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    spinner: {
      color: "#1a2a5a",
    },
  },
};
