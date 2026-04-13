import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { createGroupCoupon } from "@/lib/services/coupon";
import { notificationService } from "@/lib/services/notifications";
// TODO: Move to monorepo!!! 
import { GroupStatus } from "@/lib/types/status";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { response } = await requireAuth(RoleLevel.BUSINESS);
        if (response) return response;

        const { id: groupId } = await params;

        const activeGroup = await prisma.activeGroup.findUnique({
            where: { id: groupId },
            include: {
                participants: true,
                company: true,
            }
        });

        if (!activeGroup) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const st = activeGroup.status as string;
        if (
            st === GroupStatus.ACTIVATED ||
            st === GroupStatus.RESOLVED ||
            st === GroupStatus.CANCELED ||
            st === GroupStatus.EXPIRED
        ) {
            return NextResponse.json({ error: "Group is already activated, resolved, or canceled" }, { status: 400 });
        }

        await prisma.activeGroup.update({
            where: { id: groupId },
            // Prisma enum in node_modules may lag schema (CLOSED vs ACTIVATED); value must match DB.
            data: { status: GroupStatus.ACTIVATED as never },
        });

        const contexts = [];
        const failures = [];
        
        for (const participant of activeGroup.participants) {
            try {
                const couponData = await createGroupCoupon(participant.userId, groupId, activeGroup.deadline);
                contexts.push({
                    userId: participant.userId,
                    couponCode: couponData.code,
                    groupTitle: activeGroup.title,
                    validTo: activeGroup.deadline,
                });
            } catch (err) {
                console.error(`CRITICAL: Failed to generate coupon for user ${participant.userId} in group ${groupId}`, err);
                failures.push(participant.userId);
            }
        }

        if (contexts.length > 0) {
            notificationService.notifyAll(contexts).catch(err => {
                console.error("Failed to process notifications:", err);
            });
        }

        // TODO: Add a db logging of the failed users to be notified

        return NextResponse.json({ 
            success: true, 
            message: "Group activated successfully.", 
            notifiedCount: contexts.length,
            failuresCount: failures.length
        });

    } catch (error) {
        console.error("Group activation error:", error);
        return NextResponse.json({ error: "Failed to activate group" }, { status: 500 });
    }
}
