"use client";

import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

export default function Footer() {
  const theme = useTheme();
  const INA_CLUB_INSTAGRAM_URL = "https://www.instagram.com/inaclub.official"

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: "white",
        py: { xs: 3, md: 6 },
        mt: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 5 }}>
          {/* מידע על החברה */}
          <Box sx={{ flex: { xs: "none", md: 1 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              InaClub
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              הפלטפורמה המובילה בישראל לרכישות קבוצתיות חכמות.
              חסוך כסף על המוצרים שאתה אוהב עם אלפי קונים נוספים.
            </Typography>

            {/* רשתות חברתיות */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                }}
                aria-label="אינסטגרם"
                href={INA_CLUB_INSTAGRAM_URL}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Box>

          {/* מידע ליצירת קשר */}
          <Box sx={{ flex: { xs: "none", md: 1 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              צור קשר
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  info@inaclub.co.il
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  03-1234567
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  תל אביב, ישראל
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.2)" }} />

        {/* זכויות יוצרים */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} כל הזכויות שמורות לחברת Ina Innovations Ltd.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: "block" }}>
            פלטפורמת רכישות קבוצתיות חכמות לכלל האוכלוסייה בישראל
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
