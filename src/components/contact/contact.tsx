"use client";

import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import { Email, LocationOn } from "@mui/icons-material";
import { motion } from "framer-motion";

const CONTACT_INFO = [
  {
    icon: <Email sx={{ color: "#1a2a5a", fontSize: 30 }} />,
    title: "אימייל",
    content: "support@inaclub.co.il",
    link: "mailto:support@inaclub.co.il",
  },
  {
    icon: <LocationOn sx={{ color: "#1a2a5a", fontSize: 30 }} />,
    title: "כתובת",
    content: "רחוב הברזיל 12, תל אביב",
    link: null,
  },
];

export default function ContactSection() {
  return (
    <Box id="contact" sx={{ py: 12, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ color: "#1a2a5a", fontWeight: 700 }}
          >
            צור קשר
          </Typography>
          <Typography variant="body1" color="text.secondary">
            אנחנו כאן לכל שאלה, תמיכה או התייעצות לגבי החבילות שלנו
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" }, 
            gap: 4, 
            justifyContent: "center",
            alignItems: "stretch"
          }}
        >
          {CONTACT_INFO.map((item, index) => (
            <Box key={index} sx={{ flex: 1, maxWidth: { md: 450 } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                style={{ height: "100%" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid #eef2ff",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 6 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        bgcolor: "rgba(26, 42, 90, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: "#1a2a5a", mb: 1, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ 
                        color: "#475569", 
                        textDecoration: item.link ? "none" : "inherit",
                        cursor: item.link ? "pointer" : "default"
                      }}
                      component={item.link ? "a" : "p"}
                      href={item.link || undefined}
                    >
                      {item.content}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
