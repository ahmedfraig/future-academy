import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, KeyRound, Copy, X, MessageSquare, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { ConfirmDialog, FormModal, Field, inputCls, selectCls } from './shared/SharedComponents';

const emptyForm = { name: '', gender: 'ذكر', age: '', classId: '', parentName: '', phone: '', avatar: '👦', medication: false };

export default function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterClass, setFilterClass]   = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [inviteModal, setInviteModal]     = useState(null);
  const [generatingId, setGeneratingId]   = useState(null);
  const [notesPanel, setNotesPanel]       = useState(null);
  const [resetKeyModal, setResetKeyModal] = useState(null); // { name, key }
  const [generatingResetId, setGeneratingResetId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const generateCode = async (student) => {
    setGeneratingId(student.id);
    try {
      const { data } = await api.post(`/manager/students/${student.id}/generate-code`);
      setInviteModal({ name: data.studentName, code: data.plainCode });
    } catch {
      showToast('❌ فشل توليد رمز الدعوة');
    } finally {
      setGeneratingId(null);
    }
  };

  const generateResetKey = async (student) => {
    setGeneratingResetId(student.id);
    try {
      const { data } = await api.post(`/manager/students/${student.id}/generate-reset-key`);
      setResetKeyModal({ name: data.userName, key: data.resetKey });
    } catch (err) {
      showToast(err.response?.data?.error || '❌ فشل توليد رمز إعادة التعيين');
    } finally {
      setGeneratingResetId(null);
    }
  };

  const openNotes = async (student) => {
    setNotesPanel({ studentName: student.name, notes: [], loading: true });
    try {
      const { data } = await api.get(`/manager/students/${student.id}/notes`);
      setNotesPanel({ studentName: student.name, notes: data, loading: false });
    } catch {
      setNotesPanel({ studentName: student.name, notes: [], loading: false });
      showToast('❌ فشل تحميل الملاحظات');
    }
  };

  const fetchData = async () => {
    try {
      const [stuRes, clsRes] = await Promise.all([
        api.get('/manager/students'),
        api.get('/manager/classes'),
      ]);
      setStudents(stuRes.data);
      setClasses(clsRes.data);
    } catch {
      showToast('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = students.filter((s) => {
    const matchName   = s.name?.includes(search) || s.parent_name?.includes(search);
    const matchClass  = filterClass  === 'all' || s.class_id === filterClass;
    const matchGender = filterGender === 'all' || s.gender  === filterGender;
    return matchName && matchClass && matchGender;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Strip non-digits for phone field
    const val = name === 'phone' ? value.replace(/\D/g, '') : value;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : val }));
    if (name === 'gender') setForm((f) => ({ ...f, gender: value, avatar: value === 'ذكر' ? '👦' : '👧' }));
  };

  const openAdd  = () => { setForm({ ...emptyForm, classId: classes[0]?.id || '' }); setModal('add'); };
  const openEdit = (s) => {
    setForm({
      name: s.name, gender: s.gender, age: s.age, classId: s.class_id,
      parentName: s.parent_name, phone: s.phone || '', avatar: s.avatar,
      medication: s.medication,
    });
    setEditId(s.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/manager/students', {
          name: form.name, gender: form.gender, age: form.age,
          classId: form.classId, parentName: form.parentName,
          phone: form.phone, medication: form.medication,
        });
        setStudents((prev) => [...prev, data]);
        showToast(`✅ تم إضافة الطالب: ${form.name}`);
      } else {
        const { data } = await api.put(`/manager/students/${editId}`, {
          name: form.name, gender: form.gender, age: form.age,
          classId: form.classId, parentName: form.parentName,
          phone: form.phone, medication: form.medication,
        });
        setStudents((prev) => prev.map((s) => s.id === editId ? data : s));
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
    const student = students.find((s) => s.id === confirmId);
    try {
      await api.delete(`/manager/students/${confirmId}`);
      setStudents((prev) => prev.filter((s) => s.id !== confirmId));
      showToast(`🗑️ تم حذف الطالب: ${student?.name}`);
    } catch {
      showToast('❌ فشل حذف الطالب');
    } finally {
      setConfirmId(null);
    }
  };

  const handleToggleAttendance = async (student) => {
    const newPresent = !student.present;
    try {
      await api.patch(`/manager/students/${student.id}/attendance`, {
        present: newPresent,
        arrivalTime: newPresent ? new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : null,
      });
      setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, present: newPresent } : s));
      showToast(newPresent ? `✅ تم تسجيل حضور ${student.name}` : `❌ تم تسجيل غياب ${student.name}`);
    } catch { showToast('❌ فشل تحديث الحضور'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⏳</div>
          <p className="text-gray-400 text-sm font-medium">جاري تحميل بيانات الطلاب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الطلاب 👦</h1>
          <p className="text-sm text-gray-400 mt-0.5">إجمالي {students.length} طالب مسجل</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-blue-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> إضافة طالب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو اسم الوالد..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={`${selectCls} w-auto`} style={{ fontFamily: 'Cairo, sans-serif' }}>
          <option value="all">كل الفصول</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className={`${selectCls} w-auto`} style={{ fontFamily: 'Cairo, sans-serif' }}>
          <option value="all">الكل</option>
          <option value="ذكر">ذكور</option>
          <option value="أنثى">إناث</option>
        </select>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl font-medium flex-shrink-0">
          {filtered.length} نتيجة
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['الطالب', 'الحضور', 'الجنس', 'العمر', 'الفصل', 'ولي الأمر', 'رقم الجوال', 'الدواء', 'رمز الدعوة', 'الإجراءات'].map((h) => (
                  <th key={h} className="px-4 py-3 text-right font-bold text-gray-500 text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{s.avatar}</span>
                      <p className="font-bold text-gray-700 whitespace-nowrap">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAttendance(s)}
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all active:scale-90 ${
                        s.present
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {s.present ? <><CheckCircle size={11}/> حاضر</> : <><XCircle size={11}/> غائب</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{s.age} سنوات</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-xl">{s.class_id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.parent_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap" dir="ltr">{s.phone}</td>
                  <td className="px-4 py-3">
                    {s.medication
                      ? <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">💊 نعم</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.invite_code_hash
                      ? <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit"><KeyRound size={10}/>رمز مُولَّد</span>
                      : <span className="text-gray-300 text-xs">لا يوجد</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openNotes(s)}
                        className="w-8 h-8 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors" title="رسائل ولي الأمر">
                        <MessageSquare size={13} className="text-purple-600" />
                      </button>
                      <button onClick={() => generateCode(s)} disabled={generatingId === s.id}
                        className="w-8 h-8 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40" title="توليد رمز دعوة">
                        {generatingId === s.id
                          ? <span className="animate-spin text-xs">⟳</span>
                          : <KeyRound size={13} className="text-amber-600" />}
                      </button>
                      <button onClick={() => generateResetKey(s)} disabled={generatingResetId === s.id}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40" title="رمز إعادة كلمة مرور ولي الأمر">
                        {generatingResetId === s.id
                          ? <span className="animate-spin text-xs">⟳</span>
                          : <ShieldAlert size={13} className="text-red-500" />}
                      </button>
                      <button onClick={() => openEdit(s)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors" title="تعديل">
                        <Pencil size={13} className="text-blue-600" />
                      </button>
                      <button onClick={() => setConfirmId(s.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors" title="حذف">
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🤷</p>
              <p className="text-sm font-medium">لا توجد نتائج</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={!!modal}
        title={modal === 'add' ? 'إضافة طالب جديد' : 'تعديل بيانات الطالب'}
        icon={modal === 'add' ? '➕' : '✏️'}
        onClose={() => setModal(null)}
        onSave={handleSave}
        saveLabel={saving ? '⟳ جاري الحفظ...' : modal === 'add' ? 'إضافة' : 'حفظ التعديل'}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="اسم الطالب">
            <input name="name" value={form.name} onChange={handleChange} placeholder="الاسم الكامل" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
          </Field>
          <Field label="الجنس">
            <select name="gender" value={form.gender} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </Field>
          <Field label="العمر (بالسنوات)">
            <input name="age" value={form.age} onChange={handleChange} type="number" min="2" max="7" placeholder="مثل: 4" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
          </Field>
          <Field label="الفصل">
            <select name="classId" value={form.classId} onChange={handleChange} className={selectCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.grade_level}</option>)}
            </select>
          </Field>
        </div>
        <Field label="">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="medication" checked={form.medication} onChange={handleChange} className="w-4 h-4 accent-violet-600" />
            <span className="text-sm text-gray-700 font-medium">يحتاج دواءً يومياً 💊</span>
          </label>
        </Field>
      </FormModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmId}
        title="حذف الطالب"
        message={`هل أنت متأكد من حذف "${students.find((s) => s.id === confirmId)?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      {/* Notes Panel */}
      {notesPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-purple-600" />
                <h3 className="font-black text-gray-800">رسائل {notesPanel.studentName}</h3>
              </div>
              <button onClick={() => setNotesPanel(null)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
              {notesPanel.loading ? (
                <p className="text-sm text-gray-400 text-center py-6">جاري التحميل...</p>
              ) : notesPanel.notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">لا توجد رسائل بعد</p>
              ) : notesPanel.notes.map((n) => (
                <div key={n.id} className={`rounded-2xl p-4 border ${n.from_role === 'parent' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: n.from_role === 'parent' ? '#dbeafe' : '#ede9fe', color: n.from_role === 'parent' ? '#1d4ed8' : '#6d28d9' }}>
                      {n.from_role === 'parent' ? 'دولي الأمر' : 'معلمة'}
                    </span>
                    <span className="text-xs text-gray-500">{n.from_name}</span>
                    <span className="text-xs text-gray-400 mr-auto">
                      {new Date(n.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <KeyRound size={18} className="text-amber-600" />
                </div>
                <h3 className="font-black text-gray-800">رمز دعوة ولي الأمر</h3>
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
              <p className="text-xs font-bold text-red-600">⚠️ يُعرض هذا الرمز مرة واحدة فقط — سلّمه لولي الأمر الآن</p>
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

      {/* Reset Key Modal */}
      {resetKeyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <ShieldAlert size={18} className="text-red-500" />
                </div>
                <h3 className="font-black text-gray-800">رمز إعادة تعيين كلمة المرور</h3>
              </div>
              <button onClick={() => setResetKeyModal(null)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500">رمز إعادة التعيين لـ <span className="font-bold text-gray-800">{resetKeyModal.name}</span></p>
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
              <p className="text-xs font-bold text-red-500 mb-2">🔑 الرمز (صالح ساعة واحدة)</p>
              <p className="font-black text-3xl tracking-[0.3em] text-red-800 select-all" dir="ltr">{resetKeyModal.key}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-amber-700">⚠️ يُعرض هذا الرمز مرة واحدة فقط — أرسله لولي الأمر الآن</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(resetKeyModal.key); showToast('✅ تم نسخ الرمز'); }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all"
            >
              <Copy size={15} /> نسخ الرمز
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}
