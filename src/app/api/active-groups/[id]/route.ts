import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

import { GroupStatus } from "@prisma/client";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { user, response } = await requireAuth(RoleLevel.BUSINESS);
        if (response) return response;

        const { params } = context;
        const { id: groupId } = await params;

        const group = await prisma.activeGroup.findUnique({
            where: { id: groupId },
            include: {
                images: {
                    include: { image: true },
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!group) {
            return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
        }

        // Verify ownership (optional? maybe business can view any but only edit theirs? stricts rules say business can only see theirs usually)
        if (group.createdById !== user.id) {
            return NextResponse.json(
                { error: "אין לך הרשאה לצפות בקבוצה זו" },
                { status: 403 }
            );
        }

        return NextResponse.json({ group });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "שגיאה בטעינת הקבוצה" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { user, response } = await requireAuth(RoleLevel.BUSINESS);
        if (response) return response;

        const { params } = context;
        const { id: groupId } = await params;

        // Verify ownership
        const existingGroup = await prisma.activeGroup.findUnique({
            where: { id: groupId },
            include: {
                images: {
                    include: { image: true }
                }
            }
        });

        if (!existingGroup) {
            return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
        }

        if (existingGroup.createdById !== user.id) {
            return NextResponse.json(
                { error: "אין לך הרשאה לערוך קבוצה זו" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            title,
            description,
            categoryId,
            companyId,
            basePrice,
            groupPrice,
            deadline,
            imageUrls,
            minParticipants,
            maxParticipants,
        } = body;

        // Validate essential fields
        if (
            !title ||
            !description ||
            !categoryId ||
            !companyId ||
            !basePrice ||
            !groupPrice ||
            !deadline
        ) {
            return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
        }

        // Update basic details
        await prisma.activeGroup.update({
            where: { id: groupId },
            data: {
                title,
                description,
                categoryId,
                companyId,
                basePrice: parseFloat(basePrice),
                groupPrice: parseFloat(groupPrice),
                deadline: new Date(deadline),
                minParticipants: minParticipants ? parseInt(minParticipants) : null,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
            },
        });

        // Handle Images
        // 1. Remove existing images not in the new list (if we were tracking IDs, but here we just have URLs)
        // A simpler strategy for this MVP: 
        // - Delete all ActiveGroupImage relations for this group
        // - Re-create them from the input list.
        // - Note: This leaves orphaned Image records if we are not careful, but for now it's acceptable or we can try to reuse.
        // Better:
        // The URLs passed are what should be there.

        // First, delete all current image associations
        await prisma.activeGroupImage.deleteMany({
            where: { activeGroupId: groupId }
        });

        // Now re-add them. 
        // If a URL already exists in Image table, reuse it? 
        // Or just create new ones? The schema has no unique constraint on URL.
        // Let's try to reuse if URL exists to avoid duplicates.

        if (imageUrls && Array.isArray(imageUrls)) {
            const promises = imageUrls.map(async (url: string, i: number) => {
                let image = await prisma.image.findFirst({ where: { url } });
                if (!image) {
                    image = await prisma.image.create({ data: { url } });
                }

                await prisma.activeGroupImage.create({
                    data: {
                        activeGroupId: groupId,
                        imageId: image.id,
                        order: i,
                    },
                });
            });
            await Promise.all(promises);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Error updating group:", e);
        return NextResponse.json(
            { error: "שגיאה בעדכון הקבוצה" },
            { status: 500 }
        );
    }
}
