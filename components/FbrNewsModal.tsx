'use client';

import { useState, useEffect } from 'react';
import { X, Newspaper, ExternalLink, AlertCircle } from 'lucide-react';

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: string;
    image?: string;
}

interface FbrNewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FbrNewsModal({ isOpen, onClose }: FbrNewsModalProps) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchNews();
        }
    }, [isOpen]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/news/fbr');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch news');
            }

            setArticles(data.articles || []);
        } catch (err) {
            console.error('Error fetching news:', err);
            setError(err instanceof Error ? err.message : 'Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Newspaper className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">FBR & Taxation News</h2>
                            <p className="text-sm text-blue-100">Latest updates from Pakistan</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Loading latest news...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-red-600 font-semibold mb-2">Failed to load news</p>
                            <p className="text-gray-600 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchNews}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Newspaper className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 font-semibold mb-2">No recent news found</p>
                            <p className="text-gray-500 text-sm">Check back later for updates on FBR and taxation</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {articles.map((article, index) => (
                                <div
                                    key={index}
                                    className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {article.image && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full sm:w-32 h-32 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                                {article.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-blue-600">{article.source}</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                                <span>{formatDate(article.publishedAt)}</span>
                                                <div className="flex-1"></div>
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                                >
                                                    Read More
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !error && articles.length > 0 && (
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3">
                        <p className="text-xs text-gray-500 text-center">
                            News powered by GNews.io • Updated automatically
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
