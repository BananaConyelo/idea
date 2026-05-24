import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import IdeaCard from '../components/IdeaCard';
import { useAuth } from '../context/AuthContext';
import { Flame, Clock, TrendingUp, Star, Lightbulb } from 'lucide-react';

const CATEGORIES = ['all','tech','health','finance','education','environment','social','entertainment','ecommerce','other'];
const SORTS = [
  { key: 'newest', label: 'Newest', icon: <Clock size={13}/> },
  { key: 'trending', label: 'Trending', icon: <Flame size={13}/> },
  { key: 'most_voted', label: 'Most Voted', icon: <Star size={13}/> },
];

export default function HomePage({ searchQuery }) {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState(null);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ideasRef = useRef(null);

  const scrollToIdeas = () => {
    ideasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchIdeas = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = { page: reset ? 1 : page };
      if (category !== 'all') params.category = category;
      if (sort === 'trending' || sort === 'most_voted') params.sort = sort;
      else params.ordering = '-created_at';
      if (searchQuery) params.search = searchQuery;

      const { data } = await api.get('/ideas/', { params });
      const results = data.results ?? data;
      if (reset) {
        setIdeas(results);
        setPage(2);
      } else {
        setIdeas(prev => [...prev, ...results]);
        setPage(p => p + 1);
      }
      setHasMore(!!data.next);
    } finally {
      setLoading(false);
    }
  }, [category, sort, searchQuery, page]);

  useEffect(() => { fetchIdeas(true); }, [category, sort, searchQuery]);

  useEffect(() => {
    api.get('/ideas/trending/').then(({ data }) => setTrending(data.results ?? data));
    api.get('/analytics/stats/').then(({ data }) => setStats(data));
  }, []);

  return (
    <div>
      {/* Hero */}
      {!user && (
        <section className="hero">
          <div className="hero__tag"><Lightbulb size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />The Platform for Startup Ideas</div>
          <h1 className="hero__title">Validate Your Startup Idea with the Community</h1>
          <p className="hero__sub">Submit ideas, get votes and feedback, discover trending innovations, and see AI-powered SWOT analysis.</p>
          <div className="hero__actions">
            <Link to="/register"><button className="btn btn-primary btn-lg" id="hero-signup-btn">Get Started Free</button></Link>
            <Link to="/login"><button className="btn btn-secondary btn-lg">Sign In</button></Link>
          </div>
        </section>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <button
            className="stats-bar__item stats-bar__item--link"
            id="nav-ideas"
            onClick={() => { setSort('newest'); setCategory('all'); setTimeout(scrollToIdeas, 100); }}
          >
            <div className="stats-bar__num">{stats.total_ideas}</div>
            <div className="stats-bar__label">Ideas</div>
          </button>
          <button
            className="stats-bar__item stats-bar__item--link"
            id="nav-innovators"
            onClick={() => { setSort('most_voted'); setCategory('all'); setTimeout(scrollToIdeas, 100); }}
          >
            <div className="stats-bar__num">{stats.total_users}</div>
            <div className="stats-bar__label">Innovators</div>
          </button>
          <button
            className="stats-bar__item stats-bar__item--link"
            id="nav-votes"
            onClick={() => { setSort('most_voted'); setCategory('all'); setTimeout(scrollToIdeas, 100); }}
          >
            <div className="stats-bar__num">{stats.total_votes}</div>
            <div className="stats-bar__label">Votes</div>
          </button>
          <button
            className="stats-bar__item stats-bar__item--link"
            id="nav-comments"
            onClick={() => { setSort('trending'); setCategory('all'); setTimeout(scrollToIdeas, 100); }}
          >
            <div className="stats-bar__num">{stats.total_comments}</div>
            <div className="stats-bar__label">Comments</div>
          </button>
          {stats.idea_of_the_week && (
            <div className="stats-bar__item">
              <div className="stats-bar__num" style={{fontSize:'0.9rem'}}>💡 {stats.idea_of_the_week.title}</div>
              <div className="stats-bar__label">Idea of the Week</div>
            </div>
          )}
        </div>
      )}

      <div className="container" style={{ paddingTop: user ? '30px' : 0 }}>
        {/* Trending strip */}
        {trending.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div className="section-header">
              <div><div className="section-title">🔥 Trending Now</div><div className="section-sub">Top ideas gaining traction this week</div></div>
              <Link to="?sort=trending" style={{ fontSize: '0.8rem', color: 'var(--accent-light)' }}>See all</Link>
            </div>
            <div className="ideas-grid">
              {trending.slice(0, 3).map(idea => <IdeaCard key={idea.id} idea={idea} trending />)}
            </div>
          </div>
        )}

        {/* Filter + Sort */}
        <div className="filter-bar">
          {CATEGORIES.map(cat => (
            <button key={cat} id={`filter-${cat}`} className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {SORTS.map(s => (
              <button key={s.key} id={`sort-${s.key}`} className={`filter-btn ${sort === s.key ? 'active' : ''}`} onClick={() => setSort(s.key)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="section-header" ref={ideasRef} style={{ scrollMarginTop: '80px' }}>
          <div className="section-title">All Ideas</div>
          {user && <Link to="/submit"><button className="btn btn-primary btn-sm" id="submit-idea-top-btn">+ Submit Idea</button></Link>}
        </div>

        {loading && ideas.length === 0 ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : ideas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💡</div>
            <h3>No ideas found</h3>
            <p>Be the first to submit an idea in this category!</p>
          </div>
        ) : (
          <>
            <div className="ideas-grid">
              {ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button className="btn btn-secondary" id="load-more-btn" onClick={() => fetchIdeas()} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
