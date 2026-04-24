"use client";

import { AppBar, Toolbar, Tabs, Tab, Button, useMediaQuery } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LogoutDialog from "./logout-dialog";

const SCROLL_SECTIONS = [
  { id: "how-does-it-work", label: "איך זה עובד?" },
  { id: "pricing", label: "תוכניות ותמחור" },
  { id: "contact", label: "צור קשר" },
];

export default function Header() {
  const [currentTab, setCurrentTab] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const router = useRouter();

  const handleTabClick = useCallback((index: number, id: string) => {
    setCurrentTab(index);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const performLogout = async () => {
    await signOut();
    setLogoutDialogOpen(false);
    router.push("/");
  };

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
          {!isSignedIn && !isMobile && (
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
          )}

          {/* Auth buttons */}
          <SignedOut>
            <Button
              variant="contained"
              onClick={() => { router.push("/sign-in"); }}
              sx={authContained}
            >
              התחבר
            </Button>
          </SignedOut>

          <SignedIn>
             <Button
              variant="outlined"
              onClick={() => { handleLogout(); }}
            >
              התנתק
            </Button>
          </SignedIn>
        </Toolbar>
      </AppBar>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        handleLogout={performLogout}
      />
    </>
  );
}

/* ===== STYLES ===== */

const authContained = {
  backgroundColor: "#1a2a5a",
  borderRadius: "10px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#243a7a",
  },
};
