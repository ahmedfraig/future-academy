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
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <TopHeader />
      <main className="flex-1 overflow-y-auto pt-[88px] pb-[88px] px-4 md:px-8 w-full max-w-3xl mx-auto">
        {renderPage()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
