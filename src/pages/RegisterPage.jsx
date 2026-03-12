import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, UserPlus, AlertCircle, Phone, KeyRound,
  CheckCircle2, Loader2, Baby, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const dashMap = { teacher: '/dashboard/teacher', parent: '/dashboard/parent' };
const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]           = useState('parent');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Code verification state
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeResult, setCodeResult]     = useState(null); // { valid, studentName/teacherName }
  const [codeError, setCodeError]       = useState('');

  // Reset code verification when role or code changes
  useEffect(() => { setCodeResult(null); setCodeError(''); }, [role, inviteCode]);

  const verifyCode = async () => {
    if (!inviteCode.trim()) return;
    setCodeChecking(true);
    setCodeResult(null);
    setCodeError('');
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
    if (password !== confirmPw) { setError('كلمة المرور غير متطابقة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (role === 'parent' && !phone) { setError('رقم جوال ولي الأمر مطلوب'); return; }
    if (!codeResult?.valid) { setError('يرجى التحقق من رمز الدعوة أولاً'); return; }

    setLoading(true);
    setError('');
    try {
      const user = await register({
        email, password, phone, role,
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      navigate(dashMap[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers
  const isParent  = role === 'parent';
  const roleColor = isParent ? 'bg-blue-500' : 'bg-violet-500';
  const roleLight = isParent ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-violet-50 border-violet-200 text-violet-700';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌸</div>
          <h1 className="text-2xl font-black text-gray-800">إنشاء حساب جديد</h1>
          <p className="text-sm text-gray-400">Royal Kids Academy</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Role Selector — parent or teacher only */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'parent',  label: 'ولي الأمر', emoji: '👨‍👦', color: 'bg-blue-500' },
              { id: 'teacher', label: 'معلمة',      emoji: '👩‍🏫', color: 'bg-violet-500' },
            ].map((r) => (
              <button key={r.id} type="button"
                onClick={() => { setRole(r.id); setError(''); setInviteCode(''); }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl font-bold text-sm transition-all border-2 ${
                  role === r.id
                    ? `${r.color} text-white shadow-md border-transparent`
                    : 'text-gray-500 hover:text-gray-700 border-gray-100 bg-gray-50'
                }`}>
                <span className="text-2xl">{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* ── INVITE CODE ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <label className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                <KeyRound size={13} /> رمز الدعوة *
              </label>
              <p className="text-xs text-amber-600 mb-3">
                {isParent
                  ? 'احصل على الرمز من إدارة الحضانة — سيُربط حسابك بطفلك تلقائياً'
                  : 'احصل على الرمز من المدير — سيُربط حسابك بسجلك الوظيفي تلقائياً'}
              </p>
              <div className="flex gap-2">
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-sm font-bold tracking-widest focus:outline-none focus:border-amber-500 transition-all"
                  dir="ltr"
                  maxLength={14}
                />
                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={codeChecking || !inviteCode.trim()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  {codeChecking ? <Loader2 size={14} className="animate-spin" /> : 'تحقق'}
                </button>
              </div>

              {/* Code result preview */}
              {codeResult?.valid && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-emerald-700">
                    {isParent
                      ? `✅ الطفل المرتبط: ${codeResult.studentName}`
                      : `✅ المعلمة المرتبطة: ${codeResult.teacherName}`}
                  </span>
                </div>
              )}
              {codeError && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-red-600">{codeError}</span>
                </div>
              )}
            </div>

            {/* ── EMAIL ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">البريد الإلكتروني *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@rawdah.sa"
                className={inputCls}
                dir="ltr"
                autoComplete="email"
              />
            </div>

            {/* ── PHONE (parent only) ── */}
            {isParent && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Phone size={11} /> رقم جوال ولي الأمر *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className={inputCls}
                  dir="ltr"
                />
              </div>
            )}

            {/* ── PASSWORD ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls}
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">تأكيد كلمة المرور *</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !codeResult?.valid}
              className={`w-full py-3.5 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                loading || !codeResult?.valid
                  ? 'bg-gray-300 cursor-not-allowed'
                  : `${roleColor} hover:opacity-90`
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
