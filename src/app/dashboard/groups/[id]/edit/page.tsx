"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Card,
    CardContent,
    Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import GroupForm, { GroupFormData } from "@/components/groups/GroupForm";

interface Category {
    id: string;
    name: string;
}

interface Company {
    id: string;
    title: string;
}

export default function EditGroupPage() {
    const { id: groupId } = useParams<{ id: string }>();
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);

    const [initialData, setInitialData] = useState<GroupFormData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        if (!isLoaded || !groupId) return;

        if (!isSignedIn) {
            router.push(`/sign-in?redirect_url=/dashboard/groups/${groupId}/edit`);
            return;
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, groupId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [groupRes, categoriesRes, companiesRes] = await Promise.all([
                fetch(`/api/active-groups/${groupId}`),
                fetch("/api/categories"),
                fetch("/api/companies"),
            ]);

            if (!groupRes.ok) {
                setError("לא ניתן לטעון את פרטי הקבוצה");
                return;
            }

            const groupData = await groupRes.json();
            const g = groupData.group;

            setInitialData({
                title: g.title,
                description: g.description,
                categoryId: g.categoryId,
                companyId: g.companyId,
                basePrice: g.basePrice.toString(),
                groupPrice: g.groupPrice.toString(),
                deadline: new Date(g.deadline).toISOString().slice(0, 16),
                minParticipants: g.minParticipants?.toString() || "",
                maxParticipants: g.maxParticipants?.toString() || "",
                registrationTerms: g.registrationTerms || "",
                imageUrls: g.images.map((img: any) => img.image.url),
            });

            if (categoriesRes.ok) {
                setCategories((await categoriesRes.json()).categories || []);
            }

            if (companiesRes.ok) {
                setCompanies((await companiesRes.json()).companies || []);
            }
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת הנתונים");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: GroupFormData) => {
        setError("");
        setSaving(true);

        try {
            const res = await fetch(`/api/active-groups/${groupId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "שגיאה בעדכון הקבוצה");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/groups");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "שגיאה בעדכון הקבוצה");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    component={Link}
                    href="/dashboard/groups"
                >
                    חזרה לקבוצות שלי
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <Typography variant="h1" gutterBottom>
                        עריכת קבוצה
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            הקבוצה עודכנה בהצלחה!
                        </Alert>
                    )}

                    {initialData && (
                        <GroupForm
                            initialData={initialData}
                            categories={categories}
                            companies={companies}
                            onSubmit={handleSubmit}
                            loading={saving}
                            isEditing
                        />
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
