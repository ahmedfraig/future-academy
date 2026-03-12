import React, { useState, useEffect } from 'react';
import {
  BookOpen, Utensils, Baby, Heart, Star, ChevronDown, ChevronUp,
  Clock, ChevronRight, ChevronLeft, Timer, ClipboardList
} from 'lucide-react';
import api from '../../services/api';

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

function MealsSection({ meals }) {
  if (!meals) return <p className="text-sm text-gray-400">لا توجد بيانات وجبات</p>;
  return (
    <div className="flex flex-col gap-3">
      {[['breakfast', 'الفطار', '🥐'], ['lunch', 'الغداء', '🍛'], ['snack', 'السناك', '🍎']].map(([key, name, emoji]) => {
        const val = meals[key];
        if (!val) return null;
        const cfg = mealStatusConfig[val] || mealStatusConfig.none;
        return (
          <div key={key} className={`rounded-2xl p-4 ${cfg.bg}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-gray-700 text-sm">{emoji} {name}</span>
              <span className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</span>
            </div>
            <div className="h-2.5 bg-white/70 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${cfg.barColor}`} style={{ width: val === 'full' ? '100%' : val === 'half' ? '50%' : '0%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PottySection({ potty }) {
  const list = Array.isArray(potty) ? potty : [];
  if (!list.length) return <p className="text-gray-400 text-sm text-center py-2">لا توجد سجلات</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((t, i) => (
        <span key={i} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-xl">
          <Clock size={13}/> {t}
        </span>
      ))}
    </div>
  );
}

const BEHAVIOR_LABELS = ['ممتاز 🌟', 'جيد 😊', 'عادي 😐', 'يحتاج دعم 💛', 'صعب 😟'];
const MOOD_COLORS = {
  'ممتاز 🌟': 'bg-emerald-100 text-emerald-700',
  'جيد 😊':   'bg-blue-100 text-blue-700',
  'عادي 😐':  'bg-amber-100 text-amber-700',
  'يحتاج دعم 💛': 'bg-yellow-100 text-yellow-700',
  'صعب 😟':   'bg-red-100 text-red-700',
};

function safeParseOverall(val) {
  if (!val) return null;
  if (BEHAVIOR_LABELS.includes(val)) return val;
  // val might be a nested JSON string — try to extract real overall from it
  try {
    const inner = JSON.parse(val);
    if (inner && typeof inner === 'object' && inner.overall) {
      return BEHAVIOR_LABELS.includes(inner.overall) ? inner.overall : null;
    }
  } catch (_) {}
  return null; // unknown/corrupted — hide it
}

function BehaviorSection({ behavior }) {
  if (!behavior) return <p className="text-sm text-gray-400">لا توجد بيانات سلوك</p>;

  // behavior is stored as TEXT in DB — parse JSON string if needed
  let parsed = behavior;
  if (typeof behavior === 'string') {
    try { parsed = JSON.parse(behavior); } catch (_) { /* treat as plain mood string */ }
  }

  // Plain mood string (old format)
  if (typeof parsed === 'string') {
    const label = BEHAVIOR_LABELS.includes(parsed) ? parsed : null;
    if (!label) return <p className="text-sm text-gray-400">لا توجد بيانات سلوك</p>;
    return <span className={`text-sm font-bold px-4 py-1.5 rounded-xl ${MOOD_COLORS[label]}`}>{label}</span>;
  }

  // Object {withPeers, withTeachers, overall}
  const overall = safeParseOverall(parsed.overall);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-pink-50 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">مع الأصدقاء</p>
          <StarRow value={parsed.withPeers || parsed.with_peers || 0} />
        </div>
        <div className="w-px h-10 bg-pink-200" />
        <div>
          <p className="text-xs text-gray-500 mb-1">مع المعلمات</p>
          <StarRow value={parsed.withTeachers || parsed.with_teachers || 0} />
        </div>
      </div>
      {overall && (
        <span className={`text-sm font-bold px-4 py-1.5 rounded-xl self-start ${MOOD_COLORS[overall] || 'bg-pink-100 text-pink-700'}`}>{overall}</span>
      )}
    </div>
  );
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today - d;
  if (diff < 86400000) return 'اليوم';
  if (diff < 172800000) return 'أمس';
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const subjectBg = {
  blue:    'bg-blue-50 border-blue-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  violet:  'bg-violet-50 border-violet-200',
  sky:     'bg-sky-50 border-sky-200',
  pink:    'bg-pink-50 border-pink-200',
  amber:   'bg-amber-50 border-amber-200',
  red:     'bg-red-50 border-red-200',
};

function SubjectsSection({ subjects }) {
  if (!subjects || subjects.length === 0)
    return <p className="text-sm text-gray-400 text-center py-2">لم يتم إضافة مواد لهذا اليوم</p>;

  const taught    = subjects.filter((s) => s.taught);
  const notTaught = subjects.filter((s) => !s.taught);

  return (
    <div className="flex flex-col gap-3">
      {taught.map((s) => {
        const bg = subjectBg[s.color] || subjectBg.blue;
        return (
          <div key={s.id} className={`rounded-2xl border p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="font-bold text-gray-800 text-sm">{s.name}</span>
              <span className="mr-auto text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✅ تم التدريس</span>
            </div>
            {s.lesson_topic && (
              <div className="bg-white/80 rounded-xl px-3 py-2 mb-2">
                <p className="text-[10px] font-bold text-gray-400 mb-0.5">📖 ماذا تعلم اليوم</p>
                <p className="text-sm text-gray-800 font-semibold">{s.lesson_topic}</p>
              </div>
            )}
            {s.assignment ? (
              <div className="bg-white/70 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold text-gray-400 mb-0.5">📝 الواجب المنزلي</p>
                <p className="text-sm text-gray-700 font-medium">{s.assignment}</p>
              </div>
            ) : (
              !s.lesson_topic && <p className="text-xs text-gray-400 mt-1">لا يوجد واجب</p>
            )}
          </div>

        );
      })}
      {notTaught.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {notTaught.map((s) => (
            <span key={s.id} className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium">
              {s.icon} {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DailyReportPage() {
  const [reports, setReports]         = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [subjects, setSubjects]       = useState([]);

  useEffect(() => {
    api.get('/parent/reports', { params: { limit: 30 } })
      .then(({ data }) => { setReports(data); setSelectedIdx(0); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch today's subjects for the child's class
    api.get('/parent/daily-subjects')
      .then(({ data }) => setSubjects(data))
      .catch(() => {});
  }, []);

  const prev = () => setSelectedIdx((i) => Math.min(i + 1, reports.length - 1));
  const next = () => setSelectedIdx((i) => Math.max(i - 1, 0));

  const report = reports[selectedIdx];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⏳</div>
          <p className="text-gray-400 text-sm font-medium">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-bold text-sm">لا توجد تقارير يومية بعد</p>
        <p className="text-xs mt-1">ستظهر هنا بعد تسجيل الحضور اليومي</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Day Selector */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 text-center mb-3">اختر اليوم</p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={next} disabled={selectedIdx >= reports.length - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 hover:bg-blue-100 transition-all">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
          <div className="flex-1 overflow-x-auto flex gap-2 py-1 justify-center">
            {reports.map((r, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${i === selectedIdx ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-blue-50'}`}>
                {formatShortDate(r.report_date)}
              </button>
            ))}
          </div>
          <button onClick={prev} disabled={selectedIdx <= 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 hover:bg-blue-100 transition-all">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">{formatLongDate(report?.report_date)}</p>
      </div>

      {/* Arrival Time */}
      {report?.arrival_time && (
        <div className="bg-sky-50 border border-sky-100 rounded-3xl px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-2xl flex items-center justify-center"><Timer size={16} className="text-white" /></div>
          <div>
            <p className="text-xs text-sky-500 font-bold">وقت الوصول</p>
            <p className="text-base font-black text-gray-800" dir="ltr">{report.arrival_time}</p>
          </div>
          <span className={`mr-auto text-sm font-bold px-3 py-1.5 rounded-xl ${report.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            {report.present ? '✅ حاضر' : '❌ غائب'}
          </span>
        </div>
      )}

      {/* Teacher Note */}
      {report?.note && (
        <div className="bg-violet-50 border border-violet-100 rounded-3xl px-5 py-4">
          <p className="text-xs font-bold text-violet-500 mb-1">📝 ملاحظة المعلمة</p>
          <p className="text-sm text-gray-700">{report.note}</p>
        </div>
      )}

      {/* Subjects & Assignments for today */}
      <SectionCard icon={<BookOpen size={18}/>} title="مواد اليوم والواجبات" color="blue">
        <SubjectsSection subjects={subjects} />
      </SectionCard>

      <SectionCard icon={<Utensils size={18}/>} title="الطعام والوجبات" color="green">
        <MealsSection meals={report?.meals} />
      </SectionCard>

      <SectionCard icon={<Baby size={18}/>} title="التويلت" color="yellow">
        <PottySection potty={report?.potty} />
      </SectionCard>

      <SectionCard icon={<Heart size={18}/>} title="السلوك والمزاج" color="pink">
        <BehaviorSection behavior={report?.behavior} />
      </SectionCard>
    </div>
  );
}
