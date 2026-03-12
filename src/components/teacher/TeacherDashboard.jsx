import React, { useState, useEffect, useCallback } from 'react';
import { TeacherHeader, GlobalAcademicForm } from './TeacherHeader';
import { StudentsGrid } from './StudentsGrid';
import { BulkActionBar } from './BulkActionBar';
import { StudentModal } from './StudentModal';
import api from '../../services/api';

const moodOptions = [
  { emoji: '😄', label: 'سعيد' },
  { emoji: '😊', label: 'بخير' },
  { emoji: '😐', label: 'عادي' },
  { emoji: '😢', label: 'حزين' },
  { emoji: '😴', label: 'متعب' },
  { emoji: '😤', label: 'عصبي' },
];

export default function TeacherDashboard() {
  const [allStu, setAllStu]   = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [modalStudent, setModalStudent]   = useState(null);
  const [toastMsg, setToastMsg]           = useState(null);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500); };

  // Load all classes + students
  const fetchData = useCallback(async () => {
    try {
      const [clsRes, stuRes] = await Promise.all([
        api.get('/teacher/classes'),
        api.get('/teacher/students'),
      ]);
      setClasses(clsRes.data);
      setAllStu(stuRes.data);
      if (!currentClass && clsRes.data.length > 0) setCurrentClass(clsRes.data[0].id);
    } catch {
      showToast('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Students filtered by current class
  const students = allStu.filter((s) => s.class_id === currentClass);
  const presentCount = students.filter((s) => s.present).length;

  const handleClassChange = (cls) => { setCurrentClass(cls); setSelectedIds([]); setModalStudent(null); };

  // Selection
  const handleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);

  // Toggle single student attendance
  const handleToggleAttendance = async (student) => {
    const newPresent = !student.present;
    try {
      const { data } = await api.patch(`/teacher/students/${student.id}/attendance`, {
        present: newPresent,
        arrivalTime: newPresent ? new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : null,
      });
      setAllStu((prev) => prev.map((s) => s.id === student.id ? { ...s, present: data.present, arrival_time: data.arrival_time } : s));
      showToast(newPresent ? `✅ تم تسجيل حضور: ${student.name}` : `❌ تم تسجيل غياب: ${student.name}`);
    } catch { showToast('❌ فشل تحديث الحضور'); }
  };

  // Update student in state after modal save
  const mutateStudent = (updated) => {
    setAllStu((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    if (modalStudent?.id === updated.id) setModalStudent(updated);
  };

  // Bulk: set meal for selected students
  const handleBulkMeal = async (mealId) => {
    const mealLabels = { breakfast: 'الفطار', lunch: 'الغداء', snack: 'السناك' };
    try {
      await Promise.all(
        selectedIds.map((id) => api.patch(`/teacher/students/${id}/meal`, { meals: { [mealId]: 'full' } }))
      );
      setAllStu((prev) => prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, meals: { ...(s.meals || {}), [mealId]: 'full' } } : s
      ));
      showToast(`✅ تم تسجيل وجبة ${mealLabels[mealId]} لـ ${selectedIds.length} طلاب`);
    } catch { showToast('❌ فشل تسجيل الوجبة'); }
    clearSelection();
  };

  // Bulk: potty for selected students
  const handleBulkPotty = async () => {
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    try {
      await Promise.all(selectedIds.map((id) => api.patch(`/teacher/students/${id}/potty`, {})));
      setAllStu((prev) => prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, potty: [...(s.potty || []), now] } : s
      ));
      showToast(`🚽 تم تسجيل التويلت الساعة ${now} لـ ${selectedIds.length} طلاب`);
    } catch { showToast('❌ فشل تسجيل التويلت'); }
    clearSelection();
  };

  // Bulk: mood for selected students
  const handleBulkMood = async (emoji) => {
    try {
      await Promise.all(selectedIds.map((id) => api.patch(`/teacher/students/${id}/mood`, { mood: emoji })));
      setAllStu((prev) => prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, mood: emoji } : s
      ));
      showToast(`${emoji} تم تعيين المزاج لـ ${selectedIds.length} طلاب`);
    } catch { showToast('❌ فشل تعيين المزاج'); }
    clearSelection();
  };

  const handleOpenModal = (student) => {
    const fresh = allStu.find((s) => s.id === student.id) || student;
    setModalStudent(fresh);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-500 font-bold">جاري تحميل بيانات الفصل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <TeacherHeader
        currentClass={currentClass}
        onClassChange={handleClassChange}
        attendance={{ present: presentCount, total: students.length }}
        allClasses={classes.map((c) => c.id)}
      />

      <main className="px-4 sm:px-6 py-5 pb-[120px] max-w-7xl mx-auto">
        <GlobalAcademicForm />

        {/* Attendance Quick Toggle Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-5 mb-3">
          <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            📋 سجّل الحضور والغياب بضغطة واحدة
          </p>
          <div className="flex flex-wrap gap-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => handleToggleAttendance(s)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                  s.present
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                }`}
              >
                <span>{s.avatar}</span>
                <span>{s.name.split(' ')[0]}</span>
                <span>{s.present ? '✅' : '❌'}</span>
              </button>
            ))}
            {students.length === 0 && <p className="text-sm text-gray-400">لا توجد طلاب في هذا الفصل</p>}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 text-base flex items-center gap-2">
            👨‍👩‍👧‍👦 طلاب فصل {currentClass}
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">
              {students.length} طالب • {presentCount} حاضر
            </span>
          </h2>
          {selectedIds.length > 0 && (
            <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
              إلغاء التحديد
            </button>
          )}
        </div>

        {/* Select All */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => {
              const presentIds = students.filter((s) => s.present).map((s) => s.id);
              setSelectedIds(selectedIds.length === presentIds.length ? [] : presentIds);
            }}
            className="text-xs bg-white border border-gray-200 hover:border-violet-300 text-gray-600 hover:text-violet-600 px-3 py-1.5 rounded-xl font-medium transition-all"
          >
            {selectedIds.length > 0 ? '☑ إلغاء الكل' : '☐ تحديد الكل'}
          </button>
          <span className="text-xs text-gray-400">انقر على الاسم/الصورة لفتح ملف الطالب</span>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏫</div>
            <p className="font-bold">لا يوجد طلاب في هذا الفصل</p>
          </div>
        ) : (
          <StudentsGrid
            students={students}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onOpenModal={handleOpenModal}
          />
        )}
      </main>

      <BulkActionBar
        selectedCount={selectedIds.length}
        moodOptions={moodOptions}
        onBulkMeal={handleBulkMeal}
        onBulkPotty={handleBulkPotty}
        onBulkMood={handleBulkMood}
        onClearSelection={clearSelection}
      />

      {modalStudent && (
        <StudentModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
          onSave={mutateStudent}
        />
      )}

      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
