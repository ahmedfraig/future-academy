import React, { useState } from 'react';
import {
  Users, ChevronDown, UsersRound, CheckCircle2, XCircle, LogOut, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordModal } from '../../pages/LoginPage';

// =============================================
// TEACHER HEADER
// =============================================
export function TeacherHeader({ currentClass, onClassChange, attendance, allClasses }) {
  const [open, setOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const { present, total } = attendance;
  const pct = Math.round((present / total) * 100) || 0;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  // Use passed allClasses from API data
  const classList = allClasses || [];

  return (
    <>
    <header className="bg-gradient-to-l from-violet-600 to-purple-700 text-white px-6 py-4 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Teacher Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl border border-white/30">
            {user?.avatar || '👩‍🏫'}
          </div>
          <div>
            <p className="font-bold text-base">{user?.name || 'المعلمة'}</p>
            <p className="text-purple-200 text-xs">لوحة تحكم المعلمة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Attendance Counter */}
          <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <UsersRound size={16} className="text-purple-200" />
              <span className="text-sm font-bold">
                الحضور: <span className="text-emerald-300">{present}</span>/{total}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Class Selector */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl px-4 py-2 transition-all"
            >
              <span className="font-bold text-sm">{currentClass}</span>
              <ChevronDown size={15} className={`text-purple-200 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[120px]">
                {classList.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => { onClassChange(cls); setOpen(false); }}
                    className={`w-full px-4 py-3 text-sm font-semibold text-right hover:bg-purple-50 transition-colors ${
                      cls === currentClass ? 'text-purple-700 bg-purple-50' : 'text-gray-700'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Password */}
          <button
            onClick={() => setShowChangePw(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 py-2 transition-all"
            title="تغيير كلمة المرور"
          >
            <KeyRound size={15} className="text-purple-200" />
          </button>

          {/* Logout */}
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 py-2 transition-all" title="تسجيل الخروج">
            <LogOut size={15} className="text-purple-200" />
          </button>
        </div>
      </div>
    </header>
    {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  );
}

// =============================================
// GLOBAL ACADEMIC FORM
// =============================================
export function GlobalAcademicForm() {
  const [form, setForm] = useState({ subject: '', lesson: '', homework: '' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (form.subject && form.lesson) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-violet-400 focus:bg-white placeholder-gray-400 font-cairo";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
          📚
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-sm">المادة الدراسية اليوم</h2>
          <p className="text-xs text-gray-400">يتم تطبيقه على كل الطلاب</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 font-medium mb-1">المادة</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="مثال: عربي"
            className={inputClass}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-medium mb-1">الشرح</label>
          <input
            name="lesson"
            value={form.lesson}
            onChange={handleChange}
            placeholder="مثال: حرف الباء"
            className={inputClass}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-medium mb-1">الواجب</label>
          <input
            name="homework"
            value={form.homework}
            onChange={handleChange}
            placeholder="مثال: صفحة 12"
            className={inputClass}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          saved
            ? 'bg-emerald-500 text-white'
            : form.subject && form.lesson
            ? 'bg-violet-600 hover:bg-violet-700 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {saved ? '✅ تم الحفظ لجميع الطلاب!' : '💾 حفظ وتطبيق على جميع الطلاب'}
      </button>
    </div>
  );
}
