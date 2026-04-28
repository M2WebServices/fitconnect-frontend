import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import {
  fetchChatBootstrap,
  fetchChatRealtimeConfig,
  fetchGroupMessages,
  sendGroupMessage,
} from '../services/chatService.js';

function formatTime(dateValue) {
  if (!dateValue) return '--:--';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function initialsFromName(name) {
  const safe = (name || 'GC').trim();
  const parts = safe.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function mapMessages(messages, meId) {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  return sorted.map((msg, index) => {
    const isSent = msg.senderId === meId;
    const prev = sorted[index - 1];
    const grouped = Boolean(prev && prev.senderId === msg.senderId);
    return {
      id: msg.id,
      type: isSent ? 'sent' : 'received',
      sender: msg.sender?.username || msg.sender?.email || 'Membre',
      text: msg.content,
      time: formatTime(msg.createdAt),
      grouped,
    };
  });
}

function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isRealtime, setIsRealtime] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const realtimeConfigRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedGroupId) || null,
    [conversations, selectedGroupId]
  );

  const loadBootstrap = async () => {
    setIsLoading(true);
    setError('');
    try {
      const bootstrap = await fetchChatBootstrap();
      setCurrentUser(bootstrap.me || null);
      setConversations(bootstrap.conversations || []);
      setSelectedGroupId((prev) => prev || bootstrap.conversations?.[0]?.id || '');

      const config = await fetchChatRealtimeConfig().catch(() => null);
      if (config?.wsUrl) {
        realtimeConfigRef.current = config;
      }
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger le chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (groupId) => {
    if (!groupId) {
      setMessages([]);
      return;
    }

    try {
      const apiMessages = await fetchGroupMessages(groupId, 80);
      const uiMessages = mapMessages(apiMessages, currentUser?.id);
      setMessages(uiMessages);
      if (apiMessages.length) {
        const last = apiMessages[apiMessages.length - 1];
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === groupId
              ? {
                  ...conv,
                  lastMessage: last.content,
                  lastCreatedAt: last.createdAt,
                }
              : conv
          )
        );
      }
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les messages.');
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    if (!selectedGroupId || !currentUser?.id) return;

    loadMessages(selectedGroupId);

    const config = realtimeConfigRef.current;

    if (config?.wsUrl) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(config.wsUrl);
      wsRef.current = ws;

      let heartbeatTimer = null;

      ws.onopen = () => {
        setIsRealtime(true);
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, (config.heartbeatSeconds || 30) * 1000);
      };

      ws.onmessage = () => {
        loadMessages(selectedGroupId);
      };

      ws.onerror = () => {
        setIsRealtime(false);
      };

      ws.onclose = () => {
        setIsRealtime(false);
        clearInterval(heartbeatTimer);
      };

      return () => {
        clearInterval(heartbeatTimer);
        ws.close();
        wsRef.current = null;
        setIsRealtime(false);
      };
    }

    // Fallback: polling
    const intervalMs = config?.heartbeatSeconds ? config.heartbeatSeconds * 1000 : 8000;
    const timer = setInterval(() => {
      loadMessages(selectedGroupId);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [selectedGroupId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedGroupId) return;

    setIsSending(true);
    setError('');
    try {
      await sendGroupMessage(selectedGroupId, inputValue.trim());
      setInputValue('');
      await loadMessages(selectedGroupId);
    } catch (sendError) {
      setError(sendError.message || 'Envoi du message impossible.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-layout">
      {error && <p className="dashboard-status dashboard-status-error chat-status-banner">{error}</p>}
      {isLoading && <p className="dashboard-status chat-status-banner">Chargement des conversations...</p>}

      {/* Left: Conversations */}
      <div className="chat-left-col">
        <div className="chat-left-header">Conversations</div>
        <div className="chat-conv-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`chat-conv${selectedGroupId === conversation.id ? ' is-active' : ''}`}
              onClick={() => setSelectedGroupId(conversation.id)}
            >
              <div className="chat-conv-avatar">{initialsFromName(conversation.name)}</div>
              <div className="chat-conv-info">
                <div className="chat-conv-top">
                  <span className="chat-conv-name">{conversation.name}</span>
                  <span className="chat-conv-time">{formatTime(conversation.lastCreatedAt)}</span>
                </div>
                <span className="chat-conv-last">{conversation.lastMessage || 'Aucun message'}</span>
              </div>
            </div>
          ))}
          {!conversations.length && <p className="chat-empty-note">Aucun groupe de discussion.</p>}
        </div>
        <div className="chat-left-footer">
          <span className="chat-pulse-dot" />
          {isRealtime
            ? <span className="chat-online-label">Temps réel actif</span>
            : <span className="chat-online-label">Sync auto</span>
          }
        </div>
      </div>

      {/* Right: Messages */}
      <div className="chat-right-col">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-avatar">
              {initialsFromName(selectedConversation?.name || 'GC')}
            </div>
            <div>
              <p className="chat-header-title">{selectedConversation?.name || 'Aucun groupe'}</p>
              <p className="chat-header-status">● {messages.length} message(s)</p>
            </div>
          </div>
          <button className="chat-header-btn">
            <Icon name="lucide:info" size={20} />
          </button>
        </div>

        <div className="chat-messages-area">
          {!messages.length && (
            <div className="msg-system">
              <div className="msg-sys-line" />
              <span className="msg-sys-text">Aucun message pour ce groupe</span>
              <div className="msg-sys-line" />
            </div>
          )}
          {messages.map((msg) => {
            if (msg.type === 'received') {
              return (
                <div key={msg.id} className={`msg-received${msg.grouped ? ' is-grouped' : ''}`}>
                  {!msg.grouped ? (
                    <div className="msg-avatar-fallback">{initialsFromName(msg.sender)}</div>
                  ) : (
                    <div className="msg-avatar-placeholder" />
                  )}
                  <div className="msg-content-wrap">
                    {!msg.grouped && msg.sender && <span className="msg-sender-name">{msg.sender}</span>}
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
            disabled={!selectedGroupId || isSending}
          />
          <button
            className={`chat-send-btn${inputValue.trim() && selectedGroupId && !isSending ? ' is-active' : ''}`}
            onClick={sendMessage}
            disabled={!selectedGroupId || isSending}
          >
            <Icon name="lucide:send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
