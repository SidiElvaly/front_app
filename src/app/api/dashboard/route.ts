import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalPatients,
      newThisWeek,
      appointmentsToday,
      pendingBills,
      highRiskPatients,
      upcomingAppointments,
    ] = await Promise.all([
      db.patient.count(),
      db.patient.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      db.appointment.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      db.invoice.count({
        where: { status: "PENDING" },
      }),
      db.patient.findMany({
        where: { status: "HIGH" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          lastVisit: true,
        },
      }),
      db.appointment.findMany({
        where: {
          date: { gte: new Date() },
          status: "SCHEDULED",
        },
        orderBy: { date: "asc" },
        take: 5,
        select: {
          id: true,
          date: true,
          room: true,
          type: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalPatients,
      newThisWeek,
      appointmentsToday,
      pendingBills,
      highRiskPatients,
      upcomingAppointments,
    });
  } catch (err) {
    console.error("Dashboard fetch failed:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}