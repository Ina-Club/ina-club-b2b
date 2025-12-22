// "use client";

// import { useState, useEffect } from "react";
// import { signIn, getSession } from "next-auth/react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Box, Button, TextField, Typography, Stack, Alert, CircularProgress, Link as MuiLink } from "@mui/material";
// import NextLink from "next/link";
// import Header from "@/components/header/header";
// import Footer from "@/components/footer/footer";

// export default function SignInPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
//   const [error, setError] = useState<string>("");
//   const [infoMessage, setInfoMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const message = searchParams.get('message');
//     if (message === 'login_required') {
//       setInfoMessage('עליך להתחבר כדי לגשת לפאנל הניהול');
//     }
//   }, [searchParams]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("loading");
//     setError("");

//     try {
//       const res = await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//         callbackUrl: "/dashboard"
//       });

//       if (res?.ok) {
//         setStatus("success");
//         setTimeout(async () => {
//           const session = await getSession();
//           if (session) {
//             // Check if user has B2B package
//             try {
//               const packageRes = await fetch("/api/user/b2b-package");
//               if (packageRes.status === 404) {
//                 // No package found, redirect to package selection
//                 router.push("/packages");
//               } else {
//                 router.push("/dashboard");
//               }
//             } catch {
//               // If check fails, go to dashboard anyway
//               router.push("/dashboard");
//             }
//           } else {
//             setTimeout(() => {
//               router.push("/dashboard");
//             }, 1000);
//           }
//         }, 500);
//       } else {
//         setStatus("error");
//         setError(res?.error || "אימייל או סיסמה אינם נכונים");
//       }
//     } catch (err) {
//       setStatus("error");
//       setError("אירעה שגיאה בהתחברות. אנא נסה שוב.");
//     }
//   };

//   return (
//     <>
//       <Header />
//       <Box
//         sx={{
//           maxWidth: 420,
//           mx: "auto",
//           mt: 8,
//           mb: 8,
//           p: 4,
//           border: "1px solid #ddd",
//           borderRadius: 2
//         }}
//       >
//         <Typography variant="h5" mb={3}>התחברות</Typography>

//         <Stack spacing={2} component="form" onSubmit={handleSubmit}>
//           <TextField label="אימייל" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
//           <TextField label="סיסמה" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
//           <Button type="submit" variant="contained" color="primary" disabled={status === "loading"} fullWidth>
//             {status === "loading" ? <CircularProgress size={20} color="inherit" /> : "התחבר"}
//           </Button>
//         </Stack>

//         {status === "error" && (
//           <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
//         )}

//         {status === "success" && (
//           <Alert severity="success" sx={{ mt: 2 }}>
//             התחברות בהצלחה! מעביר אותך...
//           </Alert>
//         )}

//         {infoMessage && (
//           <Alert severity="info" sx={{ mt: 2 }}>{infoMessage}</Alert>
//         )}

//         <Typography variant="body2" align="center" my={2}>או</Typography>

//         <Button
//           variant="outlined"
//           color="secondary"
//           fullWidth
//           onClick={async () => {
//             const res = await signIn("google", { redirect: false, callbackUrl: "/dashboard" });
//             if (res?.ok) {
//               // Check for B2B package after Google sign in
//               setTimeout(async () => {
//                 try {
//                   const packageRes = await fetch("/api/user/b2b-package");
//                   if (packageRes.status === 404) {
//                     router.push("/packages");
//                   } else {
//                     router.push("/dashboard");
//                   }
//                 } catch {
//                   router.push("/dashboard");
//                 }
//               }, 1000);
//             }
//           }}
//         >
//           המשך עם Google
//         </Button>

//         <Typography variant="body2" align="center" mt={2}>
//           חדש/ה כאן? {" "}
//           <MuiLink component={NextLink} href="/auth/signup">הירשם כאן</MuiLink>
//         </Typography>
//       </Box>
//       <Footer />
//     </>
//   );
// }
import { SignIn } from "@clerk/nextjs";
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
        <SignIn
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
                boxShadow:
                  "0 10px 25px rgba(0, 0, 0, 0.08)",
              },

              /* Header */
              headerTitle: {
                textAlign: "right",
                color: "#1a2a5a",
                fontWeight: "700",
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

              /* Links */
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
