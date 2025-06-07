'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
}

interface PostFormData {
  title: string;
  content: string;
  image: string;
}

const AdminPanel = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PostFormData>({ title: '', content: '', image: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        setIsAuthenticated(true);
        fetchPosts();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        fetchPosts();
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      alert('Login error: ' + error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setPosts([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/posts/${editingId}` : '/api/admin/posts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts();
        resetForm();
        alert(editingId ? 'Post updated successfully!' : 'Post created successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error saving post: ' + error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts();
        alert('Post deleted successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting post: ' + error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', image: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Demo credentials: admin@example.com / admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex space-x-4">
              <a
                href="/"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                View Blog
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Add Post Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showForm ? 'Cancel' : 'Add New Post'}
            </button>
          </div>

          {/* Post Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit Post' : 'Create New Post'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (Markdown supported)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {editingId ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Posts</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No posts yet. Create your first post!
              </div>
            ) : (
              <div className="divide-y">
                {posts.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          Created: {format(new Date(post.created_at), 'PPP')}
                        </p>
                        <p className="text-gray-700 line-clamp-3">
                          {post.content.substring(0, 150)}...
                        </p>
                      </div>
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;