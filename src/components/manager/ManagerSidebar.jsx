import React from 'react';
import {
  LayoutDashboard, Users, School, GraduationCap, Link2, Megaphone, LogOut, ChevronLeft
} from 'lucide-react';
import { nurseryInfo } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'overview',       icon: LayoutDashboard, label: 'لوحة المعلومات',  color: 'text-violet-600 bg-violet-100' },
  { id: 'students',       icon: Users,           label: 'إدارة الطلاب',    color: 'text-blue-600 bg-blue-100'   },
  { id: 'classes',        icon: School,          label: 'إدارة الفصول',    color: 'text-emerald-600 bg-emerald-100' },
  { id: 'teachers',       icon: GraduationCap,   label: 'إدارة المعلمات',  color: 'text-pink-600 bg-pink-100'   },
  { id: 'assignments',    icon: Link2,           label: 'التعيينات',       color: 'text-amber-600 bg-amber-100' },
  { id: 'announcements',  icon: Megaphone,       label: 'الإعلانات',       color: 'text-red-600 bg-red-100'     },
];

export default function ManagerSidebar({ active, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-l border-gray-100 shadow-sm flex-shrink-0">
      {/* Branding */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-md">
            {nurseryInfo.logo}
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm leading-tight">{nurseryInfo.name}</p>
            <p className="text-xs text-gray-400 font-medium">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      {/* Manager Profile */}
      <div className="px-4 py-4 border-b border-gray-50 bg-gradient-to-l from-violet-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">
            {user?.avatar || '👨‍💼'}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{user?.name || 'المدير'}</p>
            <p className="text-xs text-violet-500 font-medium">مدير الحضانه</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-right w-full group ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isActive ? 'bg-white/20' : item.color
              }`}>
                <Icon size={16} className={isActive ? 'text-white' : ''} />
              </div>
              <span className={`text-sm font-bold flex-1 text-right ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {item.label}
              </span>
              {isActive && <ChevronLeft size={14} className="text-white/60" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-50 transition-all w-full text-red-400 hover:text-red-500">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut size={14} className="text-red-400" />
          </div>
          <span className="text-sm font-bold">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
