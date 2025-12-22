// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Box, Button, TextField, Typography, Stack, Alert, CircularProgress, Card, CardContent, Grid } from "@mui/material";
// import Header from "@/components/header/header";
// import Footer from "@/components/footer/footer";
// import { PackageType } from "@prisma/client";

// const PACKAGES = [
//   {
//     type: PackageType.BASIC,
//     name: "חבילה בסיסית",
//     price: 299,
//     maxGroups: 5,
//     features: ["עד 5 קבוצות פעילות", "ניהול משתתפים", "תמיכה בסיסית"],
//   },
//   {
//     type: PackageType.PREMIUM,
//     name: "חבילה מתקדמת",
//     price: 599,
//     maxGroups: 20,
//     features: ["עד 20 קבוצות פעילות", "ניהול משתתפים", "תמיכה מתקדמת", "דוחות מפורטים"],
//   },
//   {
//     type: PackageType.ENTERPRISE,
//     name: "חבילת ארגון",
//     price: 1299,
//     maxGroups: 999,
//     features: ["קבוצות פעילות ללא הגבלה", "ניהול משתתפים", "תמיכה 24/7", "דוחות מתקדמים", "API מותאם אישית"],
//   },
// ];

// export default function SignUpPage() {
//   const router = useRouter();
//   const [step, setStep] = useState<"form" | "package">("form");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [phone, setPhone] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
//   const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
//   const [error, setError] = useState<string>("");

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("loading");
//     setError("");

//     try {
//       const res = await fetch("/api/auth/check-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (data.exists) {
//         setStatus("error");
//         setError("משתמש עם אימייל זה כבר קיים. אנא התחבר במקום.");
//       } else {
//         setStep("package");
//         setStatus("idle");
//       }
//     } catch (err) {
//       setStatus("error");
//       setError("אירעה שגיאה. אנא נסה שוב.");
//     }
//   };

//   const handlePackageSelect = async (pkg: PackageType) => {
//     setSelectedPackage(pkg);
//     setStatus("loading");
//     setError("");

//     try {
//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           email,
//           password,
//           phone,
//           packageType: pkg,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         router.push("/auth/signin?message=signup_success");
//       } else {
//         setStatus("error");
//         setError(data.error || "אירעה שגיאה בהרשמה");
//       }
//     } catch (err) {
//       setStatus("error");
//       setError("אירעה שגיאה בהרשמה. אנא נסה שוב.");
//     }
//   };

//   return (
//     <>
//       <Header />
//       <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, mb: 8, px: 2 }}>
//         {step === "form" ? (
//           <Box sx={{ maxWidth: 420, mx: "auto", p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
//             <Typography variant="h5" mb={3}>הרשמה</Typography>

//             <Stack spacing={2} component="form" onSubmit={handleFormSubmit}>
//               <TextField label="שם מלא" value={name} onChange={e => setName(e.target.value)} required fullWidth />
//               <TextField label="אימייל" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
//               <TextField label="טלפון" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
//               <TextField label="סיסמה" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
//               <Button type="submit" variant="contained" color="primary" disabled={status === "loading"} fullWidth>
//                 {status === "loading" ? <CircularProgress size={20} color="inherit" /> : "המשך לבחירת חבילה"}
//               </Button>
//             </Stack>

//             {status === "error" && (
//               <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
//             )}
//           </Box>
//         ) : (
//           <Box>
//             <Typography variant="h4" align="center" mb={4}>
//               בחר חבילה
//             </Typography>
//             <Grid container spacing={3}>
//               {PACKAGES.map((pkg) => (
//                 <Grid item xs={12} md={4} key={pkg.type}>
//                   <Card
//                     sx={{
//                       height: "100%",
//                       cursor: "pointer",
//                       border: selectedPackage === pkg.type ? "2px solid #1a2a5a" : "1px solid #BED6E9",
//                       "&:hover": { borderColor: "#1a2a5a" },
//                     }}
//                     onClick={() => handlePackageSelect(pkg.type)}
//                   >
//                     <CardContent>
//                       <Typography variant="h5" gutterBottom>
//                         {pkg.name}
//                       </Typography>
//                       <Typography variant="h4" color="primary" gutterBottom>
//                         ₪{pkg.price}/חודש
//                       </Typography>
//                       <Box sx={{ mt: 2 }}>
//                         {pkg.features.map((feature, idx) => (
//                           <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
//                             ✓ {feature}
//                           </Typography>
//                         ))}
//                       </Box>
//                       <Button
//                         variant={selectedPackage === pkg.type ? "contained" : "outlined"}
//                         fullWidth
//                         sx={{ mt: 2 }}
//                         disabled={status === "loading"}
//                       >
//                         {status === "loading" && selectedPackage === pkg.type ? (
//                           <CircularProgress size={20} color="inherit" />
//                         ) : (
//                           "בחר חבילה זו"
//                         )}
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>

//             {status === "error" && (
//               <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
//             )}

//             <Box sx={{ textAlign: "center", mt: 2 }}>
//               <Button onClick={() => setStep("form")}>חזור</Button>
//             </Box>
//           </Box>
//         )}
//       </Box>
//       <Footer />
//     </>
//   );
// }
import { SignUp } from "@clerk/nextjs";
import { Box, Container } from "@mui/material";

export default async function Page() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
      }}
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#1a2a5a",
            borderRadius: "10px",
            fontFamily: '"Inter", sans-serif',
          },
          elements: {
            /* Main card */
            card: {
              direction: "rtl",
              textAlign: "right",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            },

            /* Header */
            headerTitle: {
              textAlign: "right",
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1a2a5a",
            },
            headerSubtitle: {
              textAlign: "right",
              color: "#6b7280",
            },

            /* Inputs */
            formFieldInput: {
              direction: "rtl",
              textAlign: "right",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:focus": {
                borderColor: "#1a2a5a",
                boxShadow: "0 0 0 2px rgba(26, 42, 90, 0.15)",
              },
            },

            formFieldLabel: {
              textAlign: "right",
              fontWeight: "500",
              color: "#374151",
            },

            /* Primary button */
            formButtonPrimary: {
              backgroundColor: "#1a2a5a",
              borderRadius: "8px",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#243a7a",
              },
            },

            /* Social login buttons */
            socialButtonsBlockButton: {
              borderRadius: "8px",
              border: "1px solid #1a2a5a",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            },

            /* Footer links */
            footerPageLink: {
              color: "#1a2a5a",
              fontWeight: "500",
              "&:hover": {
                textDecoration: "underline",
              },
            },

            /* Spinner */
            spinner: {
              color: "#1a2a5a",
            },
          },
        }}
      />
    </Box>
  );
}
