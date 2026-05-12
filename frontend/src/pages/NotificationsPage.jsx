import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const { data } = await api.get('/notifications/');
    setNotifications(data.results ?? data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await api.post('/notifications/mark-all-read/');
    fetchNotifications();
  };

  const markRead = async (n) => {
    if (!n.is_read) await api.post(`/notifications/${n.id}/read/`);
    navigate(`/ideas/${n.idea}`);
  };

  const VERB_ICONS = { commented: '💬', voted: '👍', replied: '↩️' };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '680px', paddingTop: '32px' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={22} color="var(--accent-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Notifications</h1>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button id="mark-all-read-btn" className="btn btn-secondary btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="card" style={{ padding: '8px' }}>
          {loading ? (
            <div className="spinner" />
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔔</div>
              <h3>All caught up!</h3>
              <p>No notifications yet. Submit an idea and engage with the community.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} id={`notif-${n.id}`} onClick={() => markRead(n)}>
                <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: n.is_read ? 400 : 600 }}>
                    {VERB_ICONS[n.verb]} <strong>@{n.sender?.username}</strong> {n.verb} on <strong>"{n.idea_title}"</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
