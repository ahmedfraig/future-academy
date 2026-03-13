import React, { useState, useEffect, useCallback } from 'react';
import { TeacherHeader, GlobalAcademicForm } from './TeacherHeader';
import { StudentsGrid } from './StudentsGrid';
import { BulkActionBar } from './BulkActionBar';
import { StudentModal } from './StudentModal';
import { BookOpen, Plus, Trash2, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';

const moodOptions = [
  { emoji: '😄', label: 'سعيد' },
  { emoji: '😊', label: 'بخير' },
  { emoji: '😐', label: 'عادي' },
  { emoji: '😢', label: 'حزين' },
  { emoji: '😴', label: 'متعب' },
  { emoji: '😤', label: 'عصبي' },
];

// Subject color palette
const COLOR_OPTIONS = [
  { key: 'blue',    label: 'أزرق',   cls: 'bg-blue-500' },
  { key: 'emerald', label: 'أخضر',   cls: 'bg-emerald-500' },
  { key: 'violet',  label: 'بنفسجي', cls: 'bg-violet-500' },
  { key: 'sky',     label: 'سماوي',  cls: 'bg-sky-500' },
  { key: 'pink',    label: 'وردي',   cls: 'bg-pink-500' },
  { key: 'amber',   label: 'ذهبي',   cls: 'bg-amber-500' },
  { key: 'red',     label: 'أحمر',   cls: 'bg-red-500' },
];

const subjectBg = {
  blue:    'bg-blue-50 border-blue-200 text-blue-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  violet:  'bg-violet-50 border-violet-200 text-violet-700',
  sky:     'bg-sky-50 border-sky-200 text-sky-700',
  pink:    'bg-pink-50 border-pink-200 text-pink-700',
  amber:   'bg-amber-50 border-amber-200 text-amber-700',
  red:     'bg-red-50 border-red-200 text-red-700',
};

// ── SUBJECTS PANEL ────────────────────────────
function SubjectsPanel({ showToast, currentClass }) {
  const [subjects, setSubjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState(true);
  const [addMode, setAddMode]           = useState(false);
  const [newName, setNewName]           = useState('');
  const [newIcon, setNewIcon]           = useState('📚');
  const [newColor, setNewColor]         = useState('blue');
  const [saving, setSaving]             = useState(false);
  const [assignmentInputs, setAssignmentInputs]   = useState({});
  const [lessonTopicInputs, setLessonTopicInputs] = useState({});

  const fetchSubjects = useCallback(async (classId) => {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/daily-subjects', { params: { classId } });
      setSubjects(data);
      // Init both inputs from current data
      const incomingAssign = {};
      const incomingTopic  = {};
      data.forEach((s) => {
        incomingAssign[s.id] = s.assignment   || '';
        incomingTopic[s.id]  = s.lesson_topic || '';
      });
      setAssignmentInputs(incomingAssign);
      setLessonTopicInputs(incomingTopic);
    } catch {
      showToast('❌ فشل تحميل المواد');
    } finally { setLoading(false); }
  }, []);

  // Re-fetch whenever the active class changes
  useEffect(() => { if (currentClass) fetchSubjects(currentClass); }, [fetchSubjects, currentClass]);

  const toggleTaught = async (subject) => {
    const newTaught = !subject.taught;
    setSubjects((prev) => prev.map((s) => s.id === subject.id ? { ...s, taught: newTaught } : s));
    try {
      await api.post('/teacher/daily-subjects', {
        subjectId:   subject.id,
        classId:     currentClass,
        taught:      newTaught,
        lessonTopic: lessonTopicInputs[subject.id] || subject.lesson_topic || '',
        assignment:  assignmentInputs[subject.id]  || subject.assignment    || '',
      });
    } catch {
      setSubjects((prev) => prev.map((s) => s.id === subject.id ? { ...s, taught: subject.taught } : s));
      showToast('❌ فشل تحديث المادة');
    }
  };

  const saveSubjectDetails = async (subject) => {
    try {
      await api.post('/teacher/daily-subjects', {
        subjectId:   subject.id,
        classId:     currentClass,
        taught:      subject.taught,
        lessonTopic: lessonTopicInputs[subject.id] || '',
        assignment:  assignmentInputs[subject.id]  || '',
      });
      setSubjects((prev) => prev.map((s) =>
        s.id === subject.id
          ? { ...s, lesson_topic: lessonTopicInputs[s.id], assignment: assignmentInputs[s.id] }
          : s
      ));
      showToast('✅ تم الحفظ');
    } catch { showToast('❌ فشل الحفظ'); }
  };

  const handleAddSubject = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.post('/teacher/subjects', { name: newName.trim(), icon: newIcon, color: newColor, classId: currentClass });
      await fetchSubjects(currentClass);
      setNewName(''); setNewIcon('📚'); setNewColor('blue'); setAddMode(false);
      showToast('✅ تمت إضافة المادة');
    } catch (err) {
      showToast(err.response?.data?.error || '❌ فشل إضافة المادة');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teacher/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      showToast('🗑 تم حذف المادة');
    } catch { showToast('❌ فشل حذف المادة'); }
  };

  const taughtCount = subjects.filter((s) => s.taught).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-5 mb-3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-indigo-600" />
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800 text-sm">مواد اليوم والواجبات</p>
            <p className="text-xs text-gray-400">
              {loading ? 'جاري التحميل...' : `${taughtCount} / ${subjects.length} تم تدريسها`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {taughtCount > 0 && (
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
              {taughtCount} مادة ✅
            </span>
          )}
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {/* Subject Cards */}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">جاري التحميل...</p>
          ) : subjects.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-400">لم تُضف مواد لهذا الفصل بعد</p>
              <p className="text-xs text-gray-300 mt-1">اضغط + لإضافة مادة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subjects.map((s) => {
                const colors = subjectBg[s.color] || subjectBg.blue;
                return (
                  <div key={s.id} className={`rounded-2xl border p-3 transition-all ${s.taught ? colors : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      {/* Toggle taught button */}
                      <button
                        onClick={() => toggleTaught(s)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                          s.taught ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-300'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      {/* Icon + Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${s.taught ? '' : 'text-gray-500'}`}>
                          {s.icon} {s.name}
                        </p>
                      </div>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {/* Lesson Topic + Assignment inputs (shown when marked as taught) */}
                    {s.taught && (
                      <div className="mt-3 flex flex-col gap-2">
                        {/* What was taught */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 mb-1 pr-1">📖 ماذا درسنا اليوم؟</p>
                          <input
                            type="text"
                            value={lessonTopicInputs[s.id] ?? ''}
                            onChange={(e) => setLessonTopicInputs((prev) => ({ ...prev, [s.id]: e.target.value }))}
                            placeholder="مثال: الأعداد من 1 إلى 10، أو حرف الألف..."
                            className="w-full bg-white/80 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                            style={{ fontFamily: 'Cairo, sans-serif' }}
                          />
                        </div>
                        {/* Homework assignment */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 mb-1 pr-1">📝 الواجب المنزلي (اختياري)</p>
                          <input
                            type="text"
                            value={assignmentInputs[s.id] ?? ''}
                            onChange={(e) => setAssignmentInputs((prev) => ({ ...prev, [s.id]: e.target.value }))}
                            placeholder="مثال: حل صفحة 5 من الكتاب..."
                            className="w-full bg-white/80 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                            style={{ fontFamily: 'Cairo, sans-serif' }}
                          />
                        </div>
                        <button
                          onClick={() => saveSubjectDetails(s)}
                          className="w-full text-xs font-bold bg-indigo-500 text-white py-1.5 rounded-xl hover:bg-indigo-600 transition-all"
                        >
                          💾 حفظ
                        </button>
                      </div>
                    )}
                    {/* Show saved lesson_topic/assignment when not taught */}
                    {!s.taught && (s.lesson_topic || s.assignment) && (
                      <div className="mt-1 pr-11 flex flex-col gap-0.5">
                        {s.lesson_topic && <p className="text-xs text-gray-400">📖 {s.lesson_topic}</p>}
                        {s.assignment   && <p className="text-xs text-gray-400">📝 {s.assignment}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          )}

          {/* Add Subject Form */}
          {addMode ? (
            <div className="mt-4 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 mb-3">إضافة مادة جديدة</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="📚"
                  className="w-14 bg-white border border-indigo-200 rounded-xl px-2 py-2 text-center text-lg focus:outline-none"
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="اسم المادة..."
                  className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              {/* Color picker */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setNewColor(c.key)}
                    className={`w-7 h-7 rounded-full ${c.cls} transition-all ${newColor === c.key ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSubject}
                  disabled={!newName.trim() || saving}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${newName.trim() && !saving ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {saving ? '...' : '✅ إضافة'}
                </button>
                <button
                  onClick={() => { setAddMode(false); setNewName(''); }}
                  className="w-10 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddMode(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-500 hover:bg-indigo-50 text-xs font-bold transition-all"
            >
              <Plus size={14} /> إضافة مادة جديدة
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── TEACHER DASHBOARD ─────────────────────────
export default function TeacherDashboard() {
  const [allStu, setAllStu]   = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [modalStudent, setModalStudent]   = useState(null);
  const [toastMsg, setToastMsg]           = useState(null);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500); };

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

  const students = allStu.filter((s) => s.class_id === currentClass);
  const presentCount = students.filter((s) => s.present).length;

  const handleClassChange = (cls) => { setCurrentClass(cls); setSelectedIds([]); setModalStudent(null); };

  const handleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);

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

  const mutateStudent = (updated) => {
    setAllStu((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    if (modalStudent?.id === updated.id) setModalStudent(updated);
  };

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

        {/* Subjects Panel — scoped to the currently-active class */}
        <SubjectsPanel showToast={showToast} currentClass={currentClass} />

        {/* Attendance Quick Toggle Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
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

        {/* Developer credit */}
        <p className="text-center text-[10px] text-gray-300 mt-8 pb-2">
          تم التطوير بواسطة <span className="font-bold">Ahmed Ismail</span>
          {' · '}
          <a href="tel:+201099635321" dir="ltr" className="hover:text-violet-400 transition-colors">+201099635321</a>
        </p>
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
