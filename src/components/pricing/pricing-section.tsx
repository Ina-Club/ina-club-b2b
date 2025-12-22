"use client";

import { Box, Typography, Grid, Container } from "@mui/material";
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
          ככל שהחבילה מתקדמת יותר – אתם מקבלים יותר כוח, יותר קבוצות ויותר
          אפשרויות
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {PRICING_PLANS.map((plan) => (
            <Grid key={plan.id} xs={12} md={4} item={true}>
              <PricingCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
