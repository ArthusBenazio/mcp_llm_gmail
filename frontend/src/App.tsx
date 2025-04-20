import { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/chat', { message });
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.data.response,
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: '❌ Erro ao enviar mensagem.' }]);
    } finally {
      setLoading(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  return (
    <div className="container">
      <div className="card">
        <h1>💬 Chat com OpenIA + MCP</h1>
      {chatHistory && chatHistory.length > 0 ? (
        <div className="chat-box">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="message assistant-message">Digitando...</div>}
          <div ref={chatEndRef} />
        </div>
      ): null}
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}
