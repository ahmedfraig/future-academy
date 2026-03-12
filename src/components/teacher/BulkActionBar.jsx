import React, { useState } from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import { moodOptions } from '../../data/dummyData';

// =============================================
// BULK ACTION BAR (bottom sheet)
// =============================================
export function BulkActionBar({ selectedCount, onBulkMeal, onBulkPotty, onBulkMood, onClearSelection }) {
  const [activePicker, setActivePicker] = useState(null); // 'meal' | 'mood' | null
  const mealOptions = [
    { id: 'breakfast', label: 'الفطار', emoji: '🥐' },
    { id: 'lunch', label: 'الغداء', emoji: '🍛' },
    { id: 'snack', label: 'السناك', emoji: '🍎' },
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up" dir="rtl">
      {/* Picker popover */}
      {activePicker === 'meal' && (
        <div className="absolute bottom-full mb-2 right-4 left-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4">
          <p className="font-bold text-gray-700 text-sm mb-3">اختر وجبة الأكل</p>
          <div className="flex gap-2">
            {mealOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => { onBulkMeal(m.id); setActivePicker(null); }}
                className="flex-1 flex flex-col items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl py-3 transition-all"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-bold text-emerald-700">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {activePicker === 'mood' && (
        <div className="absolute bottom-full mb-2 right-4 left-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4">
          <p className="font-bold text-gray-700 text-sm mb-3">اختر المزاج</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {moodOptions.map((m) => (
              <button
                key={m.emoji}
                onClick={() => { onBulkMood(m.emoji); setActivePicker(null); }}
                className="flex flex-col items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl px-4 py-3 transition-all"
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-bold text-blue-600">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="bg-white border-t-2 border-violet-200 px-4 py-4 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Selected count badge */}
          <div className="flex items-center gap-1.5 bg-violet-100 text-violet-700 rounded-2xl px-3 py-2 font-bold text-sm flex-shrink-0">
            <CheckCircle size={15} />
            {selectedCount} محدد
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-1 overflow-x-auto">
            <button
              onClick={() => setActivePicker(activePicker === 'meal' ? null : 'meal')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                activePicker === 'meal' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🥪 الأكل
            </button>
            <button
              onClick={() => { onBulkPotty(); setActivePicker(null); }}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all active:scale-95"
            >
              <Clock size={14} />
              🚽 التويلت
            </button>
            <button
              onClick={() => setActivePicker(activePicker === 'mood' ? null : 'mood')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                activePicker === 'mood' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              🎭 المزاج
            </button>
          </div>

          {/* Clear selection */}
          <button
            onClick={() => { onClearSelection(); setActivePicker(null); }}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
