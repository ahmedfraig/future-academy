import React, { useState } from 'react';
import { Home, FileText, MessageSquare, User, Bell, LogOut, X, Check, BellOff, Shield, Phone, Star, ChevronLeft } from 'lucide-react';
import { nurseryInfo, currentChild } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── NOTIFICATION PANEL ──────────────────────────
const mockNotifications = [
  { id: 1, icon: '📢', title: 'إعلان جديد', body: 'رحلة علمية يوم السبت القادم', time: 'منذ 5 د', read: false },
  { id: 2, icon: '📝', title: 'ملاحظة من المعلمة', body: 'يونس أدى أداءً رائعاً اليوم في الحصص', time: 'منذ ساعة', read: false },
  { id: 3, icon: '✅', title: 'تم تسجيل الحضور', body: 'تم تسجيل حضور يونس الساعة 7:45 ص', time: 'اليوم', read: true },
  { id: 4, icon: '💊', title: 'تذكير الدواء', body: 'يرجى التأكد من إرسال دواء يونس', time: 'أمس', read: true },
];

function NotificationPanel({ onClose }) {
  const [notifs, setNotifs] = useState(mockNotifications);
  const markRead = (id) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-b-3xl shadow-2xl animate-slide-up" dir="rtl" style={{ marginTop: 0 }}>
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-sky-500 to-blue-600 text-white rounded-t-none">
          <div>
            <h3 className="font-black text-base">الإشعارات</h3>
            {unread > 0 && <p className="text-xs text-blue-100">{unread} إشعارات غير مقروءة</p>}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAll} className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold hover:bg-white/30">
                قراءة الكل
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
          {notifs.map((n) => (
            <button key={n.id} onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-3 px-5 py-4 text-right hover:bg-gray-50 transition-all ${!n.read ? 'bg-blue-50' : ''}`}>
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${n.read ? 'text-gray-600' : 'text-gray-800'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            </button>
          ))}
        </div>
        {notifs.length === 0 && (
          <div className="text-center py-12">
            <BellOff size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لا توجد إشعارات</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TOP HEADER ─────────────────────────────────
export function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread] = useState(2);
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bell + Logout */}
          <div className="flex items-center gap-2">
            <div className="relative cursor-pointer" onClick={() => setShowNotifs(true)}>
              <Bell size={22} className="text-white" />
              {unread > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all" title="تسجيل الخروج">
              <LogOut size={16} className="text-blue-100" />
            </button>
          </div>

          {/* Center Nursery Name */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{nurseryInfo.logo} {nurseryInfo.name}</span>
            <span className="text-xs text-blue-100">نظام إدارة الحضانة</span>
          </div>

          {/* Child Avatar */}
          <div className="flex flex-col items-center gap-0.5 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl border-2 border-white/40">
              {currentChild.avatar}
            </div>
            <span className="text-xs text-blue-100">{user?.name?.split(' ')[0] || currentChild.name}</span>
          </div>
        </div>
      </header>
      {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
    </>
  );
}

// ── BOTTOM NAV ─────────────────────────────────
export function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home',    icon: Home,         label: 'الرئيسية' },
    { id: 'report',  icon: FileText,      label: 'التقرير اليومي' },
    { id: 'notes',   icon: MessageSquare, label: 'الملاحظات' },
    { id: 'profile', icon: User,          label: 'حسابي' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 ${isActive ? 'text-blue-600 bg-blue-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon size={isActive ? 22 : 20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
