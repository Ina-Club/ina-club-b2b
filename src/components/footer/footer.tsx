import { Box, Typography, Container } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1a2a5a",
        color: "white",
        py: 3,
        mt: "auto",
      }}
    >
      <Container>
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Ina Club B2B. כל הזכויות שמורות.
        </Typography>
      </Container>
    </Box>
  );
}

