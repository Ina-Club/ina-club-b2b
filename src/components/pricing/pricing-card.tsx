"use client";

import { useState } from "react";
import { Card, Box, Typography, Button } from "@mui/material";
import { PricingPlan } from "./pricing.config";
import PackageSelectionDialog from "./package-selection-dialog";

export default function PricingCard({ plan }: { plan: PricingPlan }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Card
      sx={{
        position: "relative",
        p: 4,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 420, // ✅ קובע גובה אחיד לכרטיסים
        transition: "all .3s ease",
        border: plan.highlighted
          ? "2px solid #f0a868"
          : "1px solid #e5e7eb",
        transform: plan.highlighted ? "scale(1.05)" : "scale(1)",
        "&:hover": {
          transform: "scale(1.08)",
          boxShadow: "0 25px 50px rgba(0,0,0,.15)",
        },
      }}
    >
      {/* הכי משתלם */}
      {plan.highlighted && (
        <Box
          sx={{
            position: "absolute",
            top:-5,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "#f0a868",
            color: "#1a2a5a",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          הכי משתלם
        </Box>
      )}

      <Box sx={{ mt: 0 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a2a5a">
          {plan.title}
        </Typography>

        <Typography sx={{ my: 2, fontSize: "2rem", fontWeight: "bold" }}>
          ₪{plan.price}
          <Box component="span" sx={{ fontSize: "1rem", color: "#6b7280" }}>
            {plan.duration === "monthly" ? " / חודש" : " / שנה"}
          </Box>
        </Typography>

        {plan.freeMonths && (
          <Typography color="#f0a868" fontWeight="bold" mb={1}>
            {plan.freeMonths} חודשים ראשונים חינם 🎁
          </Typography>
        )}

        <Box sx={{ my: 3 }}>
          <Typography>✔ {plan.groupsPerMonth} קבוצות חדשות בחודש</Typography>
          <Typography>✔ עד {plan.itemsPerGroup} פריטים בכל קבוצה</Typography>
          <Typography>✔ ניהול משתתפים מתקדם</Typography>
          <Typography>✔ תמיכה מועדפת</Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={() => setDialogOpen(true)}
        sx={{
          bgcolor: "#1a2a5a",
          borderRadius: 3,
          py: 1.5,
          fontWeight: "bold",
          mt: 2,
          "&:hover": { bgcolor: "#243a7a" },
        }}
      >
        בחר חבילה
      </Button>

      <PackageSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        plan={plan}
      />
    </Card>
  );
}
