"use client";

import { Box, Typography, Container } from "@mui/material";
import { PRICING_PLANS } from "./pricing.config";
import PricingCard from "./pricing-card";

export default function PricingSection() {
  return (
    <Box
      id="pricing"
      sx={{
        py: 12,
        background: "linear-gradient(135deg,#f8fafc,#eef2ff)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          color="#1a2a5a"
          mb={2}
        >
          בחרו את החבילה שמתאימה לעסק שלכם
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          mb={8}
        >
          ככל שהחבילה מתקדמת יותר – אתם מקבלים יותר קבוצות ויותר אפשרויות
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {PRICING_PLANS.map((plan) => (
            <Box key={plan.id}>
              <PricingCard plan={plan} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
