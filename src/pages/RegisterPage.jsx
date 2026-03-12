import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'parent',  label: 'ولي الأمر',  emoji: '👨‍👦', color: 'bg-blue-500',   border: 'border-blue-400 bg-blue-50',   text: 'text-blue-600' },
  { id: 'teacher', label: 'معلمة',       emoji: '👩‍🏫', color: 'bg-violet-500', border: 'border-violet-400 bg-violet-50', text: 'text-violet-600' },
  { id: 'manager', label: 'مدير',        emoji: '👨‍💼', color: 'bg-rose-500',   border: 'border-rose-400 bg-rose-50',   text: 'text-rose-600' },
];
const specOptions = ['رياض أطفال', 'تربية خاصة', 'فنون وحرف', 'موسيقى', 'لغات'];
const classOptions = ['KG1-A', 'KG1-B', 'KG2-A', 'KG2-B'];
const dashMap = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]         = useState('parent');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Role-specific fields
  const [specialization, setSpec]       = useState('رياض أطفال');
  const [managerCode, setManagerCode]   = useState('');
  const [childName, setChildName]       = useState('');
  const [childClass, setChildClass]     = useState('KG1-A');

  const activeRole = roles.find((r) => r.id === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('يرجى تعبئة جميع الحقول الإلزامية'); return; }
    if (password !== confirmPw) { setError('كلمة المرور غير متطابقة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await register({ name, email, password, role, specialization, managerCode, childName, classId: childClass });
      navigate(dashMap[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌸</div>
          <h1 className="text-2xl font-black text-gray-800">إنشاء حساب جديد</h1>
          <p className="text-sm text-gray-400">Future Academy</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Role Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            {roles.map((r) => (
              <button key={r.id} type="button" onClick={() => { setRole(r.id); setError(''); }}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
                  role === r.id ? `${r.color} text-white shadow-md` : 'text-gray-500 hover:text-gray-700'
                }`}>
                <span className="text-xl">{r.emoji}</span>{r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">الاسم الكامل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">البريد الإلكتروني *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@rawdah.sa" className={inputCls} dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">كلمة المرور *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} dir="ltr" />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">تأكيد كلمة المرور *</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className={inputCls} dir="ltr" />
              </div>
            </div>

            {/* Role-specific fields */}
            {role === 'teacher' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">التخصص</label>
                <select value={specialization} onChange={(e) => setSpec(e.target.value)} className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {specOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {role === 'manager' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">رمز المدير *</label>
                <input value={managerCode} onChange={(e) => setManagerCode(e.target.value)} placeholder="RAWDAH2026" className={inputCls} dir="ltr" />
                <p className="text-xs text-gray-400">تواصل مع إدارة الحضانه للحصول على رمز المدير</p>
              </div>
            )}

            {role === 'parent' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">اسم الطفل</label>
                  <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="اسم الطفل" className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">الفصل</label>
                  <select value={childClass} onChange={(e) => setChildClass(e.target.value)} className={inputCls}>
                    {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                loading ? 'bg-gray-300 cursor-not-allowed' : `${activeRole.color} hover:opacity-90`
              }`}>
              {loading ? '⟳ جاري إنشاء الحساب...' : <><UserPlus size={18} /> إنشاء الحساب</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-violet-600 font-bold hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
