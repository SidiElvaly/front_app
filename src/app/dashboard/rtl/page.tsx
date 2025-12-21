"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { CalendarDays, Users, FileText, AlertCircle } from "lucide-react";

export default function RTLPreviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard RTL error:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <main className="w-full">
        <Topbar title="RTL Preview" />
        <div dir="rtl" className="px-4 py-6 text-sm text-slate-500 text-right">
          جارٍ تحميل البيانات...
        </div>
      </main>
    );
  }

  const highRisk = data.highRiskPatients || [];
  const appointmentsToday = data.appointmentsToday || 0;

  return (
    <main className="w-full">
      <Topbar title="RTL Preview" />

      <section dir="rtl" className="px-3 pb-8 pt-4 text-right sm:px-4 lg:px-6">
        {/* Welcome Banner */}
        <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">
                لوحة القيادة <span className="mx-1">›</span> عرض من اليمين إلى اليسار
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
                مرحباً بك
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                هذا هو نفس تصميم لوحة التحكم، لكن باتجاه من اليمين إلى اليسار وببيانات حقيقية.
              </p>
            </div>

            <div className="sm:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
                <AlertCircle size={14} />
                وضع العرض RTL
              </span>
            </div>
          </div>
        </div>

        {/* KPI cards: 1 col (mobile) / 2 cols (sm) / 4 cols (lg) */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">إجمالي المرضى</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {data.totalPatients}
            </div>
            <p className="mt-1 text-xs text-slate-400">+{data.newThisWeek} خلال هذا الأسبوع</p>
          </div>

          <div className="card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">زيارات اليوم</span>
              <CalendarDays className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {appointmentsToday}
            </div>
            <p className="mt-1 text-xs text-slate-400">متابعة المواعيد القادمة</p>
          </div>

          <div className="card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">مرضى جدد هذا الأسبوع</span>
              <FileText className="h-4 w-4 text-violet-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {data.newThisWeek}
            </div>
            <p className="mt-1 text-xs text-slate-400">ملفات تمّت إضافتها حديثاً</p>
          </div>

          <div className="card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">فواتير معلّقة</span>
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {data.pendingBills}
            </div>
            <p className="mt-1 text-xs text-slate-400">تتطلب مراجعة أو دفعاً</p>
          </div>
        </div>

        {/* Lower grid: stack on mobile, two columns on lg */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* High-risk patients */}
          <div className="card p-4 sm:p-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                المرضى ذوو الأولوية – تركيز اليوم
              </h3>
              <p className="mt-1 text-xs text-slate-500">أعلى المرضى من حيث مستوى الخطورة.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {highRisk.map((p: any) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-semibold text-rose-600">
                      {p.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {p.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {p.email ?? "لا يوجد بريد"}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">
                    خطر مرتفع
                  </span>
                </div>
              ))}

              {highRisk.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-500">
                  لا يوجد مرضى عالي الخطورة.
                </div>
              )}
            </div>
          </div>

          {/* Today overview */}
          <div className="card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-900">مواعيد اليوم</h3>
            <p className="mb-4 mt-2 text-xs text-slate-500">
              نظرة سريعة على حالة المواعيد في العيادة.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">إجمالي المواعيد</span>
                <span className="font-semibold text-slate-900">{appointmentsToday}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">المواعيد القادمة</span>
                <span className="font-semibold text-slate-900">
                  {data.upcomingAppointments?.length ?? 0}
                </span>
              </div>
            </div>

            {/* Optional: compact list on mobile, same data */}
            {Array.isArray(data.upcomingAppointments) && data.upcomingAppointments.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-2 text-xs font-semibold text-slate-700">
                  القادمة (مختصر)
                </div>
                <div className="space-y-2">
                  {data.upcomingAppointments.slice(0, 4).map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
                    >
                      <span className="text-slate-700">
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                        {a.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
