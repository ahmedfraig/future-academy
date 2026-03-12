import React, { useState } from 'react';
import { User, Phone, Shield, Bell, ChevronLeft, Star, LogOut, Check, X } from 'lucide-react';
import { currentChild, nurseryInfo } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── NOTIFICATION SETTINGS MODAL ──────────────
function NotifSettingsModal({ onClose }) {
  const [settings, setSettings] = useState({
    dailyReport:    true,
    teacherNotes:   true,
    announcements:  true,
    attendance:     false,
    events:         true,
  });
  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const items = [
    { key: 'dailyReport',   label: 'التقرير اليومي',    desc: 'إشعار عند نشر تقرير جديد' },
    { key: 'teacherNotes',  label: 'ملاحظات المعلمة',   desc: 'إشعار عند إرسال ملاحظة' },
    { key: 'announcements', label: 'الإعلانات',          desc: 'إعلانات الحضانه العامة' },
    { key: 'attendance',    label: 'الحضور والغياب',     desc: 'إشعار بكل تسجيل حضور' },
    { key: 'events',        label: 'الفعاليات والرحلات', desc: 'إشعارات النشاطات الخاصة' },
  ];
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-slide-up" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">إعدادات الإشعارات 🔔</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="divide-y divide-gray-50 px-5 pb-8">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4">
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings[item.key] ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${settings[item.key] ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT MODAL ──────────────────────────────
function ContactModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-slide-up" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">تواصل مع الحضانة 📞</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="px-5 py-6 flex flex-col gap-4 pb-8">
          {[
            { icon: '📞', label: 'الهاتف', value: '0112345678' },
            { icon: '📱', label: 'واتساب', value: '0501234567' },
            { icon: '📧', label: 'البريد', value: 'info@rawdah.sa' },
            { icon: '📍', label: 'العنوان', value: 'حي النرجس، الرياض' },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <span className="text-xl">{row.icon}</span>
              <div>
                <p className="text-xs text-gray-400 font-medium">{row.label}</p>
                <p className="text-sm font-bold text-gray-800" dir="ltr">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PRIVACY MODAL ──────────────────────────────
function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-slide-up" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">الأمان والخصوصية 🔒</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="px-5 py-6 flex flex-col gap-3 pb-8">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <p className="font-bold text-green-700 text-sm mb-1">✅ حسابك آمن</p>
            <p className="text-xs text-green-600">بياناتك محمية ومشفرة بالكامل</p>
          </div>
          {[
            { label: 'مشاركة البيانات', desc: 'بيانات طفلك لا تُشارك مع أطراف ثالثة' },
            { label: 'سجل الجلسات', desc: 'آخر دخول: اليوم 7:32 ص' },
            { label: 'تغيير كلمة المرور', desc: 'يمكنك تغييرها من إعدادات الحساب' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-2xl px-4 py-3">
              <p className="font-bold text-gray-700 text-sm">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'notif' | 'contact' | 'privacy' | 'rate'
  const [rated, setRated] = useState(0);

  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { icon: Bell,   label: 'إعدادات الإشعارات', color: 'text-blue-500 bg-blue-50',   action: () => setModal('notif') },
    { icon: Shield, label: 'الأمان والخصوصية',  color: 'text-green-500 bg-green-50', action: () => setModal('privacy') },
    { icon: Phone,  label: 'تواصل مع الحضانة',  color: 'text-purple-500 bg-purple-50', action: () => setModal('contact') },
    { icon: Star,   label: 'قيّم التطبيق',       color: 'text-amber-500 bg-amber-50', action: () => setModal('rate') },
    { icon: LogOut, label: 'تسجيل الخروج',       color: 'text-red-500 bg-red-50',     action: handleLogout },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 animate-slide-up">
        {/* Profile Hero */}
        <div className="bg-gradient-to-l from-blue-500 to-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg">
          <div className="text-6xl mb-2 animate-bounce-gentle">{currentChild.avatar}</div>
          <h2 className="text-xl font-bold">{currentChild.name}</h2>
          <p className="text-blue-100 text-sm mt-0.5">الصف: {currentChild.class}</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center"><p className="text-2xl font-bold">18</p><p className="text-xs text-blue-100">يوم حضور</p></div>
            <div className="w-px bg-white/30" />
            <div className="text-center"><p className="text-2xl font-bold">4.8</p><p className="text-xs text-blue-100">متوسط السلوك</p></div>
            <div className="w-px bg-white/30" />
            <div className="text-center"><p className="text-2xl font-bold">3</p><p className="text-xs text-blue-100">غيابات</p></div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center"><User size={16} className="text-blue-600" /></div>
            <span className="font-bold text-gray-800 text-sm">معلومات ولي الأمر</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'الاسم', value: user?.name || currentChild.parentName },
              { label: 'الحضانة', value: nurseryInfo.name },
              { label: 'الصف', value: currentChild.class },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 font-medium">{row.label}</span>
                <span className="text-sm text-gray-700 font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === menuItems.length - 1;
            return (
              <button key={i} onClick={item.action}
                className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-all ${!isLast ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}><Icon size={15} /></div>
                  <span className={`text-sm font-semibold ${isLast ? 'text-red-500' : 'text-gray-700'}`}>{item.label}</span>
                </div>
                <ChevronLeft size={16} className="text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {modal === 'notif'   && <NotifSettingsModal onClose={() => setModal(null)} />}
      {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
      {modal === 'rate' && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-slide-up p-8 text-center" dir="rtl">
            <button onClick={() => setModal(null)} className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"><X size={16} /></button>
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-black text-gray-800 text-lg mb-1">قيّم التطبيق</h3>
            <p className="text-xs text-gray-400 mb-5">رأيك يهمنا لتحسين تجربتك</p>
            <div className="flex justify-center gap-3 mb-6">
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setRated(n)}>
                  <Star size={36} className={n <= rated ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
                </button>
              ))}
            </div>
            {rated > 0 && (
              <button onClick={() => setModal(null)} className="w-full bg-blue-500 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-all">
                إرسال التقييم ✅
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
