import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Search, Bell, PlusCircle, LogOut, User, BarChart2, Menu, X, Lightbulb } from 'lucide-react';
import api from '../api';

export default function Navbar({ searchQuery, setSearchQuery }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread/')
        .then(({ data }) => setUnread(data.unread_count))
        .catch(() => {});
      const interval = setInterval(() => {
        api.get('/notifications/unread/')
          .then(({ data }) => setUnread(data.unread_count))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <Lightbulb size={20} className="inline-block mr-1" /> IdeaValidator
        </Link>

        {setSearchQuery !== undefined && (
          <div className="navbar__search">
            <Search size={15} color="var(--text-muted)" />
            <input
              id="navbar-search"
              placeholder="Search ideas..."
              value={searchQuery || ''}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/submit" title="Submit Idea">
                <button className="btn btn-primary btn-sm" id="submit-idea-btn">
                  <PlusCircle size={15} /> Submit
                </button>
              </Link>

              <Link to="/notifications" title="Notifications">
                <button className="navbar__icon-btn" id="notif-btn">
                  <Bell size={17} />
                  {unread > 0 && <span className="navbar__badge">{unread}</span>}
                </button>
              </Link>

              <Link to="/dashboard" title="Dashboard">
                <button className="navbar__icon-btn" id="dashboard-btn">
                  <BarChart2 size={17} />
                </button>
              </Link>

              <Link to="/profile" title="Profile">
                <button className="navbar__icon-btn" id="profile-btn">
                  <User size={17} />
                </button>
              </Link>

              <button className="navbar__icon-btn" id="logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn btn-ghost btn-sm">Login</button></Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
