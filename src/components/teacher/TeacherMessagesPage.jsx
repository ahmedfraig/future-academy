import React, { useState, useEffect, useRef } from 'react';
import { Building2, Send, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [toast, setToast]       = useState('');
  const bottomRef               = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/teacher/messages');
      setMessages(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/teacher/messages', { text: text.trim() });
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch {
      showToast('❌ فشل إرسال الرسالة');
    } finally { setSending(false); }
  };

  const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex flex-col h-full bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-violet-600 to-purple-600 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-black text-base">رسائل الإدارة</p>
          <p className="text-purple-200 text-xs">تواصل مباشر مع مدير الحضانة</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">جاري التحميل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-bold text-gray-600 text-sm">لا توجد رسائل بعد</p>
            <p className="text-xs text-gray-400 mt-1">يمكنك إرسال رسالة للمدير من هنا</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.from_role === 'teacher' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                m.from_role === 'teacher'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-sm'
              }`}>
                {m.from_role === 'manager' && (
                  <p className="text-xs font-bold text-violet-500 mb-1">🏢 المدير</p>
                )}
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from_role === 'teacher' ? 'text-violet-200' : 'text-gray-400'}`}>
                  {fmtTime(m.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالة للمدير..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${text.trim() && !sending ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          <Send size={18} />
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
