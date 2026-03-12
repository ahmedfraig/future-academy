import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import api from '../../services/api';
import { ConfirmDialog, FormModal, Field, inputCls, selectCls } from './shared/SharedComponents';

const colorOptions = ['blue','green','purple','orange','pink','teal'];
const gradeOptions = ['روضة أولى', 'روضة ثانية', 'تمهيدي'];
const emptyForm = { name: '', gradeLevel: 'روضة أولى', capacity: 20, teacherId: '', color: 'blue' };
const colorBg  = { blue:'bg-blue-100 text-blue-700', green:'bg-emerald-100 text-emerald-700', purple:'bg-purple-100 text-purple-700', orange:'bg-orange-100 text-orange-700', pink:'bg-pink-100 text-pink-700', teal:'bg-teal-100 text-teal-700' };
const colorBar = { blue:'bg-blue-500', green:'bg-emerald-500', purple:'bg-purple-500', orange:'bg-orange-500', pink:'bg-pink-500', teal:'bg-teal-500' };

export default function ClassesManager() {
  const [classes, setClasses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast]       = useState('');
  const [saving, setSaving]     = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchData = async () => {
    try {
      const [clsRes, teachRes] = await Promise.all([
        api.get('/manager/classes'),
        api.get('/manager/teachers'),
      ]);
      setClasses(clsRes.data);
      setTeachers(teachRes.data);
    } catch {
      showToast('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getTeacher = (tid) => teachers.find((t) => t.id === parseInt(tid));

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (cls) => {
    setForm({ name: cls.name, gradeLevel: cls.grade_level, capacity: cls.capacity, teacherId: cls.teacher_id?.toString() || '', color: cls.color });
    setEditId(cls.id);
    setModal('edit');
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/manager/classes', {
          name: form.name, gradeLevel: form.gradeLevel,
          capacity: parseInt(form.capacity), teacherId: form.teacherId || null, color: form.color,
        });
        setClasses((prev) => [...prev, data]);
        showToast(`✅ تم إنشاء الفصل: ${form.name}`);
      } else {
        const { data } = await api.put(`/manager/classes/${editId}`, {
          name: form.name, gradeLevel: form.gradeLevel,
          capacity: parseInt(form.capacity), teacherId: form.teacherId || null, color: form.color,
        });
        setClasses((prev) => prev.map((c) => c.id === editId ? data : c));
        showToast(`✅ تم تعديل الفصل: ${form.name}`);
      }
      setModal(null);
    } catch (err) {
      showToast(err.response?.data?.error || '❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const cls = classes.find((c) => c.id === confirmId);
    try {
      await api.delete(`/manager/classes/${confirmId}`);
      setClasses((prev) => prev.filter((c) => c.id !== confirmId));
      showToast(`🗑️ تم حذف الفصل: ${cls?.name}`);
    } catch {
      showToast('❌ فشل حذف الفصل');
    } finally {
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⏳</div>
          <p className="text-gray-400 text-sm font-medium">جاري تحميل الفصول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الفصول 🏫</h1>
          <p className="text-sm text-gray-400 mt-0.5">{classes.length} فصول دراسية</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-200 active:scale-95 self-start">
          <Plus size={18} /> إضافة فصل جديد
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const teacherObj = getTeacher(cls.teacher_id);
          const stuCount   = parseInt(cls.student_count) || 0;
          const pct        = Math.round((stuCount / cls.capacity) * 100);
          return (
            <div key={cls.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${colorBg[cls.color] || colorBg.blue}`}>{cls.grade_level}</span>
                  <h3 className="text-xl font-black text-gray-800 mt-2">{cls.name}</h3>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(cls)} className="w-8 h-8 bg-gray-100 hover:bg-blue-100 rounded-xl flex items-center justify-center">
                    <Pencil size={13} className="text-gray-500 hover:text-blue-600" />
                  </button>
                  <button onClick={() => setConfirmId(cls.id)} className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 size={13} className="text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2">
                <span className="text-xl">{teacherObj?.avatar || '❓'}</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">المعلمة</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{teacherObj?.name || cls.teacher_name || 'غير معين'}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1"><Users size={11} /> {stuCount} طالب</span>
                  <span>السعة: {cls.capacity}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colorBar[cls.color] || colorBar.blue} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className={`text-xs mt-1 font-medium ${pct >= 90 ? 'text-red-500' : pct >= 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {pct}% {pct >= 90 ? '⚠️ يقترب من الامتلاء' : pct >= 70 ? 'ممتلئ بشكل جيد' : 'لديه مساحة'}
                </p>
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-4 text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🏫</p>
            <p className="text-sm font-medium">لا توجد فصول مسجلة بعد</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal isOpen={!!modal} title={modal === 'add' ? 'إضافة فصل جديد' : 'تعديل الفصل'} icon="🏫" onClose={() => setModal(null)} onSave={handleSave} saveLabel={saving ? '⟳ جاري الحفظ...' : modal === 'add' ? 'إضافة' : 'حفظ'}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="اسم الفصل">
            <input name="name" value={form.name} onChange={handleChange} placeholder="مثال: KG1-C" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} disabled={modal === 'edit'} />
          </Field>
          <Field label="المرحلة">
            <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="الطاقة الاستيعابية">
            <input name="capacity" value={form.capacity} onChange={handleChange} type="number" min="5" max="50" className={inputCls} />
          </Field>
          <Field label="المعلمة المسؤولة">
            <select name="teacherId" value={form.teacherId} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              <option value="">— غير معين —</option>
              {teachers.filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="لون الفصل">
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((c) => (
              <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`w-8 h-8 rounded-xl border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'} ${colorBar[c]}`} />
            ))}
          </div>
        </Field>
      </FormModal>

      <ConfirmDialog isOpen={!!confirmId} title="حذف الفصل" message={`هل أنت متأكد من حذف فصل "${classes.find((c) => c.id === confirmId)?.name}"؟`} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">{toast}</div>}
    </div>
  );
}
