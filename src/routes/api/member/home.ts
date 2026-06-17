// import path changed: use server entry which provides createAPIFileRoute
// Use standard route handler exports instead of createAPIFileRoute
import { db } from "../../../db";
import { verses, meetings, attendanceLogs, notifications } from "../../../db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { verifyToken } from "../../../lib/auth-server";

export async function GET({ request }: { request: Request }) {
  try {
    const tokenUser = verifyToken(request);
    if (!tokenUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch active verse
    const activeVerse = await db.query.verses.findFirst({
      where: eq(verses.active, true),
    });

    // Fetch latest meeting
    const latestMeeting = await db.query.meetings.findFirst();

    // Count user attendance
    const userLogs = await db.select().from(attendanceLogs).where(
      eq(attendanceLogs.memberId, tokenUser.id)
    );
    const visitsThisMonth = userLogs.length;

    // Count unread notifications
    const userNotifications = await db.select().from(notifications).where(
      and(
        or(eq(notifications.userId, tokenUser.id), isNull(notifications.userId)),
        eq(notifications.unread, true)
      )
    );
    const unreadAnnouncements = userNotifications.length;

    return new Response(
      JSON.stringify({
        verse: activeVerse
          ? {
              ar: activeVerse.verseAr,
              en: activeVerse.verseEn,
              ref: { ar: activeVerse.refAr, en: activeVerse.refEn },
            }
          : {
              ar: "«أنا هو الطريق والحق والحياة. لا يأتي أحد إلى الآب إلا بي.»",
              en: "“I am the way, the truth, and the life. No one comes to the Father except through Me.”",
              ref: { ar: "يوحنا ١٤:٦", en: "John 14:6" },
            },
        meeting: latestMeeting
          ? {
              title: { ar: latestMeeting.titleAr, en: latestMeeting.titleEn },
              date: { ar: latestMeeting.dateAr, en: latestMeeting.dateEn },
              time: { ar: latestMeeting.timeAr, en: latestMeeting.timeEn },
              location: { ar: latestMeeting.locationAr, en: latestMeeting.locationEn },
            }
          : {
              title: { ar: "اجتماع الأسرة", en: "Family Meeting" },
              date: { ar: "الجمعة ٢٠ يونيو", en: "Friday, June 20" },
              time: { ar: "٧:٠٠ مساءً", en: "7:00 PM" },
              location: { ar: "قاعة الكنيسة الكبرى", en: "Main Church Hall" },
            },
        visitsThisMonth,
        unreadAnnouncements,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
