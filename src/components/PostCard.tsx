// A single feed post — LinkedIn-style card with like + inline comments.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { timeAgo } from '../lib/format';
import { vehicleEmoji } from '../lib/constants';
import type { Comment, Post } from '../lib/types';
import { Avatar } from './ui';
import { useToast } from './Toast';

const POST_TYPE_CHIP: Record<string, { label: string; cls: string }> = {
  product: { label: '🛒 For sale', cls: 'badge-gold' },
  availability: { label: '🟢 Available', cls: 'badge-green' },
  road_alert: { label: '⚠️ Road alert', cls: 'badge-red' },
  price_board: { label: '💰 Price board', cls: 'badge-navy' },
};

export default function PostCard({ post }: { post: Post }) {
  const nav = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(!!post.is_liked);
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const driver = post.user.driver_profiles?.[0];
  const chip = POST_TYPE_CHIP[post.post_type];

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      await api.post(`/feed/${post.id}/like`);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  }

  async function openComments() {
    setShowComments((s) => !s);
    if (!commentsLoaded) {
      try {
        const res = await api.get(`/feed/${post.id}/comments`);
        setComments(res.data.comments || []);
        setCommentsLoaded(true);
      } catch {
        /* leave empty */
      }
    }
  }

  async function sendComment() {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/feed/${post.id}/comments`, { content: draft.trim() });
      setComments((c) => [...c, res.data.comment]);
      setCommentCount((n) => n + 1);
      setDraft('');
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      {/* Author */}
      <div className="row" style={{ marginBottom: 10 }}>
        <div onClick={() => nav(`/driver/${post.user.id}`)} style={{ cursor: 'pointer' }}>
          <Avatar src={post.user.profile_photo_url} name={post.user.name} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 6 }}>
            <strong style={{ fontSize: 14 }}>{post.user.name}</strong>
            {driver?.driver_level && (
              <span className="badge badge-gold" style={{ fontSize: 9 }}>
                {driver.driver_level}
              </span>
            )}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            {post.user.user_type === 'driver' || post.user.user_type === 'both'
              ? `${vehicleEmoji(driver?.vehicle_type)} Driver`
              : 'Customer'}
            {post.city ? ` · ${post.city}` : ''} · {timeAgo(post.created_at)}
          </div>
        </div>
        {post.is_sponsored && <span className="badge badge-grey" style={{ fontSize: 9 }}>Sponsored</span>}
      </div>

      {chip && (
        <span className={`badge ${chip.cls}`} style={{ marginBottom: 8, display: 'inline-block' }}>
          {chip.label}
        </span>
      )}

      {/* Product / route / price details */}
      {post.product_name && (
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{post.product_name}</div>
      )}
      {(post.route_from || post.route_to) && (
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          📍 {post.route_from || '?'} → {post.route_to || '?'}
        </div>
      )}
      {post.price_ghs != null && (
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
          GHS {post.price_ghs}
        </div>
      )}

      {post.content && (
        <p style={{ fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{post.content}</p>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: post.media_urls.length === 1 ? '1fr' : '1fr 1fr',
            gap: 4,
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          {post.media_urls.slice(0, 4).map((u, i) => (
            <img key={i} src={u} alt="" loading="lazy" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
          ))}
        </div>
      )}
      {post.video_url && (
        <video src={post.video_url} controls style={{ width: '100%', borderRadius: 10, marginBottom: 8 }} />
      )}

      {post.is_sponsored && post.sponsor_cta_url && (
        <a
          href={post.sponsor_cta_url}
          target="_blank"
          rel="noopener"
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 8 }}
          onClick={() => api.post(`/feed/${post.id}/sponsor-click`).catch(() => {})}
        >
          Learn more →
        </a>
      )}

      {/* Actions */}
      <div className="row" style={{ gap: 18, borderTop: '1px solid var(--off-white)', paddingTop: 8 }}>
        <button onClick={toggleLike} style={actionBtn(liked)}>
          {liked ? '❤️' : '🤍'} {likes > 0 ? likes : ''} Like
        </button>
        <button onClick={openComments} style={actionBtn(false)}>
          💬 {commentCount > 0 ? commentCount : ''} Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--off-white)', paddingTop: 10 }}>
          {comments.map((c) => (
            <div key={c.id} className="row" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
              <Avatar src={c.user.profile_photo_url} name={c.user.name} />
              <div style={{ flex: 1, background: 'var(--off-white)', borderRadius: 10, padding: '7px 10px' }}>
                <strong style={{ fontSize: 13 }}>{c.user.name}</strong>
                <div style={{ fontSize: 13 }}>{c.content}</div>
                <div className="muted" style={{ fontSize: 11 }}>{timeAgo(c.created_at)}</div>
              </div>
            </div>
          ))}
          {commentsLoaded && comments.length === 0 && (
            <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>No comments yet. Be the first.</p>
          )}
          <div className="row" style={{ gap: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment…"
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: '1.5px solid var(--light-grey)',
                borderRadius: 20,
                fontSize: 14,
              }}
            />
            <button className="btn btn-primary btn-sm" disabled={!draft.trim() || sending} onClick={sendComment}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function actionBtn(active: boolean): React.CSSProperties {
  return {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    color: active ? 'var(--error)' : 'var(--grey)',
    padding: '4px 0',
  };
}
