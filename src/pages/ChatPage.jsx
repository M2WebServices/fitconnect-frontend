import { useState, useRef, useEffect } from 'react';
import Icon from '../components/Icon.jsx';

const initialMessages = [
  { id: 1, type: 'system', text: 'Lucas a complété une séance de running' },
  {
    id: 2,
    type: 'received',
    sender: 'Lucas',
    avatar: 'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
    text: 'Super séance ce matin !',
    time: '09:15',
    grouped: false,
  },
  {
    id: 3,
    type: 'received',
    sender: null,
    avatar: null,
    text: 'Qui est chaud pour demain ?',
    time: '09:16',
    grouped: true,
  },
  {
    id: 4,
    type: 'received',
    sender: 'Emma',
    avatar: 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FEuropean%2F4',
    text: 'Moi je suis partante pour un 10k.',
    time: '09:42',
    grouped: false,
  },
  { id: 5, type: 'sent', text: 'Je vous rejoins !', time: '14:31', grouped: false },
  { id: 6, type: 'sent', text: 'À quelle heure ?', time: '14:32', grouped: true },
];

function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'sent', text: inputValue.trim(), time: now, grouped: false },
    ]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-layout">
      {/* Left: Conversations */}
      <div className="chat-left-col">
        <div className="chat-left-header">Conversations</div>
        <div className="chat-conv-list">
          <div className="chat-conv is-active">
            <div className="chat-conv-avatar">GC</div>
            <div className="chat-conv-info">
              <div className="chat-conv-top">
                <span className="chat-conv-name">Chat du groupe GymCrew</span>
                <span className="chat-conv-time">14:32</span>
              </div>
              <span className="chat-conv-last">À quelle heure ?</span>
            </div>
          </div>
        </div>
        <div className="chat-left-footer">
          <span className="chat-pulse-dot" />
          <span className="chat-online-label">Temps réel actif</span>
        </div>
      </div>

      {/* Right: Messages */}
      <div className="chat-right-col">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-avatar">GC</div>
            <div>
              <p className="chat-header-title">Chat du groupe GymCrew</p>
              <p className="chat-header-status">● 5 en ligne</p>
            </div>
          </div>
          <button className="chat-header-btn">
            <Icon name="lucide:info" size={20} />
          </button>
        </div>

        <div className="chat-messages-area">
          {messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="msg-system">
                  <div className="msg-sys-line" />
                  <span className="msg-sys-text">— {msg.text} —</span>
                  <div className="msg-sys-line" />
                </div>
              );
            }
            if (msg.type === 'received') {
              return (
                <div key={msg.id} className={`msg-received${msg.grouped ? ' is-grouped' : ''}`}>
                  {msg.avatar ? (
                    <img src={msg.avatar} alt={msg.sender} className="msg-avatar" />
                  ) : (
                    <div className="msg-avatar-placeholder" />
                  )}
                  <div className="msg-content-wrap">
                    {msg.sender && <span className="msg-sender-name">{msg.sender}</span>}
                    <div className="msg-bubble-recv">{msg.text}</div>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`msg-sent${msg.grouped ? ' is-grouped' : ''}`}>
                <div className="msg-bubble-sent">{msg.text}</div>
                <span className="msg-time">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input-field"
            placeholder="Écrire un message au groupe..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`chat-send-btn${inputValue.trim() ? ' is-active' : ''}`}
            onClick={sendMessage}
          >
            <Icon name="lucide:send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
