import React, { useState, useEffect } from 'react';
import {
  X, Save, Pill, MessageSquare, Clock, Utensils, Baby, Heart, Star,
  Timer, CheckCircle, XCircle, BookOpen, Send, ChevronRight, Reply
} from 'lucide-react';
import api from '../../services/api';

// ── HELPERS ───────────────────────────────────
const mealOptions = [
  { value: 'full', label: 'أكل كاملة 🟢', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { value: 'half', label: 'أكل نصفها 🟡', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { value: 'none', label: 'لم يأكل 🔴',   color: 'bg-red-100 border-red-300 text-red-700'     },
];
const MealPicker = ({ label, emoji, value, onChange }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 mb-1">{emoji} {label}</p>
    <div className="flex gap-1.5">
      {mealOptions.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 text-xs font-bold py-1.5 rounded-xl border-2 transition-all ${value === opt.value ? opt.color : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
          {opt.value === 'full' ? '✅ كاملة' : opt.value === 'half' ? '⚡ نصف' : '❌ لم يأكل'}
        </button>
      ))}
    </div>
  </div>
);

const moods       = ['😄', '😊', '😐', '😢', '😴', '😤'];
const behaviors   = ['ممتاز 🌟', 'جيد 😊', 'عادي 😐', 'يحتاج دعم 💛', 'صعب 😟'];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} onClick={() => onChange(i)}>
          <Star size={20} className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
        </button>
      ))}
    </div>
  );
}

