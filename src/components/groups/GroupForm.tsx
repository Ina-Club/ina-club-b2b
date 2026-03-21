"use client";

import { useState, useRef } from "react";
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Stack,
    CircularProgress,
    Typography,
    IconButton,
    FormHelperText,
} from "@mui/material";
import { Save, CloudUpload, Delete } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
}

interface Company {
    id: string;
    title: string;
}

export interface GroupFormData {
    title: string;
    description: string;
    categoryId: string;
    companyId: string;
    basePrice: string;
    groupPrice: string;
    deadline: string;
    minParticipants: string;
    maxParticipants: string;
    registrationTerms: string;
    imageUrls: string[];
}

interface GroupFormProps {
    initialData?: GroupFormData;
    categories: Category[];
    companies: Company[];
    onSubmit: (data: GroupFormData) => Promise<void>;
    loading?: boolean;
    isEditing?: boolean;
    userCompanyId?: string | null; // If provided, locks the company selection
}

export default function GroupForm({
    initialData,
    categories,
    companies,
    onSubmit,
    loading = false,
    isEditing = false,
    userCompanyId,
}: GroupFormProps) {
    const [formData, setFormData] = useState<GroupFormData>(
        initialData || {
            title: "",
            description: "",
            categoryId: "",
            companyId: userCompanyId || "",
            basePrice: "",
            groupPrice: "",
            deadline: "",
            minParticipants: "",
            maxParticipants: "",
            registrationTerms: "",
            imageUrls: [],
        }
    );

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof GroupFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);
                formData.append(
                    "upload_preset",
                    process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET || ""
                );

                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!res.ok) throw new Error("Image upload failed");

                const data = await res.json();
                uploadedUrls.push(data.secure_url);
            }

            setFormData((prev) => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...uploadedUrls],
            }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("שגיאה בהעלאת תמונה. אנא נסה שנית.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
                <TextField
                    label="כותרת"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    fullWidth
                />

                <TextField
                    label="תיאור"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                    multiline
                    rows={4}
                    fullWidth
                />

                <TextField
                    label="תנאי הרשמה לקבוצה (אופציונלי)"
                    value={formData.registrationTerms}
                    onChange={(e) => handleChange("registrationTerms", e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="תנאים שחברי מועדון יצטרכו לאשר לפני ההצטרפות (למשל: תנאי ביטול, זמני אספקה, איסוף עצמי בלבד וכו׳)"
                />

                <TextField
                    select
                    label="קטגוריה"
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    required
                    fullWidth
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="חברה"
                    value={formData.companyId}
                    onChange={(e) => handleChange("companyId", e.target.value)}
                    required
                    fullWidth
                    disabled={!!userCompanyId} // Disable if userCompanyId is provided (enforced)
                >
                    {companies.map((comp) => (
                        <MenuItem key={comp.id} value={comp.id}>
                            {comp.title}
                        </MenuItem>
                    ))}
                </TextField>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        label="מחיר בסיסי (₪)"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => handleChange("basePrice", e.target.value)}
                        required
                        fullWidth
                        inputProps={{ step: "0.01", min: "0" }}
                    />

                    <TextField
                        label="מחיר קבוצה (₪)"
                        type="number"
                        value={formData.groupPrice}
                        onChange={(e) => handleChange("groupPrice", e.target.value)}
                        required
                        fullWidth
                        inputProps={{ step: "0.01", min: "0" }}
                    />
                </Box>

                <TextField
                    label="תאריך יעד"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        label="מינימום משתתפים"
                        type="number"
                        value={formData.minParticipants}
                        onChange={(e) => handleChange("minParticipants", e.target.value)}
                        fullWidth
                        inputProps={{ min: "1" }}
                    />

                    <TextField
                        label="מקסימום משתתפים"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleChange("maxParticipants", e.target.value)}
                        fullWidth
                        inputProps={{ min: "1" }}
                    />
                </Box>

                {/* Image Upload Section */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        תמונות (חובה להעלות לפחות תמונה אחת)
                    </Typography>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />

                    <Button
                        variant="outlined"
                        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        sx={{ mb: 2 }}
                    >
                        {uploading ? "מעלה..." : "העלה תמונות"}
                    </Button>

                    {formData.imageUrls.length === 0 && (
                        <FormHelperText error>יש להעלות לפחות תמונה אחת</FormHelperText>
                    )}

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                        {formData.imageUrls.map((url, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: "relative",
                                    width: 100,
                                    height: 100,
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    border: "1px solid #ddd",
                                }}
                            >
                                <Image
                                    src={url}
                                    alt={`Group image ${index + 1}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => removeImage(index)}
                                    sx={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        bgcolor: "rgba(255,255,255,0.8)",
                                        "&:hover": { bgcolor: "white" },
                                    }}
                                >
                                    <Delete fontSize="small" color="error" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/dashboard/groups"
                        disabled={loading}
                    >
                        ביטול
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading || formData.imageUrls.length === 0}
                    >
                        {loading ? "שומר..." : isEditing ? "עדכן קבוצה" : "צור קבוצה"}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
}
