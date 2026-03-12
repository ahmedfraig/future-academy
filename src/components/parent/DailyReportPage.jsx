import React, { useState } from 'react';
import {
  BookOpen, Utensils, Baby, Heart, Star, ChevronDown, ChevronUp,
  Clock, ChevronRight, ChevronLeft, Timer
} from 'lucide-react';
import { todayReport } from '../../data/dummyData';

// ── MULTI-DAY MOCK DATA ─────────────────────────
const pastReports = [
  {
    date: 'اليوم - الأربعاء 12 مارس',
    shortDate: 'اليوم',
    ...todayReport,
    arrivalTime: '07:45',
    temperament: 'نشيط',
    behavior: { withPeers: 5, withTeachers: 5, overall: 'ممتاز 🌟' },
  },
  {
    date: 'الثلاثاء 11 مارس',
    shortDate: 'أمس',
    arrivalTime: '08:10',
    temperament: 'هادئ',
    meals: { breakfast: { status: 'full', percentage: 100 }, lunch: { status: 'half', percentage: 50 }, snack: { status: 'full', percentage: 100 } },
    potty: ['9:30 ص', '12:00 م'],
    behavior: { withPeers: 4, withTeachers: 5, overall: 'جيد 😊' },
    academic: todayReport.academic,
    note: 'يونس كان هادئاً ومنتبهاً اليوم 👍',
  },
  {
    date: 'الاثنين 10 مارس',
    shortDate: '10 مارس',
    arrivalTime: '07:55',
    temperament: 'فضولي',
    meals: { breakfast: { status: 'half', percentage: 50 }, lunch: { status: 'full', percentage: 100 }, snack: { status: 'none', percentage: 0 } },
    potty: ['10:15 ص'],
    behavior: { withPeers: 3, withTeachers: 4, overall: 'عادي 😐' },
    academic: todayReport.academic.slice(0, 1),
    note: '',
  },
  {
    date: 'الأحد 9 مارس',
    shortDate: '9 مارس',
    arrivalTime: '08:30',
    temperament: 'اجتماعي',
    meals: { breakfast: { status: 'full', percentage: 100 }, lunch: { status: 'full', percentage: 100 }, snack: { status: 'half', percentage: 50 } },
    potty: ['9:00 ص', '11:30 ص', '1:30 م'],
    behavior: { withPeers: 5, withTeachers: 5, overall: 'ممتاز 🌟' },
    academic: todayReport.academic,
    note: 'أداء رائع! شارك في الأنشطة بحماس 🌟',
  },
  {
    date: 'الخميس 6 مارس',
    shortDate: '6 مارس',
    arrivalTime: '08:00',
    temperament: 'هادئ',
    meals: { breakfast: { status: 'none', percentage: 0 }, lunch: { status: 'half', percentage: 50 }, snack: { status: 'full', percentage: 100 } },
    potty: [],
    behavior: { withPeers: 3, withTeachers: 3, overall: 'عادي 😐' },
    academic: [],
    note: 'شعر بعدم الارتياح قليلاً في الصباح.',
  },
];

// ── HELPERS ───────────────────────────────────
function SectionCard({ icon, title, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = { blue: 'bg-blue-500', green: 'bg-emerald-500', yellow: 'bg-amber-500', pink: 'bg-pink-500', purple: 'bg-purple-500', sky: 'bg-sky-500' };
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white ${colorMap[color]}`}>{icon}</div>
          <span className="font-bold text-gray-800 text-base">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function StarRow({ value }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={16} className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

const mealStatusConfig = {
  full: { label: 'أكل كاملة 🟢', barColor: 'bg-emerald-400', textColor: 'text-emerald-600', bg: 'bg-emerald-50' },
  half: { label: 'أكل نصفها 🟡', barColor: 'bg-amber-400',   textColor: 'text-amber-600',   bg: 'bg-amber-50'   },
  none: { label: 'لم يأكل 🔴',   barColor: 'bg-red-400',     textColor: 'text-red-500',     bg: 'bg-red-50'     },
};

// ── SECTION COMPONENTS ───────────────────────
function AcademicSection({ academic }) {
  if (!academic?.length) return <p className="text-sm text-gray-400">لا توجد مواد مسجلة</p>;
  return (
    <div className="flex flex-col gap-3">
      {academic.map((item, i) => (
        <div key={i} className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">{i+1}</div>
            <span className="font-bold text-blue-700 text-sm">{item.subject}</span>
          </div>
          <div className="flex flex-col gap-1 mr-8">
            <p className="text-xs text-gray-500">الشرح: <span className="text-gray-700 font-medium">{item.lesson}</span></p>
            {item.homework && item.homework !== 'لا يوجد' && (
              <p className="text-xs text-gray-500">الواجب: <span className="text-orange-600 font-bold">{item.homework}</span></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MealsSection({ meals }) {
  return (
    <div className="flex flex-col gap-3">
      {[['breakfast', 'الفطار', '🥐'], ['lunch', 'الغداء', '🍛'], ['snack', 'السناك', '🍎']].map(([key, name, emoji]) => {
        const data = meals?.[key];
        if (!data) return null;
        const cfg = mealStatusConfig[data.status] || mealStatusConfig.none;
        return (
          <div key={key} className={`rounded-2xl p-4 ${cfg.bg}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-gray-700 text-sm">{emoji} {name}</span>
              <span className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</span>
            </div>
            <div className="h-2.5 bg-white/70 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${cfg.barColor}`} style={{ width: `${data.percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PottySection({ potty }) {
  if (!potty?.length) return <p className="text-gray-400 text-sm text-center py-2">لا توجد سجلات</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {potty.map((t, i) => (
        <span key={i} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-xl">
          <Clock size={13}/> {t}
        </span>
      ))}
    </div>
  );
}