// ── PARENT NOTES MODAL ────────────────────────
function ParentNotesModal({ studentId, studentName, onClose }) {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]     = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    api.get(`/teacher/notes/${studentId}`)
      .then(({ data }) => setNotes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const parentNotes  = notes.filter((n) => n.from_role === 'parent');
  const teacherNotes = notes.filter((n) => n.from_role === 'teacher');

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/teacher/notes/${studentId}`, { text: reply.trim() });
      setNotes((prev) => [data, ...prev]);
      setReply('');
      showToast('✅ تم إرسال الرد لولي الأمر');
    } catch {
      showToast('❌ فشل إرسال الرد');
    } finally {
      setSending(false);
    }
  };

  const fmt = (ts) => ts ? new Date(ts).toLocaleDateString('ar-SA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">رسائل ولي أمر</p>
              <p className="text-purple-200 text-xs">{studentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          {/* Parent messages */}
          <div>
            <p className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1.5">
              <MessageSquare size={13}/> رسائل ولي الأمر
              <span className="bg-purple-100 text-purple-700 text-xs font-black px-2 py-0.5 rounded-full">{loading ? '...' : parentNotes.length}</span>
            </p>
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">جاري التحميل...</p>
            ) : parentNotes.length === 0 ? (
              <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                <p className="text-sm text-gray-400">لا توجد رسائل من ولي الأمر</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {parentNotes.map((n) => (
                  <div key={n.id} className="bg-purple-50 rounded-2xl p-3 border border-purple-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-purple-500 font-medium">{n.from_name}</span>
                      <span className="text-xs text-gray-400">{fmt(n.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My sent replies */}
          {teacherNotes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1.5">
                <Reply size={13}/> ردودي السابقة
              </p>
              <div className="flex flex-col gap-2">
                {teacherNotes.map((n) => (
                  <div key={n.id} className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                    <span className="text-xs text-gray-400">{fmt(n.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reply box */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 mb-2">الرد على ولي الأمر</p>
          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="اكتب ردك هنا..."
              className="flex-1 bg-white border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 resize-none min-h-[60px]"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
            <button
              onClick={handleReply}
              disabled={!reply.trim() || sending}
              className={`w-11 rounded-2xl flex items-center justify-center transition-all ${reply.trim() && !sending ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-2xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN MODAL ────────────────────────────────
export function StudentModal({ student, onClose, onSave, isHoliday }) {
  const parsedBehavior = (() => {
    const b = student?.behavior;
    const KNOWN = ['ممتاز 🌟', 'جيد 😊', 'عادي 😐', 'يحتاج دعم 💛', 'صعب 😟'];
    const DEFAULT = { withPeers: 3, withTeachers: 3, overall: 'جيد 😊' };
    if (!b) return DEFAULT;
    let obj = b;
    if (typeof b === 'string') {
      try { obj = JSON.parse(b); } catch (_) { return DEFAULT; }
    }
    if (typeof obj !== 'object' || obj === null) return DEFAULT;
    let overall = obj.overall || 'جيد 😊';
    if (!KNOWN.includes(overall)) {
      try {
        const inner = JSON.parse(overall);
        overall = (inner && KNOWN.includes(inner.overall)) ? inner.overall : 'جيد 😊';
      } catch (_) { overall = 'جيد 😊'; }
    }
    return {
      withPeers:    typeof obj.withPeers === 'number'    ? obj.withPeers    : 3,
      withTeachers: typeof obj.withTeachers === 'number' ? obj.withTeachers : 3,
      overall,
    };
  })();

  const [fields, setFields] = useState({
    note:        student?.note || '',
    medication:  student?.medication || false,
    mood:        student?.mood || null,
    arrivalTime: student?.arrival_time || student?.arrivalTime || '',
    meals:       student?.meals || {},
    potty:       Array.isArray(student?.potty) ? student.potty : [],
    behavior:    parsedBehavior,
    temperament: student?.temperament || '',
    present:     student?.present ?? false,
  });

  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState('');
  const [showParentNotes, setShowParentNotes] = useState(false);
  const [parentNoteCount, setParentNoteCount] = useState(null);
  const [todaySubjects, setTodaySubjects]     = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // Fetch parent note count badge + today's subjects
  useEffect(() => {
    if (!student?.id) return;
    // Count parent notes for badge
    api.get(`/teacher/notes/${student.id}`)
      .then(({ data }) => setParentNoteCount(data.filter((n) => n.from_role === 'parent').length))
      .catch(() => setParentNoteCount(0));

    // Today's subjects for the class
    api.get('/teacher/daily-subjects')
      .then(({ data }) => setTodaySubjects(data))
      .catch(() => setTodaySubjects([]))
      .finally(() => setSubjectsLoading(false));
  }, [student?.id]);

  if (!student) return null;

  const set         = (key, val) => setFields((f) => ({ ...f, [key]: val }));
  const addPotty    = () => { const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); setFields((f) => ({ ...f, potty: [...f.potty, now] })); };
  const removePotty = (idx) => setFields((f) => ({ ...f, potty: f.potty.filter((_, i) => i !== idx) }));
  const setMeal     = (meal, val) => setFields((f) => ({ ...f, meals: { ...f.meals, [meal]: val } }));
  const setBehavior = (key, val) => setFields((f) => ({ ...f, behavior: { ...f.behavior, [key]: val } }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.patch(`/teacher/students/${student.id}/attendance`, {
        present: fields.present,
        arrivalTime: fields.arrivalTime || null,
      });
      if (fields.mood) await api.patch(`/teacher/students/${student.id}/mood`, { mood: fields.mood });
      const mealsToPatch = Object.entries(fields.meals).reduce((acc, [k, v]) => v ? { ...acc, [k]: v } : acc, {});
      if (Object.keys(mealsToPatch).length) await api.patch(`/teacher/students/${student.id}/meal`, { meals: mealsToPatch });
      if (fields.behavior) await api.patch(`/teacher/students/${student.id}/behavior`, { behavior: fields.behavior });
      await api.patch(`/teacher/students/${student.id}/potty`, { times: fields.potty });
      await api.patch(`/teacher/students/${student.id}/note`, { note: fields.note });
      await api.patch(`/teacher/students/${student.id}/medication`, { medication: fields.medication });

      onSave({ ...student, ...fields, arrival_time: fields.arrivalTime });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || '❌ فشل الحفظ، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const moodBg = { '😄': 'bg-emerald-50', '😊': 'bg-blue-50', '😐': 'bg-amber-50', '😢': 'bg-red-50', '😴': 'bg-purple-50', '😤': 'bg-orange-50' };

  const subjectColorMap = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col animate-slide-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 flex-shrink-0 ${moodBg[fields.mood] || 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">{student.avatar}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">{student.name}</h3>
                <p className="text-xs text-gray-500">{student.class_id || student.classId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Parent notes button with badge */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowParentNotes(true); }}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all"
              >
                <MessageSquare size={14}/>
                رسائل الأهل
                {parentNoteCount !== null && parentNoteCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                    {parentNoteCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => !isHoliday && set('present', !fields.present)}
                disabled={!!isHoliday}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  isHoliday
                    ? 'bg-orange-50 border-orange-200 text-orange-500 cursor-not-allowed opacity-60'
                    : fields.present
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 active:scale-95'
                    : 'bg-red-100 border-red-300 text-red-600 active:scale-95'
                }`}
              >
                {isHoliday
                  ? <><span>🏖️</span>إجازة</>
                  : fields.present
                  ? <><CheckCircle size={14}/>حاضر</>
                  : <><XCircle size={14}/>غائب</>
                }
              </button>
              <button onClick={onClose} className="w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
            {/* Holiday lock notice */}
            {isHoliday && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center gap-3">
                <span className="text-3xl">🏖️</span>
                <div>
                  <p className="font-black text-orange-700 text-sm">يوم إجازة</p>
                  <p className="text-xs text-orange-500 mt-0.5">لا يمكن تسجيل الحضور أو البيانات في أيام الإجازة</p>
                </div>
              </div>
            )}

            <div className={isHoliday ? 'opacity-40 pointer-events-none' : ''}>

            {/* 0. مواد اليوم */}
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-3">
                <BookOpen size={14}/> مواد اليوم
              </p>
              {subjectsLoading ? (
                <p className="text-xs text-gray-400 text-center py-1">جاري التحميل...</p>
              ) : todaySubjects.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-1">لم تُضف مواد لهذا الفصل بعد</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {todaySubjects.map((s) => {
                    const cls = subjectColorMap[s.color] || subjectColorMap.blue;
                    return (
                      <div key={s.id} className={`flex flex-col gap-1 px-3 py-2 rounded-2xl border text-xs font-bold ${cls} ${!s.taught ? 'opacity-50' : ''}`}>
                        <span>{s.icon} {s.name}</span>
                        {s.taught && (
                          <span className="text-[10px] font-medium opacity-80">✅ تم التدريس</span>
                        )}
                        {s.assignment && (
                          <span className="text-[10px] font-bold text-gray-600">📝 واجب: {s.assignment}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 1. وقت الوصول */}
            <div className="bg-sky-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-sky-600 flex items-center gap-1.5 mb-2"><Timer size={14}/> وقت الوصول</p>
              <input
                type="time"
                value={fields.arrivalTime}
                onChange={(e) => set('arrivalTime', e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-sky-400 text-center"
                dir="ltr"
              />
            </div>

            {/* 2. المزاج */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-3"><Heart size={14}/> المزاج والمشاعر</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {moods.map((m) => (
                  <button key={m} onClick={() => set('mood', m)}
                    className={`text-2xl transition-all ${fields.mood === m ? 'scale-125 drop-shadow-md' : 'opacity-50 hover:opacity-80 hover:scale-110'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. الوجبات */}
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mb-3"><Utensils size={14}/> الوجبات</p>
              <div className="flex flex-col gap-3">
                <MealPicker label="الفطار" emoji="🥐" value={fields.meals.breakfast} onChange={(v) => setMeal('breakfast', v)} />
                <MealPicker label="الغداء" emoji="🍛" value={fields.meals.lunch}     onChange={(v) => setMeal('lunch', v)}     />
                <MealPicker label="السناك" emoji="🍎" value={fields.meals.snack}     onChange={(v) => setMeal('snack', v)}     />
              </div>
            </div>

            {/* 4. الحمام */}
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5"><Baby size={14}/> زيارات الحمام</p>
                <button onClick={addPotty} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-all">
                  + تسجيل الآن
                </button>
              </div>
              {fields.potty.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-1">لا توجد سجلات</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {fields.potty.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 bg-white border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                      <Clock size={11} />{t}
                      <button onClick={() => removePotty(i)} className="text-amber-400 hover:text-red-500 mr-1">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 5. السلوك */}
            <div className="bg-pink-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-pink-600 flex items-center gap-1.5 mb-3"><Heart size={14}/> السلوك</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-bold">مع الأصدقاء</span>
                  <StarRating value={fields.behavior.withPeers || 3} onChange={(v) => setBehavior('withPeers', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-bold">مع المعلمات</span>
                  <StarRating value={fields.behavior.withTeachers || 3} onChange={(v) => setBehavior('withTeachers', v)} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-2">التقييم العام</p>
                  <div className="flex flex-wrap gap-2">
                    {behaviors.map((b) => (
                      <button key={b} onClick={() => setBehavior('overall', b)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border-2 transition-all ${fields.behavior.overall === b ? 'bg-pink-500 text-white border-pink-500' : 'bg-white border-gray-200 text-gray-600'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. الدواء */}
            <div className="flex items-center justify-between bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100">
              <div className="flex items-center gap-2">
                <Pill size={16} className="text-orange-500" />
                <div>
                  <p className="font-bold text-sm text-orange-700">الدواء اليومي</p>
                  <p className="text-xs text-orange-400">هل تناول الطفل دواءه؟</p>
                </div>
              </div>
              <button onClick={() => set('medication', !fields.medication)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${fields.medication ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${fields.medication ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* 7. ملاحظة اليوم لولي الأمر */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={15} className="text-violet-500" />
                <span className="font-bold text-sm text-gray-700">ملاحظة اليوم لولي الأمر</span>
                <span className="text-xs text-gray-400">(تظهر في التقرير اليومي والملاحظات)</span>
              </div>
              <textarea
                value={fields.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="اكتب ملاحظة تظهر لولي الأمر في تقرير اليوم وقسم الملاحظات..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-violet-400 resize-none min-h-[80px]"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 rounded-xl py-2">{error}</p>}
            </div>{/* end holiday-lock wrapper */}
          </div>{/* end scrollable body */}

          {/* Fixed Save Button */}
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-base transition-all ${
                saved ? 'bg-emerald-500 text-white' : saving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white active:scale-95'
              }`}
            >
              {saved ? '✅ تم الحفظ!' : saving ? '⟳ جاري الحفظ...' : <><Save size={16}/> حفظ تقرير اليوم</>}
            </button>
          </div>
        </div>
      </div>

      {/* Parent Notes Modal (rendered on top of StudentModal) */}
      {showParentNotes && (
        <ParentNotesModal
          studentId={student.id}
          studentName={student.name}
          onClose={() => setShowParentNotes(false)}
        />
      )}
    </>
  );
}
