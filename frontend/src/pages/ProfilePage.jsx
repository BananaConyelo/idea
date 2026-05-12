import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import IdeaCard from '../components/IdeaCard';
import { Edit3, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [myIdeas, setMyIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', interests: '', skills: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ bio: user.bio || '', interests: user.interests || '', skills: user.skills || '' });
      api.get('/ideas/my/').then(({ data }) => {
        setMyIdeas(data.results ?? data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/profile/', form);
      await refreshUser();
      setEditing(false);
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const totalVotes = myIdeas.reduce((acc, idea) => acc + idea.upvote_count, 0);
  const totalViews = myIdeas.reduce((acc, idea) => acc + idea.view_count, 0);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '32px' }}>
        <div className="profile-header">
          <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div className="profile-name">@{user.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
              </div>
              {!editing
                ? <button id="edit-profile-btn" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit3 size={13} /> Edit Profile</button>
                : <div style={{ display: 'flex', gap: '8px' }}>
                    <button id="save-profile-btn" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Save size={13} /> {saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
                  </div>
              }
            </div>

            {!editing ? (
              <>
                {user.bio && <div className="profile-bio">{user.bio}</div>}
                <div className="profile-tags">
                  {user.interests && <span className="badge badge-indigo">💡 {user.interests}</span>}
                  {user.skills && <span className="badge badge-green">🛠 {user.skills}</span>}
                </div>
              </>
            ) : (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea id="profile-bio" className="form-control" rows={2} placeholder="Tell the community about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input id="profile-interests" className="form-control" placeholder="Interests (e.g. AI, Health)" value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} />
                  <input id="profile-skills" className="form-control" placeholder="Skills (e.g. Python, Design)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {[{ label: 'Ideas', value: myIdeas.length }, { label: 'Total Votes', value: totalVotes }, { label: 'Total Views', value: totalViews }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-light)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="section-title">💡 My Ideas</div>
        </div>

        {loading ? <div className="spinner" /> : myIdeas.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">💡</div><h3>No ideas yet</h3><p>Share your first startup idea!</p></div>
        ) : (
          <div className="ideas-grid">{myIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}</div>
        )}
      </div>
    </div>
  );
}
