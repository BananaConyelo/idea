import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Eye, MessageCircle, Lock, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  tech: '#6366f1', health: '#10b981', finance: '#f59e0b',
  education: '#3b82f6', environment: '#22c55e', social: '#ec4899',
  entertainment: '#f97316', ecommerce: '#8b5cf6', other: '#64748b',
};

export default function IdeaCard({ idea, trending }) {
  const navigate = useNavigate();

  return (
    <div
      className="idea-card"
      id={`idea-card-${idea.id}`}
      onClick={() => navigate(`/ideas/${idea.id}`)}
    >
      <div className="idea-card__header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, flexDirection: 'column' }}>
          {trending && (
            <span className="trending-badge">🔥 Trending</span>
          )}
          <h3 className="idea-card__title">{idea.title}</h3>
        </div>
        <span
          className="idea-card__category"
          style={{ background: `${CATEGORY_COLORS[idea.category]}20`, color: CATEGORY_COLORS[idea.category], borderColor: `${CATEGORY_COLORS[idea.category]}40` }}
        >
          {idea.category}
        </span>
      </div>

      <p className="idea-card__desc">{idea.description}</p>

      <div className="idea-card__footer">
        <span className="idea-card__stat" title="Upvotes">
          <ThumbsUp size={14} color="var(--success)" /> {idea.upvote_count}
        </span>
        <span className="idea-card__stat" title="Downvotes">
          <ThumbsDown size={14} color="var(--danger)" /> {idea.downvote_count}
        </span>
        <span className="idea-card__stat" title="Views">
          <Eye size={14} /> {idea.view_count}
        </span>
        <span className="idea-card__stat" title="Comments">
          <MessageCircle size={14} /> {idea.comment_count}
        </span>
        {!idea.is_public && (
          <span className="idea-card__private">
            <Lock size={12} /> Private
          </span>
        )}
        <span className="idea-card__author">@{idea.owner?.username}</span>
      </div>
    </div>
  );
}
