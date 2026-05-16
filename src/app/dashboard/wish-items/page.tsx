"use client";

import { Box, Typography, Card, CardContent } from "@mui/material";
import { Construction } from "@mui/icons-material";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { motion } from "framer-motion";

export default function WishItemsPage() {
  return (
    <DashboardLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          px: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              maxWidth: 500,
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              overflow: "visible",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "#f0a868",
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(240, 168, 104, 0.4)",
              }}
            >
              <Construction sx={{ fontSize: 40, color: "#1a2a5a" }} />
            </Box>

            <CardContent sx={{ pt: 8, pb: 6, px: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#1a2a5a",
                  mb: 2,
                }}
              >
                בקרוב מאוד!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                אנחנו עובדים על פיצ'ר ה-Wish Items כדי שתוכלו לראות בדיוק מה הלקוחות שלכם רוצים לקנות.
                <br />
                בקרוב תוכלו לקבל תובנות חכמות ולפתוח קבוצות רכישה מדויקות יותר.
              </Typography>
              
              <Box
                sx={{
                  display: "inline-block",
                  px: 3,
                  py: 1,
                  bgcolor: "rgba(240, 168, 104, 0.1)",
                  borderRadius: 10,
                  border: "1px dashed #f0a868",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#f0a868", fontWeight: "bold" }}
                >
                  בפיתוח...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
}
