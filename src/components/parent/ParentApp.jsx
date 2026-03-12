import React, { useState } from 'react';
import { TopHeader, BottomNav } from './Navigation';
import HomePage from './HomePage';
import DailyReportPage from './DailyReportPage';
import NotesPage from './NotesPage';
import ProfilePage from './ProfilePage';

export default function ParentApp() {
  const [activeTab, setActiveTab] = useState('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'report': return <DailyReportPage />;
      case 'notes': return <NotesPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    // Outer container: centers the mobile view on desktop
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-start justify-center">
      {/* Mobile frame */}
      <div
        className="relative bg-gray-50 w-full max-w-sm min-h-screen flex flex-col shadow-2xl"
        style={{ minHeight: '100dvh' }}
        dir="rtl"
      >
        <TopHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-[72px] pb-[72px] px-4">
          <div className="py-4">
            {renderPage()}
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
