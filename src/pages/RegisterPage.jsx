import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, UserPlus, AlertCircle, Phone, KeyRound,
  CheckCircle2, Loader2, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const dashMap = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };
const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all';

const ROLES = [
  { id: 'parent',  label: 'ولي الأمر', emoji: '👨‍👦', color: 'bg-blue-500'   },
  { id: 'teacher', label: 'معلمة',     emoji: '👩‍🏫', color: 'bg-violet-500' },
  { id: 'manager', label: 'مدير',      emoji: '👨‍💼', color: 'bg-rose-500'   },
];

// ── Phone-only filter ─────────────────────────────────────────
const toDigits = (v) => v.replace(/\D/g, '');
const phoneValid = (v) => /^0\d{9}$/.test(v);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]           = useState('parent');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [name, setName]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Code verification (parent / teacher only)
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeResult, setCodeResult]     = useState(null);
  const [codeError, setCodeError]       = useState('');

  const isManager = role === 'manager';
  const isParent  = role === 'parent';
  const isTeacher = role === 'teacher';
  const activeRole = ROLES.find((r) => r.id === role);

  // Reset code state when role or code changes
  useEffect(() => { setCodeResult(null); setCodeError(''); }, [role, inviteCode]);

  // Reset fields when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole); setError(''); setInviteCode('');
    setCodeResult(null); setPhone(''); setName('');
  };

  const verifyCode = async () => {
    if (!inviteCode.trim()) return;
    setCodeChecking(true); setCodeResult(null); setCodeError('');
    try {
      const { data } = await api.get('/auth/verify-code', {
        params: { code: inviteCode.trim().toUpperCase(), role }
      });
      setCodeResult(data);
    } catch (err) {
      setCodeError(err.response?.data?.error || 'رمز الدعوة غير صحيح');
    } finally {
      setCodeChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !inviteCode) { setError('يرجى تعبئة جميع الحقول الإلزامية'); return; }
    if (isManager && !name) { setError('اسم المدير مطلوب'); return; }
    if (isParent && !name)  { setError('اسم ولي الأمر مطلوب'); return; }
    if (password !== confirmPw) { setError('كلمة المرور غير متطابقة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (isParent && !phone) { setError('رقم جوال ولي الأمر مطلوب'); return; }
    if (isParent && !phoneValid(phone)) { setError('رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 0'); return; }
    if (isTeacher && phone && !phoneValid(phone)) { setError('رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 0'); return; }
    if (!isManager && !codeResult?.valid) { setError('يرجى التحقق من رمز الدعوة أولاً'); return; }

    setLoading(true); setError('');
    try {
      const user = await register({
        email, password, phone: phone || undefined, role,
        name: name || undefined,
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      navigate(dashMap[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || (!isManager && !codeResult?.valid);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌸</div>
          <h1 className="text-2xl font-black text-gray-800">إنشاء حساب جديد</h1>
          <p className="text-sm text-gray-400">Royal Kids Academy</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Role Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            {ROLES.map((r) => (
              <button key={r.id} type="button"
                onClick={() => handleRoleChange(r.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
                  role === r.id ? `${r.color} text-white shadow-md` : 'text-gray-500 hover:text-gray-700'
                }`}>
                <span className="text-xl">{r.emoji}</span>{r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* ── INVITE / SECRET CODE ── */}
            <div className={`border rounded-2xl p-4 ${isManager ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
              <label className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${isManager ? 'text-rose-700' : 'text-amber-700'}`}>
                <KeyRound size={13} />
                {isManager ? 'رمز المدير السري *' : 'رمز الدعوة *'}
              </label>
              <p className={`text-xs mb-3 ${isManager ? 'text-rose-600' : 'text-amber-600'}`}>
                {isManager
                  ? 'احصل على الرمز السري من مالك الحضانة'
                  : isParent
                    ? 'احصل على الرمز من إدارة الحضانة — سيُربط حسابك بطفلك تلقائياً'
                    : 'احصل على الرمز من المدير — سيُربط حسابك بسجلك الوظيفي تلقائياً'}
              </p>
              <div className="flex gap-2">
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder={isManager ? 'RAWDAH-ADMIN-XXXX' : 'XXXX-XXXX-XXXX'}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold tracking-widest focus:outline-none focus:border-violet-400 transition-all"
                  dir="ltr"
                  maxLength={20}
                />
                {/* Verify button only for parent/teacher */}
                {!isManager && (
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={codeChecking || !inviteCode.trim()}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {codeChecking ? <Loader2 size={14} className="animate-spin" /> : 'تحقق'}
                  </button>
                )}
              </div>

              {/* Verification result (parent/teacher) */}
              {!isManager && codeResult?.valid && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-emerald-700">
                    {isParent ? `✅ الطفل المرتبط: ${codeResult.studentName}` : `✅ المعلمة المرتبطة: ${codeResult.teacherName}`}
                  </span>
                </div>
              )}
              {!isManager && codeError && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-red-600">{codeError}</span>
                </div>
              )}
            </div>

            {/* ── Name (manager + parent) ── */}
            {(isManager || isParent) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><User size={11} /> الاسم الكامل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={isManager ? 'اسم المدير' : 'اسم ولي الأمر'}
                  className={inputCls} style={{ fontFamily: 'Cairo, sans-serif' }} />
              </div>
            )}

            {/* ── EMAIL ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">البريد الإلكتروني *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@rawdah.sa" className={inputCls} dir="ltr" autoComplete="email" />
            </div>

            {/* ── Phone (parent required / teacher optional) ── */}
            {(isParent || isTeacher) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Phone size={11} />
                  {isParent ? 'رقم جوال ولي الأمر *' : 'رقم الجوال (اختياري)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(toDigits(e.target.value))}
                  placeholder="05XXXXXXXX"
                  className={inputCls}
                  dir="ltr"
                  maxLength={10}
                  inputMode="numeric"
                />
                {phone.length > 0 && !phoneValid(phone) && (
                  <p className="text-xs text-amber-600 font-medium">يجب أن يكون 10 أرقام ويبدأ بـ 0</p>
                )}
              </div>
            )}

            {/* ── PASSWORD ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">كلمة المرور *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className={inputCls.replace('px-4', 'pr-4 pl-10')} dir="ltr" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">تأكيد كلمة المرور *</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className={inputCls} dir="ltr" autoComplete="new-password" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitDisabled}
              className={`w-full py-3.5 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                submitDisabled ? 'bg-gray-300 cursor-not-allowed' : `${activeRole.color} hover:opacity-90`
              }`}>
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> جاري إنشاء الحساب...</>
                : <><UserPlus size={18} /> إنشاء الحساب</>}
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
