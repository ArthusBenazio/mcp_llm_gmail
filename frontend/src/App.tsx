import { useState } from 'react';
import axios from 'axios';

export function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post('http://localhost:3001/chat', { message });
      setResponse(res.data.response);
    } catch (err) {
      console.error(err);
      setResponse('❌ Erro ao enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f2f2f2',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 700,
        padding: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{
          fontSize: 28,
          marginBottom: 24,
          textAlign: 'center',
          color: '#333'
        }}>💬 Chat com Claude + MCP</h1>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: 16,
              fontSize: 18,
              borderRadius: 12,
              border: '1px solid #ccc',
              resize: 'vertical',
              marginBottom: 20,
              backgroundColor: '#fafafa',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 0',
              fontSize: 18,
              borderRadius: 12,
              border: 'none',
              backgroundColor: loading ? '#bbb' : '#4a90e2',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => {
              if (!loading) (e.currentTarget.style.backgroundColor = '#3b7dc4');
            }}
            onMouseOut={(e) => {
              if (!loading) (e.currentTarget.style.backgroundColor = '#4a90e2');
            }}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        {response && (
          <div style={{
            marginTop: 32,
            padding: 20,
            backgroundColor: '#f9f9f9',
            borderRadius: 12,
            border: '1px solid #e0e0e0',
            color: '#444',
            fontSize: 17,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            <h3 style={{
              marginBottom: 12,
              fontSize: 20,
              color: '#222'
            }}>Resposta:</h3>
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
