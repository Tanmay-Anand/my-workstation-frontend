import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { clearCredentials, restoreSession } from './store/slices/authSlice'; 
import { setTheme } from './store/slices/themeSlice';
import PrivateRoute from './components/PrivateRoute'; 
import Home from './pages/Home';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import TasksPage from './pages/TasksPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LogOut, Moon, Sun } from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation(); 
  const { token, user } = useSelector(s => s.auth);
  const theme = useSelector(s => s.theme.mode);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    dispatch(setTheme(savedTheme));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(clearCredentials());
    window.location.href = '/login'; 
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const isAuthenticated = !!(token && user);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showNavbar = isAuthenticated && !isAuthPage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {showNavbar && ( 
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-3">
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              {/* Top Row: Logo, Theme Toggle, and Logout */}
              <div className="flex justify-between items-center mb-3">
                <Link className="font-semibold text-lg text-blue-600 dark:text-blue-400" to="/home">
                  My Workstation
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTheme}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <Moon size={18} className="text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Sun size={18} className="text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
              {/* Bottom Row: Navigation Links and Username */}
              <div className="flex gap-4 items-center overflow-x-auto pb-1">
                <Link className="text-sm whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/notes">
                  Notes
                </Link>
                <Link className="text-sm whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/bookmarks">
                  Bookmarks
                </Link>
                <Link className="text-sm whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/tasks">
                  Tasks
                </Link>
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap ml-auto">
                  Hello, <span className="font-medium">{user.username}</span>
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex gap-6">
                <Link className="font-semibold text-lg text-blue-600 dark:text-blue-400" to="/home">
                  My Workstation
                </Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/notes">
                  Notes
                </Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/bookmarks">
                  Bookmarks
                </Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" to="/tasks">
                  Tasks
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Hello, <span className="font-medium">{user.username}</span>
                </span>
                <button
                  onClick={handleToggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun size={20} className="text-gray-300" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
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
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Signup />} 
          />
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