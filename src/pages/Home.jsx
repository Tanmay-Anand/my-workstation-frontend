import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { StickyNote, Bookmark, CheckSquare, TrendingUp } from 'lucide-react';

export default function Home() {
  const user = useSelector(s => s.auth.user);
  const token = useSelector(s => s.auth.token); 
  const [stats, setStats] = useState({ notes: 0, bookmarks: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => { 
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [notesRes, bookmarksRes, tasksRes] = await Promise.all([
        api.get('/notes?page=0&size=1'),
        api.get('/bookmarks?page=0&size=1'),
        api.get('/tasks?page=0&size=1')
      ]);

      setStats({
        notes: notesRes.data.totalElements || 0,
        bookmarks: bookmarksRes.data.totalElements || 0,
        tasks: tasksRes.data.totalElements || 0
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchStats();
    }
  }, [user, token, fetchStats]);

  useEffect(() => {
    const handleFocus = () => {
      if (user && token) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, token, fetchStats]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your personal workstation to manage notes, bookmarks, and tasks all in one place.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading your workspace...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Notes Card */}
          <Link to="/notes" className="block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <StickyNote size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.notes}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Notes</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Capture ideas and organize your thoughts
              </p>
            </div>
          </Link>

          {/* Bookmarks Card */}
          <Link to="/bookmarks" className="block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Bookmark size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.bookmarks}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Bookmarks</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Save and categorize your favorite links
              </p>
            </div>
          </Link>

          {/* Tasks Card */}
          <Link to="/tasks" className="block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckSquare size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.tasks}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Tasks</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Track your to-dos and stay productive
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/notes" className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg hover:shadow-md transition text-center border border-transparent dark:border-gray-700">
            <span className="font-medium text-blue-600 dark:text-blue-400">+ New Note</span>
          </Link>
          <Link to="/bookmarks" className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg hover:shadow-md transition text-center border border-transparent dark:border-gray-700">
            <span className="font-medium text-purple-600 dark:text-purple-400">+ New Bookmark</span>
          </Link>
          <Link to="/tasks" className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg hover:shadow-md transition text-center border border-transparent dark:border-gray-700">
            <span className="font-medium text-green-600 dark:text-green-400">+ New Task</span>
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">📝 Notes</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Create and edit notes</li>
              <li>• Pin important notes</li>
              <li>• Archive completed notes</li>
              <li>• Tag and search</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">🔖 Bookmarks</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Save favorite links</li>
              <li>• Organize by category</li>
              <li>• Add tags for filtering</li>
              <li>• Quick search</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">✅ Tasks</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Track to-dos</li>
              <li>• Set priorities</li>
              <li>• Add due dates</li>
              <li>• Mark complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}