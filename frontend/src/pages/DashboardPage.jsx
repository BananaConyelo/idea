import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Trophy, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#f97316','#8b5cf6','#22c55e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myIdeas, setMyIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaStats, setIdeaStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/stats/'),
      api.get('/analytics/leaderboard/'),
      api.get('/ideas/my/'),
    ]).then(([statsRes, lbRes, ideasRes]) => {
      setStats(statsRes.data);
      setLeaderboard(lbRes.data);
      const ideas = ideasRes.data.results ?? ideasRes.data;
      setMyIdeas(ideas);
      if (ideas.length > 0) {
        setSelectedIdea(ideas[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedIdea) {
      api.get(`/analytics/idea/${selectedIdea}/`)
        .then(({ data }) => setIdeaStats(data))
        .catch(() => setIdeaStats(null));
    }
  }, [selectedIdea]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  // Category distribution from my ideas
  const catData = myIdeas.reduce((acc, idea) => {
    const found = acc.find(x => x.name === idea.category);
    if (found) found.value++;
    else acc.push({ name: idea.category, value: 1 });
    return acc;
  }, []);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <BarChart2 size={24} color="var(--accent-light)" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Analytics Dashboard</h1>
        </div>

        {/* Global Stats */}
        {stats && (
          <div className="grid-3" style={{ marginBottom: '28px' }}>
            {[
              { label: 'Total Ideas', value: stats.total_ideas, icon: '💡', color: 'var(--accent-light)' },
              { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'var(--success)' },
              { label: 'Total Votes', value: stats.total_votes, icon: '👍', color: 'var(--warning)' },
              { label: 'Total Comments', value: stats.total_comments, icon: '💬', color: 'var(--info)' },
              { label: 'My Ideas', value: myIdeas.length, icon: '🚀', color: '#a78bfa' },
              { label: 'My Total Votes', value: myIdeas.reduce((a, i) => a + i.upvote_count, 0), icon: '⭐', color: '#f472b6' },
            ].map(s => (
              <div key={s.label} className="chart-container" style={{ padding: '20px' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: '28px' }}>
          {/* Views Over Time */}
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="chart-title">📈 Views (Last 7 Days)</div>
              {myIdeas.length > 0 && (
                <select
                  id="idea-selector"
                  className="filter-select"
                  value={selectedIdea || ''}
                  onChange={e => setSelectedIdea(e.target.value)}
                  style={{ fontSize: '0.75rem' }}
                >
                  {myIdeas.map(idea => <option key={idea.id} value={idea.id}>{idea.title.slice(0, 30)}</option>)}
                </select>
              )}
            </div>
            {ideaStats ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={ideaStats.views_by_day}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div style={{ fontSize: '1.5rem' }}>📊</div>
                <p style={{ marginTop: '8px' }}>No data yet. Submit an idea to see stats.</p>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="chart-container">
            <div className="chart-title">🗂 My Ideas by Category</div>
            {catData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}><p>Submit ideas to see distribution.</p></div>
            )}
          </div>
        </div>

        {/* Idea Performance Bar Chart */}
        {myIdeas.length > 0 && (
          <div className="chart-container" style={{ marginBottom: '28px' }}>
            <div className="chart-title">🏆 Idea Performance (Upvotes)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={myIdeas.slice(0, 8).map(i => ({ name: i.title.slice(0, 20), upvotes: i.upvote_count, views: i.view_count, comments: i.comment_count }))}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="upvotes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
              {[['#6366f1','Upvotes'],['#10b981','Views'],['#f59e0b','Comments']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="chart-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trophy size={18} color="var(--warning)" />
            <div className="chart-title" style={{ marginBottom: 0 }}>Top Contributors</div>
          </div>
          {leaderboard.map((u, i) => (
            <div key={u.username} className="lb-item" id={`lb-${i + 1}`}>
              <div className={`lb-rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : `#${u.rank}`}
              </div>
              <div className="profile-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{u.username[0].toUpperCase()}</div>
              <div className="lb-name">@{u.username}</div>
              <div className="lb-votes">{u.idea_count} ideas · {u.total_votes} votes</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
