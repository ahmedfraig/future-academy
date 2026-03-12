import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'parent',  label: 'ولي الأمر',  emoji: '👨‍👦', color: 'bg-blue-500',   light: 'bg-blue-50 border-blue-200 text-blue-700',    demo: { email: 'parent1@rawdah.sa',  pass: 'parent123'  } },
  { id: 'teacher', label: 'المعلمة',    emoji: '👩‍🏫', color: 'bg-violet-500', light: 'bg-violet-50 border-violet-200 text-violet-700', demo: { email: 'teacher1@rawdah.sa', pass: 'teacher123' } },
  { id: 'manager', label: 'المدير',     emoji: '👨‍💼', color: 'bg-rose-500',   light: 'bg-rose-50 border-rose-200 text-rose-700',       demo: { email: 'manager@rawdah.sa',  pass: 'manager123'  } },
];

const dashMap = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate     = useNavigate();
  const [selectedRole, setSelectedRole] = useState('parent');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const activeRole = roles.find((r) => r.id === selectedRole);

  const fillDemo = () => {
    setEmail(activeRole.demo.email);
    setPassword(activeRole.demo.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('يرجى تعبئة جميع الحقول'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      // ✅ Enforce role match: selected role pill must match the account's actual role
      if (user.role !== selectedRole) {
        logout(); // clear the stored token immediately
        const roleNames = { parent: 'ولي أمر', teacher: 'معلمة', manager: 'مدير' };
        setError(`هذا الحساب مسجل كـ "${roleNames[user.role]}"، يرجى اختيار الدور الصحيح`);
        setLoading(false);
        return;
      }
      navigate(dashMap[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 text-center text-white">
          <div className="text-8xl mb-6 animate-bounce-gentle">🌸</div>
          <h1 className="text-4xl font-black mb-3">Future Academy</h1>
          <p className="text-lg opacity-80 mb-8">نظام إدارة الحضانه</p>
          <div className="flex flex-col gap-3 text-right">
            {[
              { icon: '📊', text: 'متابعة يومية شاملة للأطفال' },
              { icon: '📱', text: 'تطبيق الوالدين لمتابعة التقارير' },
              { icon: '👩‍🏫', text: 'لوحة المعلمة لإدارة الفصل' },
              { icon: '🏢', text: 'لوحة الإدارة للتحكم الكامل' },
            ].map((f) => (
              <div key={f.icon} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-2">🌸</div>
            <h1 className="text-2xl font-black text-gray-800">Future Academy</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-1">مرحباً بك 👋</h2>
            <p className="text-sm text-gray-400 mb-6">سجّل دخولك للمتابعة</p>

            {/* Role Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRole(r.id); setError(''); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
                    selectedRole === r.id ? `${r.color} text-white shadow-md` : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@rawdah.sa"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Demo credentials hint */}
              <button
                type="button"
                onClick={fillDemo}
                className={`text-xs font-bold border rounded-xl px-4 py-2.5 transition-all ${activeRole.light}`}
              >
                {activeRole.emoji} استخدام بيانات تجريبية: {activeRole.demo.email}
              </button>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : `${activeRole.color} hover:opacity-90`
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="animate-spin text-lg">⟳</span> جاري الدخول...</span>
                ) : (
                  <><LogIn size={18} /> تسجيل الدخول</>
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-gray-400 mt-5">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-violet-600 font-bold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
