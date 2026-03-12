import React, { useState } from 'react';
import { MessageSquare, Send, PenLine } from 'lucide-react';
import { todayReport, currentChild } from '../../data/dummyData';

export default function NotesPage() {
  const [parentNote, setParentNote] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (parentNote.trim()) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setParentNote('');
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-1 w-6 bg-purple-500 rounded-full" />
        <h1 className="text-base font-bold text-gray-700">الملاحظات</h1>
      </div>

      {/* Teacher's Note */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-purple-500 to-indigo-500 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">ملاحظة المعلمة</p>
              <p className="text-purple-100 text-xs">للطالب: {currentChild.name}</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
            <p className="text-gray-700 text-sm leading-relaxed">{todayReport.teacherNote}</p>
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-400">{todayReport.date}</span>
          </div>
        </div>
      </div>

      {/* Parent Reply */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <PenLine size={16} className="text-blue-600" />
            </div>
            <span className="font-bold text-gray-800 text-sm">أضف ملاحظة للمعلمة</span>
          </div>
          <textarea
            value={parentNote}
            onChange={(e) => setParentNote(e.target.value)}
            placeholder="اكتب ملاحظتك هنا... مثلاً: يونس لم ينم جيداً الليلة، أو لديه حساسية من..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white resize-none min-h-[120px] font-cairo"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={handleSend}
            disabled={!parentNote.trim() || sent}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              sent
                ? 'bg-emerald-500 text-white'
                : parentNote.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sent ? (
              <>✅ تم الإرسال بنجاح!</>
            ) : (
              <>
                <Send size={15} />
                إرسال الملاحظة
              </>
            )}
          </button>
        </div>
      </div>

      {/* Previous Notes placeholder */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-700 mb-3">ملاحظاتي السابقة</p>
        <div className="flex flex-col gap-2">
          {[
            { text: "يونس نسي كتاب العربي في البيت، سيحضره غداً إن شاء الله", date: "الأربعاء" },
            { text: "يرجى الانتباه أن يونس لديه حساسية من الفول السوداني", date: "الثلاثاء" },
          ].map((note, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed">{note.text}</p>
              <p className="text-xs text-gray-400 mt-1">{note.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
