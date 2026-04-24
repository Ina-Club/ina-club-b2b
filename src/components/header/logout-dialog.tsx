"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";


export default function LogoutDialog({
  open,
  onClose,
  handleLogout,
}: {
  open: boolean;
  onClose: () => void;
  handleLogout: () => void;
}) {



  return (
    <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          התנתק מהמערכת
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ marginY: "16px" }}>
            האם אתה בטוח שברצונך להתנתק?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: "16px" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: "8px" }}
          >
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              backgroundColor: "#1a2a5a",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#243a7a" },
            }}
          >
            התנתק
          </Button>
        </DialogActions>
      </Dialog>
  );
}
