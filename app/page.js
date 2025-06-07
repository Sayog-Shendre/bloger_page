'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
}

interface BlogListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BlogList = ({ posts, currentPage, totalPages, onPageChange }: BlogListProps) => (
  <div className="space-y-8">
    {posts.map((post) => (
      <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {post.image && (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Published on {format(new Date(post.created_at), 'MMMM dd, yyyy')}
          </p>
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown>
              {post.content.length > 300 ? `${post.content.substring(0, 300)}...` : post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    ))}
    
    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${page}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        throw new Error(data.message || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Posts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPosts()}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Tech Blog</h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">No Posts Yet</h2>
              <p className="text-gray-500">Check back later for new content!</p>
            </div>
          ) : (
            <BlogList
              posts={posts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Tech Blog. Built with Next.js and deployed on Vercel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}