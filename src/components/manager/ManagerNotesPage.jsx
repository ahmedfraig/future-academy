import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, GraduationCap, ArrowRight } from 'lucide-react';
import api from '../../services/api';

// ── CHAT THREAD ────────────────────────────────────────────────
function ChatThread({ type, participantId, participantName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    const path = type === 'parent'
      ? `/manager/messages/parent/${participantId}`
      : `/manager/messages/teacher/${participantId}`;
    api.get(path)
      .then(({ data }) => setMessages(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, participantId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const path = type === 'parent'
      ? `/manager/messages/parent/${participantId}`
      : `/manager/messages/teacher/${participantId}`;
    try {
      const { data } = await api.post(path, { text: text.trim() });
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch {}
    finally { setSending(false); }
  };

  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
          <ArrowRight size={16} className="text-gray-600" />
        </button>
        <div>
          <p className="font-bold text-gray-800 text-sm">{participantName}</p>
          <p className="text-xs text-gray-400">{type === 'parent' ? 'ولي الأمر' : 'المعلمة'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-gray-50">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">جاري التحميل...</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <p className="text-5xl mb-3">💬</p>
            <p className="text-sm text-gray-400">ابدأ المحادثة</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.from_role === 'manager' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                m.from_role === 'manager'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-0.5 ${m.from_role === 'manager' ? 'text-violet-200' : 'text-gray-400'}`}>
                  {fmtTime(m.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`w-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${text.trim() && !sending ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ── CONVERSATION LIST ITEM ─────────────────────────────────────
function ConvItem({ name, avatar, subtitle, unread, lastAt, onClick }) {
  const fmtDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString())
      return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-xl flex-shrink-0">
        {avatar || '👤'}
      </div>
      <div className="flex-1 text-right min-w-0">
        <p className="font-bold text-gray-800 text-sm truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-[10px] text-gray-400">{fmtDate(lastAt)}</p>
        {parseInt(unread) > 0 && (
          <span className="w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </div>
    </button>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function ManagerNotesPage() {
  const [tab, setTab]               = useState('parents'); // 'parents' | 'teachers'
  const [parentList, setParentList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [loadingP, setLoadingP]     = useState(true);
  const [loadingT, setLoadingT]     = useState(true);
  const [activeChat, setActiveChat] = useState(null); // { type, id, name }
  // For new conversations — pick from students/teachers
  const [students, setStudents]     = useState([]);
  const [teachers, setTeachers]     = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    api.get('/manager/messages/parent-list')
      .then(({ data }) => setParentList(data))
      .catch(() => {})
      .finally(() => setLoadingP(false));

    api.get('/manager/messages/teacher-list')
      .then(({ data }) => setTeacherList(data))
      .catch(() => {})
      .finally(() => setLoadingT(false));

    // For starting new conversations
    api.get('/manager/students').then(({ data }) => setStudents(data)).catch(() => {});
    api.get('/manager/teachers').then(({ data }) => setTeachers(data)).catch(() => {});
  }, []);

  // When chat is closed, refresh the list
  const handleCloseChat = () => {
    setActiveChat(null);
    if (tab === 'parents') {
      setLoadingP(true);
      api.get('/manager/messages/parent-list')
        .then(({ data }) => setParentList(data))
        .catch(() => {})
        .finally(() => setLoadingP(false));
    } else {
      setLoadingT(true);
      api.get('/manager/messages/teacher-list')
        .then(({ data }) => setTeacherList(data))
        .catch(() => {})
        .finally(() => setLoadingT(false));
    }
  };

  if (activeChat) {
    return (
      <div className="h-[75vh] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ChatThread
          type={activeChat.type}
          participantId={activeChat.id}
          participantName={activeChat.name}
          onBack={handleCloseChat}
        />
      </div>
    );
  }

  // Get existing conversation ids to not show duplicates in picker
  const existingParentIds = new Set(parentList.map((p) => String(p.student_id)));
  const existingTeacherIds = new Set(teacherList.map((t) => String(t.teacher_id)));

  const newStudents = students.filter((s) => !existingParentIds.has(String(s.id)));
  const newTeachers = teachers.filter((t) => !existingTeacherIds.has(String(t.id)));

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-800">الرسائل 💬</h1>
        <p className="text-sm text-gray-500 mt-0.5">تواصل مع أولياء الأمور والمعلمات</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('parents')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${tab === 'parents' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={15} />
            أولياء الأمور
            {parentList.some((p) => parseInt(p.unread_count) > 0) && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('teachers')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${tab === 'teachers' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <GraduationCap size={15} />
            المعلمات
            {teacherList.some((t) => parseInt(t.unread_count) > 0) && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Lists */}
        {tab === 'parents' && (
          <div>
            {loadingP ? (
              <p className="text-sm text-gray-400 text-center py-8">جاري التحميل...</p>
            ) : parentList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-400">لا توجد محادثات مع أولياء الأمور</p>
              </div>
            ) : (
              parentList.map((p) => (
                <ConvItem
                  key={p.student_id}
                  name={p.student_name || `طالب #${p.student_id}`}
                  avatar={p.student_avatar || '👶'}
                  subtitle={`${p.class_id || ''}`}
                  unread={p.unread_count}
                  lastAt={p.last_message_at}
                  onClick={() => setActiveChat({ type: 'parent', id: p.student_id, name: p.student_name || `طالب #${p.student_id}` })}
                />
              ))
            )}
          </div>
        )}

        {tab === 'teachers' && (
          <div>
            {loadingT ? (
              <p className="text-sm text-gray-400 text-center py-8">جاري التحميل...</p>
            ) : teacherList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-400">لا توجد محادثات مع المعلمات</p>
              </div>
            ) : (
              teacherList.map((t) => (
                <ConvItem
                  key={t.teacher_id}
                  name={t.teacher_name || `معلمة #${t.teacher_id}`}
                  avatar="👩‍🏫"
                  subtitle=""
                  unread={t.unread_count}
                  lastAt={t.last_message_at}
                  onClick={() => setActiveChat({ type: 'teacher', id: t.teacher_id, name: t.teacher_name })}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Start new conversation button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-violet-200 text-violet-600 hover:bg-violet-50 text-sm font-bold transition-all"
      >
        <MessageSquare size={16} />
        {tab === 'parents' ? 'محادثة جديدة مع ولي أمر' : 'محادثة جديدة مع معلمة'}
      </button>

      {/* Person picker */}
      {showPicker && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-700">اختر {tab === 'parents' ? 'ولي الأمر' : 'المعلمة'}:</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {tab === 'parents' ? (
              newStudents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">لا يوجد أولياء أمور جدد</p>
              ) : newStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setShowPicker(false); setActiveChat({ type: 'parent', id: s.id, name: s.name }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-right border-b border-gray-50 last:border-0"
                >
                  <span className="text-xl">{s.avatar}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.class_id}</p>
                  </div>
                </button>
              ))
            ) : (
              newTeachers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">لا توجد معلمات جديدة</p>
              ) : newTeachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setShowPicker(false); setActiveChat({ type: 'teacher', id: t.id, name: t.name }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-right border-b border-gray-50 last:border-0"
                >
                  <span className="text-xl">👩‍🏫</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{t.name}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
