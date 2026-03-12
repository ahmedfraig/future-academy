import React, { useState } from 'react';
import {
  X, Save, Pill, MessageSquare, Clock, Utensils, Baby, Heart, Star,
  Timer, CheckCircle, XCircle
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
const temperaments = ['هادئ', 'نشيط', 'انطوائي', 'اجتماعي', 'فضولي', 'عدواني'];

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

// ── MAIN MODAL ────────────────────────────────
export function StudentModal({ student, onClose, onSave }) {
  const [fields, setFields] = useState({
    note:        student?.note || '',
    medication:  student?.medication || false,
    mood:        student?.mood || null,
    arrivalTime: student?.arrival_time || student?.arrivalTime || '',
    meals:       student?.meals || {},
    potty:       student?.potty || [],
    behavior:    typeof student?.behavior === 'object' && student?.behavior !== null
      ? student.behavior
      : { withPeers: 3, withTeachers: 3, overall: student?.behavior || 'جيد 😊' },
    temperament: student?.temperament || '',
    present:     student?.present ?? false,
  });
  const [saving, setSaving]  = useState(false);
  const [saved, setSaved]    = useState(false);
  const [error, setError]    = useState('');

  if (!student) return null;

  const set    = (key, val) => setFields((f) => ({ ...f, [key]: val }));
  const addPotty    = () => { const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); setFields((f) => ({ ...f, potty: [...f.potty, now] })); };
  const removePotty = (idx) => setFields((f) => ({ ...f, potty: f.potty.filter((_, i) => i !== idx) }));
  const setMeal     = (meal, val) => setFields((f) => ({ ...f, meals: { ...f.meals, [meal]: val } }));
  const setBehavior = (key, val) => setFields((f) => ({ ...f, behavior: { ...f.behavior, [key]: val } }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      // 1. Attendance / arrival time
      await api.patch(`/teacher/students/${student.id}/attendance`, {
        present: fields.present,
        arrivalTime: fields.arrivalTime || null,
      });
      // 2. Mood
      if (fields.mood) await api.patch(`/teacher/students/${student.id}/mood`, { mood: fields.mood });
      // 3. Meals (only if set)
      const mealsToPatch = Object.entries(fields.meals).reduce((acc, [k, v]) => v ? { ...acc, [k]: v } : acc, {});
      if (Object.keys(mealsToPatch).length) await api.patch(`/teacher/students/${student.id}/meal`, { meals: mealsToPatch });
      // 4. Behavior
      if (fields.behavior) await api.patch(`/teacher/students/${student.id}/behavior`, { behavior: fields.behavior });
      // 5. Potty (replace entire array for today)
      await api.patch(`/teacher/students/${student.id}/potty`, { times: fields.potty });
      // 6. Note
      await api.patch(`/teacher/students/${student.id}/note`, { note: fields.note });
      // 7. Medication
      await api.patch(`/teacher/students/${student.id}/medication`, { medication: fields.medication });

      // Update parent state
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

  return (
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
          {/* Attendance toggle in header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => set('present', !fields.present)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                fields.present
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-500'
              }`}
            >
              {fields.present ? <><CheckCircle size={14}/>حاضر</> : <><XCircle size={14}/>غائب</>}
            </button>
            <button onClick={onClose} className="w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

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
            <div className="flex gap-3 justify-around">
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

          {/* 7. ملاحظة خاصة */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-violet-500" />
              <span className="font-bold text-sm text-gray-700">ملاحظة خاصة لولي الأمر</span>
            </div>
            <textarea
              value={fields.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="اكتب ملاحظة لولي الأمر تظهر في تطبيقه..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-violet-400 resize-none min-h-[80px]"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 rounded-xl py-2">{error}</p>}
        </div>

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
  );
}
