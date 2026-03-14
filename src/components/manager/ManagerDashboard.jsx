import React, { useState } from 'react';
import ManagerSidebar from './ManagerSidebar';
import OverviewPage from './OverviewPage';
import StudentsManager from './StudentsManager';
import ClassesManager from './ClassesManager';
import TeachersManager from './TeachersManager';
import AssignmentsPage from './AssignmentsPage';
import AnnouncementsManager from './AnnouncementsManager';
import ManagerReportsPage from './ManagerReportsPage';
import ManagerNotesPage from './ManagerNotesPage';
import { Menu, X } from 'lucide-react';

const PAGES = {
  overview:      OverviewPage,
  students:      StudentsManager,
  classes:       ClassesManager,
  teachers:      TeachersManager,
  assignments:   AssignmentsPage,
  announcements: AnnouncementsManager,
  reports:       ManagerReportsPage,
  messages:      ManagerNotesPage,
};

export default function ManagerDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGES[activePage] || OverviewPage;

  const handleNavigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* ---- Desktop Sidebar ---- */}
      <div className="hidden lg:flex">
        <ManagerSidebar active={activePage} onNavigate={handleNavigate} />
      </div>

      {/* ---- Mobile Sidebar Overlay ---- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 animate-slide-up">
            <ManagerSidebar active={activePage} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* ---- Main Content ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
          >
            <Menu size={18} className="text-gray-600" />
          </button>
          <span className="font-black text-gray-800 text-sm">لوحة الإدارة 🏢</span>
          <div className="w-9" />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
