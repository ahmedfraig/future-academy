import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { teachers as initialTeachers, classes } from '../../data/dummyData';
import { ConfirmDialog, FormModal, Field, inputCls, selectCls } from './shared/SharedComponents';

const emptyForm = { name: '', phone: '', email: '', specialization: 'رياض أطفال', assignedClasses: [], avatar: '👩‍🏫', active: true };
const specOptions = ['رياض أطفال', 'تربية خاصة', 'فنون وحرف', 'موسيقى', 'تربية بدنية', 'لغات'];

export default function TeachersManager() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleClass = (cid) => {
    setForm((f) => ({
      ...f,
      assignedClasses: f.assignedClasses.includes(cid)
        ? f.assignedClasses.filter((x) => x !== cid)
        : [...f.assignedClasses, cid],
    }));
  };

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t }); setEditId(t.id); setModal('edit'); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (modal === 'add') {
      const newId = Math.max(...teachers.map((t) => t.id)) + 1;
      setTeachers((prev) => [...prev, { ...form, id: newId, joinDate: new Date().toISOString().split('T')[0] }]);
      showToast(`✅ تم إضافة المعلمة: ${form.name}`);
    } else {
      setTeachers((prev) => prev.map((t) => (t.id === editId ? { ...t, ...form } : t)));
      showToast(`✅ تم تعديل بيانات: ${form.name}`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    const name = teachers.find((t) => t.id === confirmId)?.name;
    setTeachers((prev) => prev.filter((t) => t.id !== confirmId));
    setConfirmId(null);
    showToast(`🗑️ تم حذف المعلمة: ${name}`);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة المعلمات 👩‍🏫</h1>
          <p className="text-sm text-gray-400 mt-0.5">{teachers.filter((t) => t.active).length} معلمة نشطة</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-pink-200 active:scale-95 self-start">
          <Plus size={18} /> إضافة معلمة
        </button>
      </div>

      {/* Teachers List */}
      <div className="flex flex-col gap-3">
        {teachers.map((t) => (
          <div key={t.id} className={`bg-white rounded-3xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow ${!t.active ? 'opacity-60' : 'border-gray-100'}`}>
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl flex-shrink-0">
                {t.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-gray-800 text-base">{t.name}</p>
                  {!t.active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">غير نشطة</span>}
                </div>
                <p className="text-xs text-pink-500 font-medium mt-0.5">{t.specialization}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={10} /> <span dir="ltr">{t.phone}</span></span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={10} /> {t.email}</span>
                </div>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {t.assignedClasses.length === 0
                ? <span className="text-xs text-gray-400 italic">لا يوجد فصول معينة</span>
                : t.assignedClasses.map((cid) => (
                    <span key={cid} className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-xl">{cid}</span>
                  ))
              }
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(t)} className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center">
                <Pencil size={14} className="text-blue-600" />
              </button>
              <button onClick={() => setConfirmId(t.id)} className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <FormModal isOpen={!!modal} title={modal === 'add' ? 'إضافة معلمة جديدة' : 'تعديل بيانات المعلمة'} icon="👩‍🏫" onClose={() => setModal(null)} onSave={handleSave} saveLabel={modal === 'add' ? 'إضافة' : 'حفظ'}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الاسم الكامل">
            <input name="name" value={form.name} onChange={handleChange} placeholder="أ. الاسم" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
          </Field>
          <Field label="التخصص">
            <select name="specialization" value={form.specialization} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              {specOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="رقم الجوال">
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="05XXXXXXXX" className={inputCls} dir="ltr" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input name="email" value={form.email} onChange={handleChange} placeholder="name@rawdah.sa" className={inputCls} dir="ltr" />
          </Field>
        </div>
        <Field label="الفصول المعينة (يمكن تعديلها من صفحة التعيينات)">
          <div className="flex flex-wrap gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleClass(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  form.assignedClasses?.includes(c.id)
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-violet-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Field>
        <Field label="">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-violet-600" />
            <span className="text-sm text-gray-700 font-medium">معلمة نشطة حالياً</span>
          </label>
        </Field>
      </FormModal>

      <ConfirmDialog isOpen={!!confirmId} title="حذف المعلمة" message={`هل أنت متأكد من حذف "${teachers.find((t) => t.id === confirmId)?.name}"؟`} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">{toast}</div>}
    </div>
  );
}