function BehaviorSection({ behavior, temperament }) {
  if (!behavior) return null;
  const moodMap = { 'ممتاز 🌟': 'bg-emerald-100 text-emerald-700', 'جيد 😊': 'bg-blue-100 text-blue-700', 'عادي 😐': 'bg-amber-100 text-amber-700', 'يحتاج دعم 💛': 'bg-yellow-100 text-yellow-700', 'صعب 😟': 'bg-red-100 text-red-700' };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-pink-50 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">مع الأصدقاء</p>
          <StarRow value={behavior.withPeers} />
        </div>
        <div className="w-px h-10 bg-pink-200" />
        <div>
          <p className="text-xs text-gray-500 mb-1">مع المعلمات</p>
          <StarRow value={behavior.withTeachers} />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className={`text-sm font-bold px-4 py-1.5 rounded-xl ${moodMap[behavior.overall] || 'bg-gray-100 text-gray-600'}`}>{behavior.overall}</span>
        {temperament && <span className="text-sm font-bold px-4 py-1.5 rounded-xl bg-violet-100 text-violet-700">{temperament}</span>}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────
export default function DailyReportPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const report = pastReports[selectedIdx];

  const prev = () => setSelectedIdx((i) => Math.min(i + 1, pastReports.length - 1));
  const next = () => setSelectedIdx((i) => Math.max(i - 1, 0));

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Day Selector */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 text-center mb-3">اختر اليوم</p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={next} disabled={selectedIdx >= pastReports.length - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 hover:bg-blue-100 transition-all">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
          <div className="flex-1 overflow-x-auto flex gap-2 py-1 justify-center">
            {pastReports.map((r, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${i === selectedIdx ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-blue-50'}`}>
                {r.shortDate}
              </button>
            ))}
          </div>
          <button onClick={prev} disabled={selectedIdx <= 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 hover:bg-blue-100 transition-all">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">{report.date}</p>
      </div>

      {/* Arrival Time */}
      {report.arrivalTime && (
        <div className="bg-sky-50 border border-sky-100 rounded-3xl px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-2xl flex items-center justify-center"><Timer size={16} className="text-white" /></div>
          <div>
            <p className="text-xs text-sky-500 font-bold">وقت الوصول</p>
            <p className="text-base font-black text-gray-800" dir="ltr">{report.arrivalTime}</p>
          </div>
          {report.temperament && (
            <span className="mr-auto text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1.5 rounded-xl">{report.temperament}</span>
          )}
        </div>
      )}

      {/* Note from teacher */}
      {report.note && (
        <div className="bg-violet-50 border border-violet-100 rounded-3xl px-5 py-4">
          <p className="text-xs font-bold text-violet-500 mb-1">📝 ملاحظة المعلمة</p>
          <p className="text-sm text-gray-700">{report.note}</p>
        </div>
      )}

      <SectionCard icon={<BookOpen size={18}/>} title="الدراسة والمنهج" color="blue">
        <AcademicSection academic={report.academic} />
      </SectionCard>

      <SectionCard icon={<Utensils size={18}/>} title="الطعام والوجبات" color="green">
        <MealsSection meals={report.meals} />
      </SectionCard>

      <SectionCard icon={<Baby size={18}/>} title="التويلت" color="yellow">
        <PottySection potty={report.potty} />
      </SectionCard>

      <SectionCard icon={<Heart size={18}/>} title="السلوك والمزاج" color="pink">
        <BehaviorSection behavior={report.behavior} temperament={report.temperament} />
      </SectionCard>
    </div>
  );
}
