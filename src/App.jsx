import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { clearCredentials, restoreSession } from './store/slices/authSlice'; 
import PrivateRoute from './components/PrivateRoute'; 
import Home from './pages/Home';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import TasksPage from './pages/TasksPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LogOut } from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation(); 
  const { token, user } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  //LOGGING-OUT
  const handleLogout = () => {
    dispatch(clearCredentials());
    window.location.href = '/login'; 
  };

  const isAuthenticated = !!(token && user);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showNavbar = isAuthenticated && !isAuthPage;

  //NAVBAR:
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && ( 
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              {/* Top Row: Logo and Logout */}
              <div className="flex justify-between items-center mb-3">
                <Link className="font-semibold text-lg text-blue-600" to="/home">
                  My Workstation
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
              {/* Bottom Row: Navigation Links and Username */}
              <div className="flex gap-4 items-center overflow-x-auto pb-1">
                <Link className="text-sm whitespace-nowrap hover:text-blue-600 transition" to="/notes">
                  Notes
                </Link>
                <Link className="text-sm whitespace-nowrap hover:text-blue-600 transition" to="/bookmarks">
                  Bookmarks
                </Link>
                <Link className="text-sm whitespace-nowrap hover:text-blue-600 transition" to="/tasks">
                  Tasks
                </Link>
                <span className="text-xs text-gray-600 whitespace-nowrap ml-auto">
                  Hello, <span className="font-medium">{user.username}</span>
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex gap-6">
                <Link className="font-semibold text-lg text-blue-600" to="/home">
                  My Workstation
                </Link>
                <Link className="hover:text-blue-600 transition" to="/notes">
                  Notes
                </Link>
                <Link className="hover:text-blue-600 transition" to="/bookmarks">
                  Bookmarks
                </Link>
                <Link className="hover:text-blue-600 transition" to="/tasks">
                  Tasks
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hello, <span className="font-medium">{user.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="p-6">
        
        <Routes>
          {/* Default route → redirect to signup*/}
          <Route path="/" element={<Navigate to="/signup" replace />} />

          {/* Public pages */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Signup />} 
          />

          {/* Private pages  => Home, Notes, Bookmarks, Tasks*/}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <NotesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <PrivateRoute>
                <BookmarksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}