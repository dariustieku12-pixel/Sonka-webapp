import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Spinner } from './components/ui';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MapPage from './pages/MapPage';
import DriverPage from './pages/DriverPage';
import BookPage from './pages/BookPage';
import BookingsPage from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import FollowsPage from './pages/FollowsPage';
import FeedPage from './pages/FeedPage';
import InstallBanner from './components/InstallBanner';
import PostCreatePage from './pages/PostCreatePage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import BecomeDriverPage from './pages/BecomeDriverPage';
import type { ReactElement } from 'react';

// Gate that requires a logged-in user; bounces to /welcome otherwise.
function Protected({ children }: { children: ReactElement }) {
  const { user, ready } = useAuth();
  if (!ready) return <BootScreen />;
  if (!user) return <Navigate to="/welcome" replace />;
  return children;
}

function BootScreen() {
  return (
    <div className="app-shell">
      <div className="center-state" style={{ flex: 1 }}>
        <div className="logo" style={{ fontSize: 40, color: 'var(--gold)' }}>
          SONKA
        </div>
        <Spinner />
      </div>
    </div>
  );
}

export default function App() {
  const { ready } = useAuth();
  if (!ready) return <BootScreen />;

  return (
    <div className="app-shell">
      <InstallBanner />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route
          path="/feed"
          element={
            <Protected>
              <FeedPage />
            </Protected>
          }
        />
        <Route
          path="/post/create"
          element={
            <Protected>
              <PostCreatePage />
            </Protected>
          }
        />
        <Route
          path="/map"
          element={
            <Protected>
              <MapPage />
            </Protected>
          }
        />
        <Route
          path="/driver/:id"
          element={
            <Protected>
              <DriverPage />
            </Protected>
          }
        />
        <Route
          path="/book/:driverId"
          element={
            <Protected>
              <BookPage />
            </Protected>
          }
        />
        <Route
          path="/bookings"
          element={
            <Protected>
              <BookingsPage />
            </Protected>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <Protected>
              <BookingDetailPage />
            </Protected>
          }
        />
        <Route
          path="/messages"
          element={
            <Protected>
              <MessagesPage />
            </Protected>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <NotificationsPage />
            </Protected>
          }
        />
        <Route
          path="/become-driver"
          element={
            <Protected>
              <BecomeDriverPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route
          path="/follows/:userId"
          element={
            <Protected>
              <FollowsPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  );
}
