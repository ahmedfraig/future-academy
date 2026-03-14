import React, { useState, useEffect } from 'react';
import {
  ClipboardList, ChevronDown, ChevronUp, Users, Star,
  Clock, Utensils, Baby, Heart, BookOpen, Search, MessageSquare
} from 'lucide-react';
import api from '../../services/api';

const BEHAVIOR_LABELS = ['ممتاز 🌟', 'جيد 😊', 'عادي 😐', 'يحتاج دعم 💛', 'صعب 😟'];
const MOOD_COLORS = {
  'ممتاز 🌟': 'bg-emerald-100 text-emerald-700',
  'جيد 😊':   'bg-blue-100 text-blue-700',
  'عادي 😐':  'bg-amber-100 text-amber-700',
  'يحتاج دعم 💛': 'bg-yellow-100 text-yellow-700',
  'صعب 😟':   'bg-red-100 text-red-700',
};

function parseBehaviorLabel(behavior) {
  if (!behavior) return null;
  let parsed = behavior;
  if (typeof behavior === 'string') {
    try { parsed = JSON.parse(behavior); } catch (_) {}
  }
  if (typeof parsed === 'string') return BEHAVIOR_LABELS.includes(parsed) ? parsed : null;
  if (typeof parsed === 'object' && parsed !== null) {
    const overall = parsed.overall;
    if (BEHAVIOR_LABELS.includes(overall)) return overall;
    try {
      const inner = JSON.parse(overall);
      if (inner && BEHAVIOR_LABELS.includes(inner.overall)) return inner.overall;
    } catch (_) {}
  }
  return null;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const raw = String(dateStr).slice(0, 10);
  const [y, m, d] = raw.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const mealLabels = {
  full: { label: 'أكل كاملة', color: 'text-emerald-600 bg-emerald-50', dot: 'bg-emerald-400' },
  half: { label: 'نصف',       color: 'text-amber-600 bg-amber-50',   dot: 'bg-amber-400'   },
  none: { label: 'لم يأكل',   color: 'text-red-600 bg-red-50',       dot: 'bg-red-400'     },
};

function StudentReportCard({ student, isHoliday }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes]       = useState([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const meals = student.meals || {};
  const potty = Array.isArray(student.potty) ? student.potty : [];
  const behavior = parseBehaviorLabel(student.behavior);

  // Lazy-load teacher-parent notes when card is first expanded
  useEffect(() => {
    if (expanded && !notesLoaded) {
      api.get(`/manager/students/${student.id}/notes`)
        .then(({ data }) => setNotes(data))
        .catch(() => {})
        .finally(() => setNotesLoaded(true));
    }
  }, [expanded, student.id]);

  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
          {student.avatar}
        </div>
        <div className="flex-1 text-right">
          <p className="font-bold text-gray-800 text-sm">{student.name}</p>
          <p className="text-xs text-gray-400">{student.class_name} · {student.teacher_name || 'بدون معلمة'}</p>
        </div>
        <div className="flex items-center gap-2">
          {student.present ? (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-xl">✅ حاضر</span>
          ) : isHoliday ? (
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-xl">🏖️ إجازة</span>
          ) : (
            <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-xl">❌ غائب</span>
          )}
          {student.note && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">📝 ملاحظة</span>}
          {expanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 flex flex-col gap-3 pt-3">
          {/* Arrival */}
          {student.arrival_time && (
            <div className="flex items-center gap-2 bg-sky-50 rounded-xl px-3 py-2">
              <Clock size={13} className="text-sky-500" />
              <span className="text-xs text-gray-600 font-bold">وقت الوصول:</span>
              <span className="text-xs text-sky-700 font-black" dir="ltr">{student.arrival_time}</span>
            </div>
          )}

          {/* Teacher note */}
          {student.note && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              <p className="text-[10px] font-bold text-violet-500 mb-0.5">📝 ملاحظة المعلمة</p>
              <p className="text-sm text-gray-700">{student.note}</p>
            </div>
          )}

          {/* Meals */}
          {Object.keys(meals).length > 0 && (
            <div className="bg-emerald-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-bold text-emerald-600 mb-1.5 flex items-center gap-1"><Utensils size={11}/> الوجبات</p>
              <div className="flex gap-2 flex-wrap">
                {[['breakfast','الفطار'],['lunch','الغداء'],['snack','السناك']].map(([key, label]) => {
                  if (!meals[key]) return null;
                  const cfg = mealLabels[meals[key]] || mealLabels.none;
                  return (
                    <span key={key} className={`text-xs font-bold px-2.5 py-1 rounded-xl ${cfg.color}`}>
                      {label}: {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Potty */}
          {potty.length > 0 && (
            <div className="bg-amber-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-bold text-amber-600 mb-1 flex items-center gap-1"><Baby size={11}/> التويلت</p>
              <div className="flex flex-wrap gap-1.5">
                {potty.map((t, i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Behavior */}
          {behavior && (
            <div className="flex items-center gap-2">
              <Heart size={13} className="text-pink-500" />
              <span className="text-xs text-gray-500 font-bold">السلوك:</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl ${MOOD_COLORS[behavior] || 'bg-gray-100 text-gray-600'}`}>{behavior}</span>
            </div>
          )}

          {/* Teacher ↔ Parent Notes */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare size={13} className="text-purple-500" />
              <p className="text-xs font-bold text-purple-600">محادثة المعلمة وولي الأمر</p>
            </div>
            {!notesLoaded ? (
              <p className="text-xs text-gray-400 text-center py-2">جاري التحميل...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">لا توجد محادثات بعد</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto overscroll-contain">
                {notes.map((n) => (
                  <div key={n.id} className={`flex ${n.from_role === 'teacher' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-1.5 ${
                      n.from_role === 'teacher'
                        ? 'bg-indigo-50 border border-indigo-100 text-gray-700'
                        : 'bg-purple-100 text-purple-900'
                    }`}>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5">
                        {n.from_role === 'teacher' ? '👩‍🏫' : '👨‍👩'} {n.from_name}
                      </p>
                      <p className="text-xs">{n.text}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{fmtTime(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagerReportsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [classes, setClasses]   = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10));
  const [holiday, setHoliday]   = useState(null); // { isHoliday, label }

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { date };
      if (classFilter) params.classId = classFilter;
      const [stuRes, clsRes, holRes] = await Promise.all([
        api.get('/manager/daily-reports', { params }),
        api.get('/manager/classes'),
        api.get('/manager/holidays/check', { params: { date } }),
      ]);
      setStudents(stuRes.data);
      setClasses(clsRes.data);
      setHoliday(holRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [date, classFilter]);

  const filtered = students.filter((s) =>
    !search || s.name.includes(search) || (s.class_name || '').includes(search)
  );

  const presentCount = filtered.filter((s) => s.present).length;

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-black text-gray-800">التقارير اليومية 📊</h1>
        <p className="text-sm text-gray-500 mt-0.5">{fmtDate(date)}</p>
      </div>

      {/* Holiday banner */}
      {holiday?.isHoliday && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🏖️</span>
          <div>
            <p className="font-bold text-orange-700 text-sm">يوم إجازة</p>
            <p className="text-xs text-orange-500">{holiday.label || 'إجازة رسمية'} — الغياب في هذا اليوم لا يُحتسب</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Date */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">التاريخ</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
          />
        </div>
        {/* Class filter */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">الفصل</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 bg-white"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            <option value="">كل الفصول</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">بحث</label>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اسم الطالب..."
              className="w-full border border-gray-200 rounded-xl pr-8 pl-3 py-2 text-sm focus:outline-none focus:border-violet-400"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'إجمالي الطلاب', value: filtered.length, icon: '👥', color: 'bg-blue-50 text-blue-700' },
          { label: 'الحاضرون', value: presentCount, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
          { label: holiday?.isHoliday ? 'مفترض غيابهم' : 'الغائبون', value: filtered.length - presentCount, icon: holiday?.isHoliday ? '🏖️' : '❌', color: holiday?.isHoliday ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.color}`}>
            <p className="text-2xl mb-0.5">{s.icon}</p>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Student cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">⏳</p>
          <p className="text-sm font-bold">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm font-bold">لا توجد بيانات</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <StudentReportCard key={s.id} student={s} isHoliday={holiday?.isHoliday} />
          ))}
        </div>
      )}
    </div>
  );
}
