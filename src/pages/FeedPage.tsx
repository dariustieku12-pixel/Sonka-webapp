import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { Avatar, EmptyState, FullSpinner, TabBar, TopBar } from '../components/ui';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'availability', label: '🟢 Available' },
  { key: 'product', label: '🛒 For sale' },
  { key: 'price_board', label: '💰 Prices' },
  { key: 'road_alert', label: '⚠️ Alerts' },
  { key: 'general', label: '💬 Updates' },
];

export default function FeedPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/feed', {
        params: { limit: 30, ...(filter !== 'all' ? { type: filter } : {}) },
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the feed.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="screen">
      <TopBar
        logo
        right={
          <button
            className="topbar-back"
            onClick={() => nav('/notifications')}
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
          </button>
        }
      />

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '10px 12px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--light-grey)',
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`badge ${filter === f.key ? 'badge-navy' : 'badge-grey'}`}
            style={{ whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', padding: '7px 13px', fontSize: 12 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="screen-scroll pad">
        {/* Compose prompt */}
        <div
          className="card card-tap row"
          onClick={() => nav('/post/create')}
          style={{ marginBottom: 14 }}
        >
          <Avatar src={user?.profile_photo_url} name={user?.name} />
          <div
            style={{
              flex: 1,
              background: 'var(--off-white)',
              borderRadius: 20,
              padding: '10px 14px',
              color: 'var(--grey)',
              fontSize: 14,
            }}
          >
            Share an update, route or price…
          </div>
        </div>

        {loading ? (
          <FullSpinner label="Loading the feed…" />
        ) : error ? (
          <EmptyState icon="⚠️" title="Couldn't load feed" text={error} />
        ) : posts.length === 0 ? (
          <EmptyState icon="📭" title="Nothing here yet" text="Be the first to post in your area.">
            <button className="btn btn-primary btn-sm" onClick={() => nav('/post/create')}>
              Create a post
            </button>
          </EmptyState>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      <TabBar />
    </div>
  );
}
