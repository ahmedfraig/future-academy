import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, UserCheck, Users, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingState from '../ui/LoadingState';

export default function AssignmentsPage() {
  const [classes, setClasses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');

  // Student move state
  const [selectedStu, setSelectedStu] = useState([]);
  const [sourceClass, setSourceClass]  = useState('');
  const [targetClass, setTargetClass]  = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchData = async () => {
    try {
      const [clsRes, teachRes, stuRes] = await Promise.all([
        api.get('/manager/classes'),
        api.get('/manager/teachers'),
        api.get('/manager/students'),
      ]);
      setClasses(clsRes.data);
      setTeachers(teachRes.data);
      setStudents(stuRes.data);
      if (clsRes.data.length > 0) setSourceClass(clsRes.data[0].id);
    } catch {
      showToast('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Assign teacher to class
  const handleAssignTeacher = async (classId, teacherId) => {
    try {
      const { data } = await api.patch(`/manager/classes/${classId}/teacher`, { teacherId: teacherId || null });
      setClasses((prev) => prev.map((c) => c.id === classId ? { ...c, teacher_id: data.teacher_id, teacher_name: teachers.find((t) => t.id === data.teacher_id)?.name } : c));
      // Refresh teachers to update assigned_classes arrays
      const teachRes = await api.get('/manager/teachers');
      setTeachers(teachRes.data);
      const t = teachers.find((x) => x.id === parseInt(teacherId));
      showToast(t ? `✅ تم تعيين ${t.name} لفصل ${classId}` : `✅ تم إزالة المعلمة من فصل ${classId}`);
    } catch {
      showToast('❌ فشل تعيين المعلمة');
    }
  };

  // Move students between classes
  const studentsInSource = students.filter((s) => s.class_id === sourceClass);
  const toggleStu = (id) => setSelectedStu((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleMoveStudents = async () => {
    if (!targetClass || selectedStu.length === 0) return;
    try {
      await Promise.all(
        selectedStu.map((stuId) => api.patch(`/manager/students/${stuId}/class`, { classId: targetClass }))
      );
      setStudents((prev) => prev.map((s) => selectedStu.includes(s.id) ? { ...s, class_id: targetClass } : s));
      // Refresh classes to get updated student counts
      const clsRes = await api.get('/manager/classes');
      setClasses(clsRes.data);
      showToast(`✅ تم نقل ${selectedStu.length} طلاب إلى ${targetClass}`);
      setSelectedStu([]);
    } catch {
      showToast('❌ فشل نقل الطلاب');
    }
  };

  if (loading) return <LoadingState message="جاري تحميل بيانات التعيينات..." />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-800">التعيينات 🔗</h1>
        <p className="text-sm text-gray-400 mt-0.5">تعيين المعلمات للفصول ونقل الطلاب</p>
      </div>

      {/* ===== Section 1: Teacher → Class Assignment ===== */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center"><UserCheck size={18} className="text-pink-600" /></div>
          <h2 className="font-bold text-gray-800">تعيين المعلمة على الفصل</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {classes.map((cls) => {
            const current = teachers.find((t) => t.id === cls.teacher_id);
            return (
              <div key={cls.id} className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-black text-gray-700">{cls.name}</span>
                  <span className="text-xs text-gray-400">{cls.grade_level}</span>
                </div>
                {current && (
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 mb-2 border border-pink-100">
                    <span className="text-lg">{current.avatar || '👩‍🏫'}</span>
                    <span className="text-xs font-bold text-pink-700 truncate">{current.name}</span>
                  </div>
                )}
                <select
                  value={cls.teacher_id?.toString() || ''}
                  onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-400"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  <option value="">— إزالة المعلمة —</option>
                  {teachers.filter((t) => t.active).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Section 2: Move Students Between Classes ===== */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><ArrowLeftRight size={18} className="text-amber-600" /></div>
          <h2 className="font-bold text-gray-800">نقل الطلاب بين الفصول</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Source class selector */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">من الفصل:</span>
                <select
                  value={sourceClass}
                  onChange={(e) => { setSourceClass(e.target.value); setSelectedStu([]); }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedStu.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                  {selectedStu.length} محدد
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {studentsInSource.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleStu(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-right ${
                    selectedStu.includes(s.id)
                      ? 'bg-amber-50 border-amber-400'
                      : 'bg-gray-50 border-gray-200 hover:border-amber-200'
                  }`}
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <span className="text-sm font-bold text-gray-700 flex-1 truncate">{s.name}</span>
                  {selectedStu.includes(s.id) && <CheckCircle size={16} className="text-amber-500" />}
                </button>
              ))}
              {studentsInSource.length === 0 && <p className="text-center text-sm text-gray-400 py-4">لا يوجد طلاب</p>}
            </div>
          </div>

          {/* Target class + confirm */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-sm font-bold text-gray-700 block mb-2">إلى الفصل:</span>
              <div className="grid grid-cols-2 gap-2">
                {classes.filter((c) => c.id !== sourceClass).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTargetClass(c.id)}
                    className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                      targetClass === c.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleMoveStudents}
              disabled={selectedStu.length === 0 || !targetClass}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedStu.length > 0 && targetClass
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeftRight size={16} />
              نقل {selectedStu.length > 0 ? `${selectedStu.length} طلاب` : 'الطلاب المحددين'}
              {targetClass && ` إلى ${targetClass}`}
            </button>

            {/* Class counts summary */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><Users size={12} /> عدد الطلاب في كل فصل</p>
              {classes.map((c) => {
                const cnt = students.filter((s) => s.class_id === c.id).length;
                return (
                  <div key={c.id} className="flex items-center justify-between py-1">
                    <span className="text-xs font-bold text-gray-600">{c.name}</span>
                    <span className={`text-xs font-bold ${cnt > c.capacity * 0.9 ? 'text-red-500' : 'text-emerald-600'}`}>{cnt}/{c.capacity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">{toast}</div>}
    </div>
  );
}
