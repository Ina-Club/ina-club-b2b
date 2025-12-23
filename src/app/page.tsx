"use client";

import {
  Box,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { Business, People, Analytics, Security } from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import PricingSection from "@/components/pricing/pricing-section";

// שלבים של "איך זה עובד"
const steps = [
  {
    title: "התחברות",
    description:
      "התחבר למערכת או הירשם אם אתה חדש. אם אין לך חבילה, תוכל לבחור אחת המתאימה לעסק שלך.",
    icon: <Business sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />,
  },
  {
    title: "יצירת קבוצות",
    description:
      "צור קבוצות פעילות חדשות, הגדר מחירים, תאריכי יעד ומגבלות משתתפים. הכל במקום אחד.",
    icon: <Analytics sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />,
  },
  {
    title: "ניהול משתתפים",
    description:
      "צפה בכל הפרטים של המשתתפים: שם מלא, אימייל, טלפון וכל המידע הרלוונטי בטבלה מאורגנת.",
    icon: <People sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />,
  },
  {
    title: "מעקב בזמן אמת",
    description:
      "עקוב אחר התקדמות הקבוצות שלך, מספר המשתתפים והסטטוס של כל קבוצה בלוח הבקרה.",
    icon: <Security sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />,
  },
];

// חברות שעובדות איתנו
const partners = [
  { name: "SmartBuy", category: "גאדג'טים ואלקטרוניקה" },
  { name: "HomeDeal", category: "מוצרי בית ומטבח" },
  { name: "EcoMarket", category: "מוצרים אקולוגיים" },
  { name: "StyleHub", category: "אופנה ולייף סטייל" },
  { name: "FitGear", category: "ציוד ספורט" },
  { name: "BabyPlus", category: "מוצרי תינוקות" },
];

// המלצות מלקוחות
const testimonials = [
  {
    company: "MoveWell",
    role: "מנהלת רשת סטודיואים",
    quote:
      "Ina Club B2B נתן לנו שליטה מלאה ברישומים ובתזמון השיעורים. עברנו שבוע בלבד עד שהצוות הסתגל.",
    name: "שירי כהן",
  },
  {
    company: "Pulse Pro",
    role: "מנהל תפעול",
    quote:
      "הדוחות בזמן אמת והטבלאות ברורים. סוף סוף רואים את התפוסה וההכנסות בלי אקסלים.",
    name: "עידו שחר",
  },
  {
    company: "Breathe Studio",
    role: "בעלים",
    quote:
      "התמיכה מעולה והמערכת אינטואיטיבית. כל המדריכים שלנו עובדים עם אותה שפה ומבינים מה קורה.",
    name: "אלה פרידמן",
  },
];

// סרטוני הסבר
const tutorialVideos = [
  {
    title: "סיור מהיר בממשק",
    description: "היכרות עם מסך הבית, ניווט ונקודות עיקריות",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    title: "ניהול קבוצות והקצאת מדריכים",
    description: "איך לפתוח קבוצות, להגדיר תמחור ולחבר מדריך",
    url: "https://www.youtube.com/embed/5NV6Rdv1a3I",
  },
  {
    title: "מעקב משתתפים ותשלומים",
    description: "סינון, חיפוש וייצוא נתונים מהטבלאות",
    url: "https://www.youtube.com/embed/fJ9rUzIMcZQ",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          position: "relative",
          bgcolor: "#1a2a5a",
          color: "white",
          overflow: "hidden",
          background:
            "linear-gradient(140deg,rgba(255, 255, 255, 1) 0%, rgba(211, 224, 235, 1) 100%)",
          py: { xs: 10, md: 14 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 80,
              left: 40,
              width: 288,
              height: 288,
              bgcolor: "#f0a868",
              borderRadius: "50%",
              filter: "blur(96px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 80,
              right: 40,
              width: 384,
              height: 384,
              bgcolor: "#1a2a5a",
              borderRadius: "50%",
              filter: "blur(96px)",
            }}
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            textAlign: "center",
            maxWidth: 1280,
            mx: "auto",
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { md: "3.75rem", xs: "2.4rem" },
              lineHeight: 1.2,
              mb: 2,
              color: "#1a2a5a",
            }}
          >
            פאנל ניהול עסקי
            <Box
              component="span"
              sx={{
                display: "block",
                fontSize: { md: "3.75rem", xs: "2.4rem" },
                color: "#f0a868",
              }}
            >
              Ina Club B2B
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#1a2a5a",
              mb: 4,
              fontSize: { md: "1.5rem", xs: "1rem" },
            }}
          >
            ניהול פשוט ויעיל של קבוצות פעילות. צור קבוצות, עקוב אחר משתתפים וצפה
            בכל הפרטים בטבלה מאורגנת.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              mb: 6,
            }}
          >
            <Button
              variant="contained"
              component={Link}
              href="/auth/signin"
              startIcon={<Business />}
              sx={{
                bgcolor: "#f0a868",
                color: "#1a2a5a",
                px: 2,
                py: 2,
                width: { md: "15rem", xs: "80%" },
                gap: 2,
                borderRadius: 3,
                fontWeight: "bold",
                "&:hover": { bgcolor: "#eeb17e" },
              }}
            >
              התחל עכשיו
            </Button>
          </Box>
        </Box>
      </Box>

      {/* איך זה עובד Section עם אנימציות */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            איך זה עובד?
          </Typography>
          <Typography variant="h4" color="text.secondary" sx={{ mt: 2 }}>
            שלבים פשוטים לניהול קבוצות פעילות
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
            mb: 6,
            justifyItems: "center",
          }}
        >
          {steps.map((step, index) => (
            <Box key={index} sx={{ width: "100%" }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                style={{ height: "100%" }} // גובה מלא לאנימציה
              >
                <Card
                  sx={{
                    height: "100%", // מבטיח ששני הכרטיסים בשורה יהיו באותו גובה
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "center",
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "#1a2a5a" }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>

        {/* קו התקדמות */}
        <Box
          sx={{
            position: "relative",
            height: 6,
            bgcolor: "#e0e0e0",
            borderRadius: 3,
            mx: "auto",
            maxWidth: 600,
            mb: 8,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 2 }}
            style={{
              height: "100%",
              background: "#f0a868",
              borderRadius: 3,
            }}
          />
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            מוכן להתחיל?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            התחבר או הירשם כדי להתחיל לנהל את הקבוצות הפעילות שלך
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/auth/signin"
            sx={{ px: 4, py: 1.5 }}
          >
            התחל עכשיו
          </Button>
        </Box>
      </Container>

      {/* חברות שעובדות איתנו */}
      <Box sx={{ background: "linear-gradient(135deg,#f8fafc,#eef2ff)" }}>
        <Container maxWidth="lg" sx={{ py: 12 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              החברות שכבר איתנו
            </Typography>
            <Typography variant="body1" color="text.secondary">
              מותגי כושר, סטודיואים וקליניקות שסומכים על Ina Club B2B לניהול
              היומיומי
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,1fr)",
                md: "repeat(3,1fr)",
              },
              gap: 3,
            }}
          >
            {partners.map((partner) => (
              <Box key={partner.name}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    height: "100%",
                    bgcolor: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        mx: "auto",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" sx={{ color: "#1a2a5a", mb: 1 }}>
                      {partner.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {partner.category}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      {/* המלצות */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            רואים איך זה עובד – ושומעים מה הלקוחות חושבים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            סרטוני הדרכה קצרים לצד חוות דעת אמיתיות ממנהלי סטודיואים ועסקים
          </Typography>
        </Box>

        {/* חלק עליון – וידאו + המלצות */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 4,
            mb: 6,
          }}
        >
          {/* וידאו ראשי */}
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 4 }}>
            <Box sx={{ position: "relative", pt: "56.25%", bgcolor: "#000" }}>
              <Box
                component="iframe"
                src={tutorialVideos[0].url}
                title={tutorialVideos[0].title}
                allowFullScreen
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </Box>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#1a2a5a" }}>
                {tutorialVideos[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutorialVideos[0].description}
              </Typography>
            </CardContent>
          </Card>

          {/* המלצות */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {testimonials.slice(0, 3).map((item, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "#f8fafc",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography sx={{ mb: 2, color: "#1a2a5a" }}>
                    “{item.quote}”
                  </Typography>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.role} · {item.company}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* סרטונים נוספים */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 4,
          }}
        >
          {tutorialVideos.slice(1).map((video, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "relative", pt: "56.25%", bgcolor: "#000" }}>
                <Box
                  component="iframe"
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              </Box>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: "#1a2a5a" }}>
                  {video.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>


      {/* ✅ Pricing Section */}
      <PricingSection />
    </>
  );
}
