import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const raw = String(dateStr).slice(0, 10);
  const [y, m, d] = raw.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ManagerHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');
  const [saving, setSaving]     = useState(false);

  // Special date form
  const [specialDate,  setSpecialDate]  = useState('');
  const [specialLabel, setSpecialLabel] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/manager/holidays');
      setHolidays(data);
    } catch { showToast('❌ فشل تحميل أيام الإجازة'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const weeklySet = new Set(
    holidays.filter((h) => h.type === 'weekly').map((h) => h.day_of_week)
  );
  const specials = holidays.filter((h) => h.type === 'special');

  const toggleWeekly = async (dow) => {
    if (saving) return;
    setSaving(true);
    try {
      if (weeklySet.has(dow)) {
        // Delete it
        const holiday = holidays.find((h) => h.type === 'weekly' && h.day_of_week === dow);
        await api.delete(`/manager/holidays/${holiday.id}`);
        showToast(`✅ تم إزالة ${DAY_NAMES[dow]} من أيام الإجازة`);
      } else {
        // Add it
        await api.post('/manager/holidays', {
          type: 'weekly',
          day_of_week: dow,
          label: `إجازة ${DAY_NAMES[dow]}`,
        });
        showToast(`✅ تم تحديد ${DAY_NAMES[dow]} كيوم إجازة`);
      }
      await fetch();
    } catch (err) {
      showToast(err.response?.data?.error || '❌ حدث خطأ');
    } finally { setSaving(false); }
  };

  const addSpecial = async () => {
    if (!specialDate) return showToast('⚠️ اختر تاريخاً');
    setSaving(true);
    try {
      await api.post('/manager/holidays', {
        type: 'special',
        date: specialDate,
        label: specialLabel.trim() || 'إجازة خاصة',
      });
      setSpecialDate('');
      setSpecialLabel('');
      await fetch();
      showToast('✅ تمت إضافة الإجازة');
    } catch (err) {
      showToast(err.response?.data?.error || '❌ حدث خطأ');
    } finally { setSaving(false); }
  };

  const deleteHoliday = async (id, label) => {
    try {
      await api.delete(`/manager/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      showToast(`🗑️ تم حذف "${label}"`);
    } catch { showToast('❌ فشل الحذف'); }
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-800">إدارة أيام الإجازة 🗓️</h1>
        <p className="text-sm text-gray-400 mt-0.5">الغياب في أيام الإجازة لا يُحتسب</p>
      </div>

      {/* ── Weekly Days ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-violet-500" />
          <h2 className="font-black text-gray-800 text-sm">أيام الإجازة الأسبوعية</h2>
        </div>
        <p className="text-xs text-gray-400">انقر يوماً لتحديده أو إلغائه — يُطبَّق كل أسبوع تلقائياً</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DAY_NAMES.map((name, dow) => {
            const active = weeklySet.has(dow);
            return (
              <button
                key={dow}
                onClick={() => toggleWeekly(dow)}
                disabled={saving}
                className={`flex flex-col items-center py-3 rounded-2xl border-2 font-bold text-xs transition-all duration-200 disabled:opacity-50 ${
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-lg mb-0.5">{active ? '🏖️' : '📅'}</span>
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Special Occasions ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-sky-500" />
          <h2 className="font-black text-gray-800 text-sm">إجازات خاصة / مناسبات</h2>
        </div>

        {/* Add form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1">التاريخ</label>
            <input
              type="date"
              value={specialDate}
              onChange={(e) => setSpecialDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="flex-[2]">
            <label className="block text-xs font-bold text-gray-500 mb-1">السبب / المناسبة</label>
            <input
              value={specialLabel}
              onChange={(e) => setSpecialLabel(e.target.value)}
              placeholder='مثال: اليوم الوطني'
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addSpecial}
              disabled={saving || !specialDate}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              <Plus size={15} /> إضافة
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">جاري التحميل...</p>
        ) : specials.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">لا توجد إجازات خاصة مضافة</p>
        ) : (
          <div className="flex flex-col gap-2">
            {specials.map((h) => (
              <div key={h.id} className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3">
                <span className="text-lg">🗓️</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{h.label || 'إجازة خاصة'}</p>
                  <p className="text-xs text-gray-500">{fmtDate(h.date)}</p>
                </div>
                <button
                  onClick={() => deleteHoliday(h.id, h.label)}
                  className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
