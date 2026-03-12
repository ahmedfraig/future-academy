import React, { useState, useMemo } from 'react';
import { TeacherHeader, GlobalAcademicForm } from './TeacherHeader';
import { StudentsGrid } from './StudentsGrid';
import { BulkActionBar } from './BulkActionBar';
import { StudentModal } from './StudentModal';
import { students as allStudents, teacher, classes } from '../../data/dummyData';

export default function TeacherDashboard() {
  // All students in memory so we can mutate across class changes
  const [allStu, setAllStu] = useState(allStudents);
  const [currentClass, setCurrentClass] = useState(teacher.currentClass);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalStudent, setModalStudent] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // ✅ FIX: Filter students by the currently-selected class
  const students = useMemo(
    () => allStu.filter((s) => s.classId === currentClass),
    [allStu, currentClass]
  );

  // Reset selection when class changes
  const handleClassChange = (cls) => {
    setCurrentClass(cls);
    setSelectedIds([]);
    setModalStudent(null);
  };

  // Computed attendance for the current class only
  const presentCount = students.filter((s) => s.present).length;

  // Toast helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Selection handlers
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelectedIds([]);

  // Mutate a student in the global allStu array
  const mutateStudent = (updated) => {
    setAllStu((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (modalStudent?.id === updated.id) setModalStudent(updated);
  };

  // Bulk actions
  const handleBulkMeal = (mealId) => {
    const mealLabels = { breakfast: 'الفطار', lunch: 'الغداء', snack: 'السناك' };
    setAllStu((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, meals: { ...(s.meals || {}), [mealId]: 'full' } } : s
      )
    );
    showToast(`✅ تم تسجيل وجبة ${mealLabels[mealId] || mealId} لـ ${selectedIds.length} طلاب`);
    clearSelection();
  };

  const handleBulkPotty = () => {
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setAllStu((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, potty: [...(s.potty || []), now] }
          : s
      )
    );
    showToast(`🚽 تم تسجيل التويلت الساعة ${now} لـ ${selectedIds.length} طلاب`);
    clearSelection();
  };

  const handleBulkMood = (emoji) => {
    setAllStu((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, mood: emoji } : s))
    );
    showToast(`${emoji} تم تعيين المزاج لـ ${selectedIds.length} طلاب`);
    clearSelection();
  };

  // Open modal with latest data from allStu
  const handleOpenModal = (student) => {
    const fresh = allStu.find((s) => s.id === student.id) || student;
    setModalStudent(fresh);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header — pass all classes for the selector */}
      <TeacherHeader
        currentClass={currentClass}
        onClassChange={handleClassChange}
        attendance={{ present: presentCount, total: students.length }}
        allClasses={classes.map((c) => c.id)}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-5 pb-[120px] max-w-7xl mx-auto">
        {/* Academic Form */}
        <GlobalAcademicForm />

        {/* Students Section Header */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h2 className="font-bold text-gray-700 text-base flex items-center gap-2">
            👨‍👩‍👧‍👦 طلاب فصل {currentClass}
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">
              {students.length} طالب
            </span>
          </h2>
          {selectedIds.length > 0 && (
            <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
              إلغاء التحديد
            </button>
          )}
        </div>

        {/* Select All / Deselect */}
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

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onBulkMeal={handleBulkMeal}
        onBulkPotty={handleBulkPotty}
        onBulkMood={handleBulkMood}
        onClearSelection={clearSelection}
      />

      {/* Individual Student Modal */}
      {modalStudent && (
        <StudentModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
          onSave={mutateStudent}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg animate-slide-up">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
