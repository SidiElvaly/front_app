"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { CalendarDays, Users, FileText, AlertCircle, Phone, Clock, ChevronLeft } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import Avatar from "@/components/Avatar";
import Link from "next/link";

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
      <main className="w-full min-h-screen bg-slate-50/50">
        <Topbar title="عرض RTL" />
        <div className="p-10 text-center text-slate-400">جاري التحميل...</div>
      </main>
    );
  }

  const highRisk = data.highRiskPatients || [];
  const appointmentsToday = data.appointmentsToday || 0;

  return (
    <main className="w-full min-h-screen bg-slate-50/50">
      <Topbar title="لوحة التحكم" />

      <section dir="rtl" className="mx-auto w-full max-w-7xl px-3 pb-10 pt-4 text-right sm:px-4 lg:px-6">
        {/* Welcome Banner */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                العيادة <span className="text-slate-300">/</span> نظرة عامة
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                مرحباً بك مجدداً
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                إليك ملخص سريع لحالة المرضى والمواعيد لهذا اليوم.
              </p>
            </div>
            <div className="flex-shrink-0">
               <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
                <AlertCircle size={14} />
                النظام يعمل بشكل جيد
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "إجمالي المرضى", value: data.totalPatients, sub: `+${data.newThisWeek} هذا الأسبوع`, icon: Users, color: "text-emerald-600 bg-emerald-50" },
            { label: "زيارات اليوم", value: appointmentsToday, sub: "مواعيد مجدولة", icon: CalendarDays, color: "text-sky-600 bg-sky-50" },
            { label: "مرضى جدد", value: data.newThisWeek, sub: "تمت إضافتهم حديثاً", icon: FileText, color: "text-violet-600 bg-violet-50" },
            { label: "فواتير معلقة", value: data.pendingBills, sub: "تتطلب مراجعة", icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{kpi.value}</div>
              <p className="mt-1 text-[10px] font-medium text-slate-400">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Improved Priority Patients List (Right Side in RTL) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-sm font-bold text-slate-900">المرضى ذوو الأولوية</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">متابعة دقيقة للحالات الحرجة</p>
              </div>
              <Link href="/dashboard/patients" className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-md transition-all">
                عرض الكل <ChevronLeft size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {highRisk.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <Avatar name={p.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {p.idnum || "بدون رقم"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400">
                       <span className="flex items-center gap-1"><Phone size={12}/> {p.phone || "لا يوجد هاتف"}</span>
                       <span className="flex items-center gap-1"><Clock size={12}/> آخر زيارة: {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('ar-SA') : "جديد"}</span>
                    </div>
                  </div>
                  {/* Status pushed to the far left in RTL */}
                  <div className="flex items-center">
                    <div className="bg-rose-50 text-rose-700 border-rose-200 text-sm py-1 px-2 rounded-md">
                      عالي      
                    </div>
                  </div>
                </div>
              ))}
              {highRisk.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs italic">لا توجد حالات حرجة اليوم.</div>
              )}
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-sm font-bold text-slate-900">مواعيد اليوم القادمة</h3>
            </div>
            <div className="p-4 space-y-3">
              {data.upcomingAppointments?.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800">
                      {new Date(a.date).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {a.room || "قاعة الانتظار"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {a.type === 'CHECKUP' ? 'فحص' : a.type === 'EMERGENCY' ? 'طوارئ' : 'متابعة'}
                  </span>
                </div>
              ))}
              {(!data.upcomingAppointments || data.upcomingAppointments.length === 0) && (
                <div className="py-6 text-center text-slate-400 text-[11px]">جدول المواعيد فارغ.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}