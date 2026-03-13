import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Phone, KeyRound, Copy, X } from 'lucide-react';
import api from '../../services/api';
import { ConfirmDialog, FormModal, Field, inputCls, selectCls } from './shared/SharedComponents';

const emptyForm = { name: '', phone: '', specialization: 'رياض أطفال', assignedClasses: [], active: true };
const specOptions = ['رياض أطفال', 'تربية خاصة', 'فنون وحرف', 'موسيقى', 'تربية بدنية', 'لغات'];

export default function TeachersManager() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [inviteModal, setInviteModal] = useState(null); // { name, code }
  const [generatingId, setGeneratingId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const generateCode = async (teacher) => {
    setGeneratingId(teacher.id);
    try {
      const { data } = await api.post(`/manager/teachers/${teacher.id}/generate-code`);
      setInviteModal({ name: data.teacherName, code: data.plainCode });
    } catch {
      showToast('❌ فشل توليد رمز الدعوة');
    } finally {
      setGeneratingId(null);
    }
  };

  const fetchData = async () => {
    try {
      const [teachRes, clsRes] = await Promise.all([
        api.get('/manager/teachers'),
        api.get('/manager/classes'),
      ]);
      setTeachers(teachRes.data);
      setClasses(clsRes.data);
    } catch {
      showToast('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Strip non-digits for phone field
    const val = name === 'phone' ? value.replace(/\D/g, '') : value;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : val }));
  };

  const toggleClass = (cid) => {
    setForm((f) => ({
      ...f,
      assignedClasses: f.assignedClasses.includes(cid)
        ? f.assignedClasses.filter((x) => x !== cid)
        : [...f.assignedClasses, cid],
    }));
  };

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (t) => {
    setForm({
      name: t.name, phone: t.phone || '',
      specialization: t.specialization, active: t.active,
      assignedClasses: t.assigned_classes || [],
    });
    setEditId(t.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/manager/teachers', {
          name: form.name, phone: form.phone,
          specialization: form.specialization, assignedClasses: form.assignedClasses,
        });
        setTeachers((prev) => [...prev, data]);
        showToast(`✅ تم إضافة المعلمة: ${form.name}`);
      } else {
        const { data } = await api.put(`/manager/teachers/${editId}`, {
          name: form.name, phone: form.phone,
          specialization: form.specialization, active: form.active,
        });
        setTeachers((prev) => prev.map((t) => t.id === editId ? data : t));
        showToast(`✅ تم تعديل بيانات: ${form.name}`);
      }
      setModal(null);
    } catch {
      showToast('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const teacher = teachers.find((t) => t.id === confirmId);
    try {
      await api.delete(`/manager/teachers/${confirmId}`);
      setTeachers((prev) => prev.filter((t) => t.id !== confirmId));
      showToast(`🗑️ تم حذف المعلمة: ${teacher?.name}`);
    } catch {
      showToast('❌ فشل حذف المعلمة');
    } finally {
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⏳</div>
          <p className="text-gray-400 text-sm font-medium">جاري تحميل بيانات المعلمات...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl flex-shrink-0">
                {t.avatar || '👩‍🏫'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-gray-800 text-base">{t.name}</p>
                  {!t.active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">غير نشطة</span>}
                </div>
                <p className="text-xs text-pink-500 font-medium mt-0.5">{t.specialization}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={10} /> <span dir="ltr">{t.phone}</span></span>
                </div>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {(!t.assigned_classes || t.assigned_classes.length === 0)
                ? <span className="text-xs text-gray-400 italic">لا يوجد فصول معينة</span>
                : t.assigned_classes.map((cid) => (
                    <span key={cid} className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-xl">{cid}</span>
                  ))
              }
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => generateCode(t)}
                disabled={generatingId === t.id}
                className="w-9 h-9 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center justify-center disabled:opacity-40" title="توليد رمز دعوة للمعلمة"
              >
                {generatingId === t.id
                  ? <span className="animate-spin text-xs">⟳</span>
                  : <KeyRound size={14} className="text-amber-600" />}
              </button>
              <button onClick={() => openEdit(t)} className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center">
                <Pencil size={14} className="text-blue-600" />
              </button>
              <button onClick={() => setConfirmId(t.id)} className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {teachers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👩‍🏫</p>
            <p className="text-sm font-medium">لا توجد معلمات مسجلة بعد</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal isOpen={!!modal} title={modal === 'add' ? 'إضافة معلمة جديدة' : 'تعديل بيانات المعلمة'} icon="👩‍🏫" onClose={() => setModal(null)} onSave={handleSave} saveLabel={saving ? '⟳ جاري الحفظ...' : modal === 'add' ? 'إضافة' : 'حفظ'}>
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
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="05XXXXXXXX" className={inputCls} dir="ltr" maxLength={10} inputMode="numeric" />
            {form.phone.length > 0 && !/^0\d{9}$/.test(form.phone) && (
              <p className="text-xs text-amber-600 mt-1">يجب أن يكون 10 أرقام ويبدأ بـ 0</p>
            )}
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
        {modal === 'edit' && (
          <Field label="">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-violet-600" />
              <span className="text-sm text-gray-700 font-medium">معلمة نشطة حالياً</span>
            </label>
          </Field>
        )}
      </FormModal>

      <ConfirmDialog isOpen={!!confirmId} title="حذف المعلمة" message={`هل أنت متأكد من حذف "${teachers.find((t) => t.id === confirmId)?.name}"؟`} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />

      {/* Invite Code Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <KeyRound size={18} className="text-amber-600" />
                </div>
                <h3 className="font-black text-gray-800">رمز دعوة المعلمة</h3>
              </div>
              <button onClick={() => setInviteModal(null)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500">رمز الدعوة الخاص بـ <span className="font-bold text-gray-800">{inviteModal.name}</span></p>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
              <p className="font-black text-2xl tracking-widest text-amber-800 select-all" dir="ltr">{inviteModal.code}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-red-600">⚠️ يُعرض هذا الرمز مرة واحدة فقط — سلّمه للمعلمة الآن</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(inviteModal.code); showToast('✅ تم نسخ الرمز'); }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm transition-all"
            >
              <Copy size={15} /> نسخ الرمز
            </button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">{toast}</div>}
    </div>
  );
}
