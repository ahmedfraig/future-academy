import React from 'react';
import { MapPin, Megaphone, Calendar } from 'lucide-react';
import { todayReport, announcements } from '../../data/dummyData';

// =============================================
// ATTENDANCE STATUS CARD
// =============================================
function AttendanceCard() {
  const { attendance, mood } = todayReport;
  return (
    <div className="bg-gradient-to-l from-emerald-400 to-teal-500 rounded-3xl p-5 text-white shadow-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-emerald-50 opacity-90">حالة الحضور اليوم</span>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={18} className="text-white" />
            <span className="text-lg font-bold">
              {attendance.arrived ? `وصل الحضانة ${attendance.arrivalTime}` : 'غائب اليوم'}
            </span>
          </div>
          <span className="text-xs text-emerald-100 mt-1">{todayReport.date}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-5xl animate-bounce-gentle">{mood.emoji}</div>
          <span className="text-sm font-semibold text-white bg-white/20 px-3 py-0.5 rounded-full">
            {mood.label}
          </span>
        </div>
      </div>
      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-4 justify-end">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/60 rounded-full" />
        <div className="w-6 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
}

// =============================================
// ANNOUNCEMENTS CARD
// =============================================
const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', title: 'text-blue-700' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', title: 'text-emerald-700' },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', title: 'text-amber-700' },
};

function AnnouncementsCard() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
          <Megaphone size={16} className="text-amber-600" />
        </div>
        <h2 className="text-base font-bold text-gray-800">لوحة الإعلانات</h2>
      </div>
      <div className="flex flex-col gap-3">
        {announcements.map((ann) => {
          const colors = colorMap[ann.color] || colorMap.blue;
          return (
            <div
              key={ann.id}
              className={`rounded-2xl p-4 border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                <div className="flex flex-col gap-0.5">
                  <span className={`font-bold text-sm ${colors.title}`}>{ann.title}</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{ann.body}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{ann.date}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// HOME PAGE COMPONENT
// =============================================
export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <AttendanceCard />
      <AnnouncementsCard />
    </div>
  );
}
