import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { Security, Logout } from "@mui/icons-material";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 12 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "error.lighter",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 4,
                        color: "error.main",
                    }}
                >
                    <Security sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: "#1a2a5a" }}>
                    הגישה נדחתה
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: "1.1rem" }}>
                    חשבון זה אינו רשום במערכת Ina Club B2B.
                    אנא צור קשר עם מנהל המערכת להוספת החשבון שלך.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <SignOutButton>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Logout />}
                            fullWidth
                            sx={{
                                bgcolor: "#1a2a5a",
                                py: 1.5,
                                borderRadius: 2,
                                "&:hover": { bgcolor: "#243a7a" },
                            }}
                        >
                            התנתק ונסה חשבון אחר
                        </Button>
                    </SignOutButton>
                </Box>
            </Paper>
        </Container>
    );
}
