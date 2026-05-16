import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const {
      planId,
      planTitle,
      planPrice,
      planDuration,
      name,
      email,
      phone,
      businessDescription,
      website,
      facebook,
      additionalInfo,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !planId) {
      return NextResponse.json(
        { error: "שדות חובה חסרים" },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a2a5a;">בקשה חדשה לבחירת חבילה - Ina Club B2B</h2>
        
        <h3 style="color: #f0a868;">פרטי החבילה הנבחרת:</h3>
        <ul>
          <li><strong>חבילה:</strong> ${planTitle}</li>
          <li><strong>מחיר:</strong> ₪${planPrice} ${planDuration === "monthly" ? "לחודש" : "לשנה"}</li>
          <li><strong>מזהה חבילה:</strong> ${planId}</li>
        </ul>

        <h3 style="color: #f0a868;">פרטים אישיים:</h3>
        <ul>
          <li><strong>שם:</strong> ${name}</li>
          <li><strong>אימייל:</strong> ${email}</li>
          <li><strong>טלפון:</strong> ${phone}</li>
        </ul>

        <h3 style="color: #f0a868;">פרטי העסק:</h3>
        <ul>
          <li><strong>מה מתכנן למכור:</strong> ${businessDescription || "לא צוין"}</li>
          <li><strong>אתר אינטרנט:</strong> ${website || "לא צוין"}</li>
          <li><strong>דף פייסבוק:</strong> ${facebook || "לא צוין"}</li>
          ${additionalInfo ? `<li><strong>מידע נוסף:</strong> ${additionalInfo}</li>` : ""}
        </ul>

        <p style="margin-top: 30px; color: #6b7280;">
          תאריך הבקשה: ${new Date().toLocaleString("he-IL")}
        </p>
      </div>
    `;

    // Send email using Resend
    if (resend && process.env.RESEND_API_KEY) {
      try {
        const receiverEmail = process.env.NODE_ENV === "development" ? process.env.RESEND_TEST_EMAIL : process.env.EMAIL_TO;
        if (!receiverEmail) throw new Error("Receiver email not configured");
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "Ina Club B2B <noreply@inaclub.co.il>",
          to: receiverEmail,
          subject: `בקשה חדשה לבחירת חבילה - ${planTitle}`,
          html: emailContent,
        });

        if (error) {
          console.error("Email sending error:", error);
          // Don't fail the request if email fails, just log it
        }
      } catch (emailError) {
        console.error("Email service error:", emailError);
        // Continue even if email fails
      }
    } else {
      console.warn("Resend not configured. Please install 'resend' package and set RESEND_API_KEY environment variable.");
    }

    return NextResponse.json(
      { success: true, message: "הבקשה נשלחה בהצלחה" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing package inquiry:", error);
    return NextResponse.json(
      { error: "שגיאה בעיבוד הבקשה" },
      { status: 500 }
    );
  }
}
