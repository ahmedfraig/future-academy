import React from 'react';
import { CheckSquare, Square, AlertCircle, Pill } from 'lucide-react';

// =============================================
// INDIVIDUAL STUDENT CARD
// =============================================
export function StudentCard({ student, selected, onSelect, onOpenModal, isHoliday }) {
  const moodBg = {
    '😄': 'bg-emerald-50 border-emerald-200',
    '😊': 'bg-blue-50 border-blue-200',
    '😐': 'bg-amber-50 border-amber-200',
    '😢': 'bg-red-50 border-red-200',
    '😴': 'bg-purple-50 border-purple-200',
  };

  const cardBg = !student.present && !isHoliday
    ? 'bg-gray-50 border-gray-200 opacity-60'
    : selected
    ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-300'
    : isHoliday
    ? 'bg-orange-50 border-orange-200'
    : 'bg-white border-gray-100 hover:border-violet-200 hover:shadow-md';

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${cardBg}`}
    >
      {/* Selection Checkbox — hidden on holidays */}
      {student.present && !isHoliday && (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(student.id); }}
          className="absolute top-2.5 left-2.5 z-10"
        >
          {selected ? (
            <CheckSquare size={20} className="text-violet-600 fill-violet-100" />
          ) : (
            <Square size={20} className="text-gray-300" />
          )}
        </button>
      )}

      {/* Absence Badge / Holiday Badge */}
      {!student.present && (
        <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${isHoliday ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'}`}>
          {isHoliday ? '🏖️' : 'غائب'}
        </div>
      )}

      {/* Medication indicator */}
      {student.medication && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center" title="يحتاج دواء">
          <Pill size={12} className="text-orange-500" />
        </div>
      )}

      {/* Avatar + Name - clickable for modal */}
      <button
        onClick={() => onOpenModal(student)}
        className="w-full flex flex-col items-center gap-2 mt-1"
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 ${
            student.mood && moodBg[student.mood] ? moodBg[student.mood] : 'bg-gray-100 border-gray-200'
          }`}
        >
          {student.avatar}
        </div>
        <span className="text-xs font-bold text-gray-700 text-center leading-tight">
          {student.name}
        </span>
        {student.mood && student.present && (
          <span className="text-base">{student.mood}</span>
        )}
      </button>
    </div>
  );
}

// =============================================
// STUDENTS GRID
// =============================================
export function StudentsGrid({ students, selectedIds, onSelect, onOpenModal, isHoliday }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          selected={selectedIds.includes(student.id)}
          onSelect={onSelect}
          onOpenModal={onOpenModal}
          isHoliday={isHoliday}
        />
      ))}
    </div>
  );
}
