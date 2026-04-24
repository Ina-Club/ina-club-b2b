import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { clerkClient } from "@clerk/nextjs/server";
import { GroupStatus } from "@/lib/types/status";

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

        const isRunning = [GroupStatus.OPEN, GroupStatus.ACTIVATED].includes(existingGroup.status as GroupStatus);

        const client = await clerkClient();
        const serverUser = await client.users.getUser(user.id);
        const isAdmin = serverUser.publicMetadata.role === RoleLevel.ADMIN;
        
        if (!isRunning && !isAdmin) {
            return NextResponse.json(
                { error: "לא ניתן לערוך קבוצה בסטטוס זה" },
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
            registrationTerms,
        } = body;

        const updateData: Record<string, any> = {};

        // Any user can update participants count
        if (minParticipants !== undefined) {
            updateData.minParticipants = minParticipants ? parseInt(minParticipants) : null;
        }
        if (maxParticipants !== undefined) {
            updateData.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
        }

        // Only admins can update the rest
        if (isAdmin) {
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (categoryId !== undefined) updateData.categoryId = categoryId;
            if (companyId !== undefined) updateData.companyId = companyId;
            if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
            if (groupPrice !== undefined) updateData.groupPrice = parseFloat(groupPrice);
            if (deadline !== undefined) updateData.deadline = new Date(deadline);
            if (registrationTerms !== undefined) updateData.registrationTerms = registrationTerms;
        }

        // Update allowed details
        await prisma.activeGroup.update({
            where: { id: groupId },
            data: updateData,
        });

        // Only update images if explicitly provided in the request
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            // Delete all current image associations and re-add from the new list.
            // Reuse existing Image records by URL to avoid duplicates.
            await prisma.activeGroupImage.deleteMany({
                where: { activeGroupId: groupId }
            });

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
