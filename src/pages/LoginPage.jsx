import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const roles = [
  { id: 'parent',  label: 'ولي الأمر', emoji: '👨‍👦', color: 'bg-blue-500'   },
  { id: 'teacher', label: 'المعلمة',   emoji: '👩‍🏫', color: 'bg-violet-500' },
  { id: 'manager', label: 'المدير',    emoji: '👨‍💼', color: 'bg-rose-500'   },
];

const dashMap = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };

// ── CHANGE PASSWORD MODAL (shared across all dashboards) ─────────────────────
export function ChangePasswordModal({ onClose }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) { setError('كلمتا المرور الجديدتان غير متطابقتين'); return; }
    if (newPass.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPass, newPassword: newPass });
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ. حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-violet-600" />
            </div>
            <h3 className="font-black text-gray-800">تغيير كلمة المرور</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
            <span className="text-gray-500 text-sm font-bold">✕</span>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <p className="font-bold text-gray-800">تم تغيير كلمة المرور بنجاح ✅</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Current Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">كلمة المرور الحالية</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowCurrent(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                dir="ltr"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />{error}
              </div>
            )}
            <button type="submit" disabled={loading || !currentPass || !newPass || !confirmPass}
              className="w-full py-3 rounded-2xl font-black text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all">
              {loading ? '⟳ جاري الحفظ...' : '💾 تغيير كلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── FORGOT PASSWORD FLOW ─────────────────────────────────────
function ForgotPasswordFlow({ onBack }) {
  const [step, setStep]               = useState(1); // 1=email+instruction, 2=enter key+new password
  const [email, setEmail]             = useState('');
  const [resetKey, setResetKey]       = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (newPass.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: resetKey.trim(), newPassword: newPass });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'الرمز غير صحيح أو انتهت صلاحيته');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 size={56} className="text-emerald-500" />
        <div>
          <p className="font-black text-gray-800 text-lg">تم تغيير كلمة المرور ✅</p>
          <p className="text-sm text-gray-400 mt-1">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
        </div>
        <button onClick={onBack} className="text-violet-600 font-bold text-sm hover:underline">
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-4">
          <ArrowRight size={15} /> العودة
        </button>
        <h3 className="text-xl font-black text-gray-800">نسيت كلمة المرور؟ 🔑</h3>
        <p className="text-sm text-gray-400 mt-1">
          {step === 1 && 'أدخل بريدك الإلكتروني واتصل بالمدير للحصول على رمز إعادة التعيين'}
          {step === 2 && 'أدخل الرمز الذي أرسله لك المدير وكلمة المرور الجديدة'}
        </p>
      </div>

      {/* Step 1: Email + manager instruction */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">البريد الإلكتروني</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="example@rawdah.sa"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
              dir="ltr" autoComplete="email"
            />
          </div>

          {/* Manager instruction card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs font-black text-blue-700">📞 كيف تحصل على رمز إعادة التعيين؟</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              تواصل مع مدير الحضانة وأعطه بريدك الإلكتروني، وسيولّد لك رمزاً مكوناً من 6 أرقام. بعد استلامه اضغط الزر أدناه.
            </p>
          </div>

          <button
            onClick={() => { if (email) setStep(2); else setError('يرجى إدخال البريد الإلكتروني أولاً'); }}
            disabled={!email}
            className="w-full py-3.5 rounded-2xl font-black text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
          >
            لديّ الرمز — التالي
          </button>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Enter reset key + new password */}
      {step === 2 && (
        <form onSubmit={handleReset} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">رمز إعادة التعيين (6 أرقام)</label>
            <input
              type="text" value={resetKey} onChange={(e) => setResetKey(e.target.value)}
              placeholder="123456"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 text-center font-black tracking-widest"
              dir="ltr" maxLength={6} inputMode="numeric"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass} onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400"
              dir="ltr"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}
          <button type="submit" disabled={loading || !resetKey || !newPass || !confirmPass}
            className="w-full py-3.5 rounded-2xl font-black text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all">
            {loading ? '⟳ جاري التغيير...' : '🔒 تغيير كلمة المرور'}
          </button>
        </form>
      )}
    </div>
  );
}


// ── MAIN LOGIN PAGE ──────────────────────────────────────────
export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate     = useNavigate();
  const [selectedRole, setSelectedRole] = useState('parent');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const activeRole = roles.find((r) => r.id === selectedRole);

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
          <h1 className="text-4xl font-black mb-3">Royal Kids Academy</h1>
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
            <h1 className="text-2xl font-black text-gray-800">Royal Kids Academy</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

            {showForgot ? (
              <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
            ) : (
              <>
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500">كلمة المرور</label>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-violet-500 hover:text-violet-700 font-bold hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
