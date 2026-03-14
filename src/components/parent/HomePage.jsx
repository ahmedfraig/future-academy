import React, { useState, useEffect } from 'react';
import { MapPin, Megaphone, Calendar } from 'lucide-react';
import api from '../../services/api';

const colorMap = {
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-400',    title: 'text-blue-700'    },
  green:  { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', title: 'text-emerald-700' },
  yellow: { bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   title: 'text-amber-700'   },
  red:    { bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-400',     title: 'text-red-700'     },
  purple: { bg: 'bg-purple-50',  border: 'border-purple-200',  dot: 'bg-purple-400',  title: 'text-purple-700'  },
};

function AttendanceCard({ child, loading, holiday }) {
  const moodMap = { '😄': 'سعيد', '😊': 'بخير', '😐': 'عادي', '😢': 'حزين', '😴': 'متعب', '😤': 'متوتر' };
  const mood = child?.mood;
  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const isHoliday = holiday?.isHoliday;

  // Card gradient changes on holiday
  const gradient = isHoliday
    ? 'bg-gradient-to-l from-orange-400 to-amber-400'
    : 'bg-gradient-to-l from-emerald-400 to-teal-500';

  const statusText = loading
    ? 'جاري التحميل...'
    : isHoliday
    ? `إجازة — ${holiday.label || 'يوم إجازة رسمية'}`
    : child?.present
    ? `وصل الحضانة ${child.arrival_time ? child.arrival_time : '✅'}`
    : 'غائب اليوم';

  const statusEmoji = isHoliday ? '🏖️' : (mood || (child?.present ? '😊' : '😶'));
  const statusLabel = isHoliday ? 'إجازة' : (mood ? (moodMap[mood] || mood) : (child?.present ? 'حاضر' : 'غائب'));

  return (
    <div className={`${gradient} rounded-3xl p-5 text-white shadow-lg animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-white/90">حالة الحضور اليوم</span>
          {loading ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold opacity-70">جاري التحميل...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={18} className="text-white" />
              <span className="text-lg font-bold">{statusText}</span>
            </div>
          )}
          <span className="text-xs text-white/80 mt-1">{today}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-5xl animate-bounce-gentle">{statusEmoji}</div>
          <span className="text-sm font-semibold text-white bg-white/20 px-3 py-0.5 rounded-full">
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="flex gap-1.5 mt-4 justify-end">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/60 rounded-full" />
        <div className="w-6 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
}

function AnnouncementsCard({ announcements, loading }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
          <Megaphone size={16} className="text-amber-600" />
        </div>
        <h2 className="text-base font-bold text-gray-800">لوحة الإعلانات</h2>
      </div>
      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">جاري التحميل...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p className="text-2xl mb-1">📭</p>
          <p className="text-sm">لا توجد إعلانات حالياً</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((ann) => {
            const colors = colorMap[ann.color] || colorMap.blue;
            return (
              <div key={ann.id} className={`rounded-2xl p-4 border ${colors.bg} ${colors.border}`}>
                <div className="flex items-start gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-bold text-sm ${colors.title}`}>{ann.title}</span>
                    <p className="text-xs text-gray-600 leading-relaxed">{ann.body}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {ann.created_at
                          ? new Date(ann.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [child, setChild]               = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [holiday, setHoliday]           = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get('/parent/child'),
      api.get('/parent/announcements'),
      api.get('/parent/holidays/check', { params: { date: today } }),
    ])
      .then(([childRes, annRes, holRes]) => {
        setChild(childRes.data.child);
        setAnnouncements(annRes.data);
        setHoliday(holRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <AttendanceCard child={child} loading={loading} holiday={holiday} />
      <AnnouncementsCard announcements={announcements} loading={loading} />
    </div>
  );
}
