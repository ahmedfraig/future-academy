import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, PenLine, Reply, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes]           = useState([]);
  const [parentNote, setParentNote] = useState('');
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');
  // Manager messages
  const [messages, setMessages]     = useState([]);
  const [msgText, setMsgText]       = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgLoading, setMsgLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);
  // Inline replies on teacher notes
  const [replyOpen, setReplyOpen]   = useState({});  // noteId -> bool
  const [replyText, setReplyText]   = useState({});  // noteId -> string

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/parent/notes');
      setNotes(data);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/parent/messages');
      setMessages(data);
    } catch {}
    finally { setMsgLoading(false); }
  };

  useEffect(() => { fetchNotes(); fetchMessages(); }, []);

  const handleSend = async () => {
    if (!parentNote.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/parent/notes', { text: parentNote.trim() });
      setNotes((prev) => [data, ...prev]);
      setParentNote('');
      showToast('✅ تم إرسال الملاحظة بنجاح!');
    } catch {
      showToast('❌ فشل إرسال الملاحظة');
    } finally {
      setSending(false);
    }
  };

  // Reply to teacher note on the general notes channel
  const handleReplyToNote = async (teacherNoteId) => {
    const txt = replyText[teacherNoteId]?.trim();
    if (!txt) return;
    try {
      const { data } = await api.post('/parent/notes', { text: txt });
      setNotes((prev) => [data, ...prev]);
      setReplyText((prev) => ({ ...prev, [teacherNoteId]: '' }));
      setReplyOpen((prev) => ({ ...prev, [teacherNoteId]: false }));
      showToast('✅ تم إرسال الرد');
    } catch {
      showToast('❌ فشل إرسال الرد');
    }
  };

  const handleSendManagerMsg = async () => {
    if (!msgText.trim()) return;
    setMsgSending(true);
    try {
      const { data } = await api.post('/parent/messages', { text: msgText.trim() });
      setMessages((prev) => [...prev, data]);
      setMsgText('');
      showToast('✅ تم إرسال الرسالة للمدير');
    } catch {
      showToast('❌ فشل إرسال الرسالة');
    } finally { setMsgSending(false); }
  };

  const teacherNotes = notes.filter((n) => n.from_role === 'teacher');
  const myNotes      = notes.filter((n) => n.from_role === 'parent');

  const formatDate = (ts) =>
    ts ? new Date(ts).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';

  const managerUnread = messages.filter((m) => m.from_role === 'manager').length > 0;

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-1 w-6 bg-purple-500 rounded-full" />
        <h1 className="text-base font-bold text-gray-700">الملاحظات</h1>
      </div>

      {/* Teacher's Notes — with inline reply */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-purple-500 to-indigo-500 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">ملاحظات المعلمة</p>
              <p className="text-purple-100 text-xs">{teacherNotes.length} ملاحظة</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">جاري التحميل...</p>
          ) : teacherNotes.length === 0 ? (
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 text-center">
              <p className="text-gray-400 text-sm">لا توجد ملاحظات من المعلمة بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {teacherNotes.map((note) => (
                <div key={note.id} className="bg-purple-50 rounded-2xl border border-purple-100 overflow-hidden">
                  <div className="p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{note.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-purple-400 font-medium">{note.from_name}</span>
                      <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                  {/* Reply toggle */}
                  <div className="border-t border-purple-100">
                    <button
                      onClick={() => setReplyOpen((prev) => ({ ...prev, [note.id]: !prev[note.id] }))}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-600 hover:bg-purple-100 transition-all"
                    >
                      <Reply size={13} />
                      {replyOpen[note.id] ? 'إخفاء' : 'رد على المعلمة'}
                    </button>
                    {replyOpen[note.id] && (
                      <div className="flex gap-2 px-4 pb-3">
                        <input
                          value={replyText[note.id] || ''}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [note.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleReplyToNote(note.id)}
                          placeholder="اكتب ردك..."
                          className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-purple-400"
                          style={{ fontFamily: 'Cairo, sans-serif' }}
                        />
                        <button
                          onClick={() => handleReplyToNote(note.id)}
                          disabled={!replyText[note.id]?.trim()}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${replyText[note.id]?.trim() ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Note to Teacher */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <PenLine size={18} className="text-blue-600" />
            </div>
            <span className="font-bold text-gray-800 text-base">إرسال ملاحظة للمعلمة</span>
          </div>
          <textarea
            value={parentNote}
            onChange={(e) => setParentNote(e.target.value)}
            placeholder="اكتب ملاحظتك هنا... مثلاً: طفلي لم ينم جيداً الليلة، أو لديه حساسية من محددة..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none min-h-[160px] transition-all"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleSend}
            disabled={!parentNote.trim() || sending}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              sending
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : parentNote.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? '⟳ جاري الإرسال...' : <><Send size={15} /> إرسال الملاحظة</>}
          </button>
        </div>
      </div>

      {/* My Previous Notes */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-700 mb-3">ملاحظاتي السابقة ({myNotes.length})</p>
        {myNotes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">لم ترسل ملاحظات بعد</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myNotes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed">{note.text}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Manager Messages ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setManagerOpen(!managerOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-amber-600" />
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-sm">رسائل الإدارة</p>
              <p className="text-xs text-gray-400">تواصل مباشر مع المدير</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {managerUnread && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
            {managerOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        {managerOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            {/* Chat */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {msgLoading ? (
                <p className="text-xs text-gray-400 text-center py-4">جاري التحميل...</p>
              ) : messages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm text-gray-400">ابدأ المحادثة مع الإدارة</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from_role === 'parent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.from_role === 'parent' ? 'bg-amber-500 text-white rounded-tr-sm' : 'bg-amber-50 border border-amber-100 text-gray-700 rounded-tl-sm'}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-0.5 ${m.from_role === 'parent' ? 'text-amber-100' : 'text-gray-400'}`}>
                        {m.from_role === 'manager' ? 'الإدارة · ' : ''}{fmtTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Send message */}
            <div className="flex gap-2">
              <input
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendManagerMsg()}
                placeholder="اكتب رسالة للمدير..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
              <button
                onClick={handleSendManagerMsg}
                disabled={!msgText.trim() || msgSending}
                className={`w-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${msgText.trim() && !msgSending ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
