import React from 'react';
import { Users, School, GraduationCap, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { students, classes, teachers, activityLog } from '../../data/dummyData';

// =============================================
// KPI STAT CARD
// =============================================
function StatCard({ icon, label, value, sub, gradient, emoji }) {
  return (
    <div className={`rounded-3xl p-5 text-white shadow-lg ${gradient} relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-4xl font-black mt-1">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">{icon}</div>
      </div>
      <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 select-none pointer-events-none">{emoji}</div>
    </div>
  );
}

// =============================================
// CAPACITY BAR
// =============================================
function ClassCapacityBar({ cls }) {
  const count = cls.studentIds.length;
  const pct = Math.round((count / cls.capacity) * 100);
  const colorMap = { blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-purple-500', orange: 'bg-orange-500' };
  const bgMap = { blue: 'bg-blue-50', green: 'bg-emerald-50', purple: 'bg-purple-50', orange: 'bg-orange-50' };
  return (
    <div className={`rounded-2xl p-4 ${bgMap[cls.color] || 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-gray-700">{cls.name}</span>
        <span className="text-xs text-gray-500 font-medium">{count}/{cls.capacity}</span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[cls.color] || 'bg-violet-500'} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% مشغول</p>
    </div>
  );
}

// =============================================
// OVERVIEW PAGE
// =============================================
export default function OverviewPage() {
  const presentCount  = students.filter((s) => s.present).length;
  const absentStudents = students.filter((s) => !s.present);
  const totalCap      = classes.reduce((a, c) => a + c.capacity, 0);
  const attendancePct = Math.round((presentCount / students.length) * 100);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-800">لوحة المعلومات 📊</h1>
        <p className="text-sm text-gray-400 mt-0.5">نظرة عامة على وضع الحضانه اليوم</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={22} className="text-white" />}
          label="إجمالي الطلاب"
          value={students.length}
          sub={`${presentCount} حاضر اليوم`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          emoji="👦"
        />
        <StatCard
          icon={<School size={22} className="text-white" />}
          label="عدد الفصول"
          value={classes.length}
          sub={`سعة ${totalCap} طالب`}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          emoji="🏫"
        />
        <StatCard
          icon={<GraduationCap size={22} className="text-white" />}
          label="المعلمات"
          value={teachers.filter((t) => t.active).length}
          sub={`${teachers.filter((t) => !t.active).length} غير نشطة`}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          emoji="👩‍🏫"
        />
        <StatCard
          icon={<TrendingUp size={22} className="text-white" />}
          label="نسبة الحضور"
          value={`${attendancePct}%`}
          sub={`${absentStudents.length} غائب اليوم`}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          emoji="📈"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absence Alerts */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={15} className="text-red-500" />
            </div>
            <h2 className="font-bold text-gray-800 text-sm">تنبيهات الغياب ({absentStudents.length})</h2>
          </div>
          {absentStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">لا يوجد غياب اليوم 🎉</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
              {absentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-2.5">
                  <span className="text-xl">{s.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-700 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.classId} • {s.parentName}</p>
                  </div>
                  <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">غائب</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class Capacity */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <School size={15} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-gray-800 text-sm">سعة الفصول</h2>
          </div>
          <div className="flex flex-col gap-3">
            {classes.map((cls) => <ClassCapacityBar key={cls.id} cls={cls} />)}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
            <Activity size={15} className="text-violet-600" />
          </div>
          <h2 className="font-bold text-gray-800 text-sm">آخر الأنشطة</h2>
        </div>
        <div className="flex flex-col gap-2">
          {activityLog.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center text-lg flex-shrink-0">
                {log.icon}
              </div>
              <p className="text-sm text-gray-700 flex-1">{log.text}</p>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
