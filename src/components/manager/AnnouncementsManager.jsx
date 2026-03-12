import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Send, Calendar } from 'lucide-react';
import { announcements as initialAnnouncements, classes } from '../../data/dummyData';
import { ConfirmDialog, FormModal, Field, inputCls, selectCls } from './shared/SharedComponents';

const colorOptions = ['blue', 'green', 'yellow', 'red', 'purple'];
const colorLabel = { blue: 'أزرق — معلومات', green: 'أخضر — إيجابي', yellow: 'أصفر — تحذير', red: 'أحمر — عاجل', purple: 'بنفسجي — مهم' };
const colorBg = { blue:'bg-blue-50 border-blue-200', green:'bg-emerald-50 border-emerald-200', yellow:'bg-amber-50 border-amber-200', red:'bg-red-50 border-red-200', purple:'bg-purple-50 border-purple-200' };
const colorTitle = { blue:'text-blue-700', green:'text-emerald-700', yellow:'text-amber-700', red:'text-red-700', purple:'text-purple-700' };
const colorDot = { blue:'bg-blue-400', green:'bg-emerald-400', yellow:'bg-amber-400', red:'bg-red-400', purple:'bg-purple-400' };

const emptyForm = { title: '', body: '', color: 'blue', target: 'all' };

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (a) => { setForm({ ...a }); setEditId(a.id); setModal('edit'); };

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    const now = 'الآن';
    if (modal === 'add') {
      const newId = Math.max(...announcements.map((a) => a.id), 0) + 1;
      setAnnouncements((prev) => [{ ...form, id: newId, date: now }, ...prev]);
      showToast(`📢 تم نشر الإعلان: ${form.title}`);
    } else {
      setAnnouncements((prev) => prev.map((a) => (a.id === editId ? { ...a, ...form } : a)));
      showToast(`✅ تم تعديل الإعلان`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    const title = announcements.find((a) => a.id === confirmId)?.title;
    setAnnouncements((prev) => prev.filter((a) => a.id !== confirmId));
    setConfirmId(null);
    showToast(`🗑️ تم حذف الإعلان: ${title}`);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الإعلانات 📢</h1>
          <p className="text-sm text-gray-400 mt-0.5">{announcements.length} إعلانات منشورة</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-red-200 active:scale-95 self-start">
          <Plus size={18} /> إعلان جديد
        </button>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-3">
        {announcements.map((ann) => (
          <div key={ann.id} className={`rounded-3xl border p-5 ${colorBg[ann.color] || colorBg.blue} flex flex-col sm:flex-row sm:items-start gap-4`}>
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colorDot[ann.color] || colorDot.blue}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className={`font-bold text-base ${colorTitle[ann.color] || colorTitle.blue}`}>{ann.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 ${colorTitle[ann.color]}`}>
                    {ann.target === 'all' ? '🌐 للجميع' : `📚 ${ann.target}`}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{ann.body}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  <span>{ann.date}</span>
                </div>
                <div className="flex gap-1.5 mr-auto">
                  <button onClick={() => openEdit(ann)} className="px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
                    <Pencil size={11} /> تعديل
                  </button>
                  <button onClick={() => setConfirmId(ann.id)} className="px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200 text-red-500 rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
                    <Trash2 size={11} /> حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm font-medium">لا توجد إعلانات منشورة</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal isOpen={!!modal} title={modal === 'add' ? 'إنشاء إعلان جديد' : 'تعديل الإعلان'} icon="📢" onClose={() => setModal(null)} onSave={handleSave} saveLabel={modal === 'add' ? 'نشر الإعلان' : 'حفظ التعديل'}>
        <Field label="عنوان الإعلان">
          <input name="title" value={form.title} onChange={handleChange} placeholder="اكتب عنوان الإعلان..." className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
        </Field>
        <Field label="نص الإعلان">
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="اكتب تفاصيل الإعلان هنا..."
            className={`${inputCls} resize-none min-h-[100px]`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الجمهور المستهدف">
            <select name="target" value={form.target} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              <option value="all">🌐 جميع الأولياء</option>
              {classes.map((c) => <option key={c.id} value={c.id}>📚 {c.name} فقط</option>)}
            </select>
          </Field>
          <Field label="نوع / لون الإعلان">
            <select name="color" value={form.color} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              {colorOptions.map((c) => <option key={c} value={c}>{colorLabel[c]}</option>)}
            </select>
          </Field>
        </div>
        {/* Preview */}
        {form.title && (
          <div className={`rounded-2xl p-3 border ${colorBg[form.color] || colorBg.blue}`}>
            <p className="text-xs text-gray-400 mb-1">معاينة:</p>
            <p className={`font-bold text-sm ${colorTitle[form.color]}`}>{form.title}</p>
            {form.body && <p className="text-xs text-gray-500 mt-0.5">{form.body}</p>}
          </div>
        )}
      </FormModal>

      <ConfirmDialog isOpen={!!confirmId} title="حذف الإعلان" message={`هل أنت متأكد من حذف إعلان "${announcements.find((a) => a.id === confirmId)?.title}"؟`} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">{toast}</div>}
    </div>
  );
}
