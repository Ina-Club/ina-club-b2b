"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { PricingPlan } from "./pricing.config";

interface PackageSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  plan: PricingPlan | null;
}

export default function PackageSelectionDialog({
  open,
  onClose,
  plan,
}: PackageSelectionDialogProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessDescription: "",
    website: "",
    facebook: "",
    additionalInfo: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate first step
      if (!formData.name || !formData.email || !formData.phone) {
        setError("אנא מלא את כל השדות החובה");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("אנא הזן כתובת אימייל תקינה");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/package-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan?.id,
          planTitle: plan?.title,
          planPrice: plan?.price,
          planDuration: plan?.duration,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("שגיאה בשליחת הבקשה");
      }

      setSuccess(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "שגיאה בשליחת הבקשה");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && step === 2) {
      // Reset form when closing after success
      setStep(0);
      setFormData({
        name: "",
        email: "",
        phone: "",
        businessDescription: "",
        website: "",
        facebook: "",
        additionalInfo: "",
      });
      setError("");
      setSuccess(false);
    }
    onClose();
  };

  const steps = ["פרטים אישיים", "פרטי העסק", "סיום"];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header with Logo */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a2a5a 0%, #243a7a 100%)",
            p: 4,
            textAlign: "center",
            position: "relative",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Image
              src="/InaClubLogo.png"
              alt="Ina Club"
              width={120}
              height={80}
              style={{ objectFit: "contain" }}
            />
          </Box>
          <DialogTitle
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: "1.5rem",
              p: 0,
            }}
          >
            {plan ? `בחירת חבילת ${plan.title}` : "בחירת חבילה"}
          </DialogTitle>
          {plan && (
            <Typography sx={{ color: "#f0a868", mt: 1, fontSize: "1.2rem" }}>
              ₪{plan.price}
              {plan.duration === "monthly" ? " / חודש" : " / שנה"}
            </Typography>
          )}
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 4, pt: 3 }}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontWeight: 600,
                      color: "#1a2a5a",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Form Content */}
        <Box sx={{ px: 4, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" sx={{ color: "#1a2a5a", mb: 1 }}>
                פרטים אישיים
              </Typography>
              <TextField
                label="שם מלא *"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="אימייל *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="טלפון *"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {step === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" sx={{ color: "#1a2a5a", mb: 1 }}>
                פרטי העסק
              </Typography>
              <TextField
                label="מה אתם מתכננים למכור?"
                value={formData.businessDescription}
                onChange={(e) =>
                  handleInputChange("businessDescription", e.target.value)
                }
                fullWidth
                multiline
                rows={3}
                placeholder="תארו בקצרה את המוצרים או השירותים שאתם מתכננים למכור..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="אתר אינטרנט (אם קיים)"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                fullWidth
                placeholder="https://..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="דף פייסבוק (אם קיים)"
                value={formData.facebook}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                fullWidth
                placeholder="https://facebook.com/..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="מידע נוסף (אופציונלי)"
                value={formData.additionalInfo}
                onChange={(e) =>
                  handleInputChange("additionalInfo", e.target.value)
                }
                fullWidth
                multiline
                rows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {step === 2 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f0a868 0%, #eeb17e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "3rem", color: "white" }}>
                  ✓
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: "#1a2a5a", fontWeight: "bold" }}>
                הבקשה נשלחה בהצלחה!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#6b7280", maxWidth: 500 }}
              >
                תודה על העניין שלכם ב-Ina Club B2B. נחזור אליכם תוך 2-4 ימי עסקים
                לכתובת האימייל שציינתם ({formData.email}) כדי להמשיך בתהליך ההרשמה.
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          {step < 2 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
                gap: 2,
              }}
            >
              <Button
                onClick={step === 0 ? handleClose : handleBack}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  borderColor: "#1a2a5a",
                  color: "#1a2a5a",
                  "&:hover": {
                    borderColor: "#243a7a",
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                {step === 0 ? "ביטול" : "חזור"}
              </Button>
              <Button
                onClick={step === 1 ? handleSubmit : handleNext}
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  backgroundColor: "#1a2a5a",
                  "&:hover": {
                    backgroundColor: "#243a7a",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : step === 1 ? (
                  "שלח בקשה"
                ) : (
                  "המשך"
                )}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                onClick={handleClose}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  backgroundColor: "#1a2a5a",
                  "&:hover": {
                    backgroundColor: "#243a7a",
                  },
                }}
              >
                סגור
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

