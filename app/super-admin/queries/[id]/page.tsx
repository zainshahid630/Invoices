'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuperAdminLayout from '../../components/SuperAdminLayout';

interface QueryDetail {
    id: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
    admin_response?: string;
    company: {
        name: string;
        business_name: string;
    };
    user: {
        email: string;
        name: string;
    };
}

export default function QueryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [query, setQuery] = useState<QueryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        admin_response: '',
    });

    useEffect(() => {
        fetchQueryDetails();
    }, [params.id]);

    const fetchQueryDetails = async () => {
        try {
            // Re-use the list API with filtering or create a specific GET endpoint.
            // Since we didn't create a specific GET /id endpoint for admin (only PATCH),
            // we can fetch all and find, OR better, update the plan to include GET /id.
            // Actually, usually GET /api/super-admin/queries/[id] is standard.
            // Let's check if I implemented GET in [id]/route.ts.
            // I only implemented PATCH. I should add GET to [id]/route.ts or just filter from list.
            // Filtering from list is inefficient but works for now if list is small.
            // BUT, I should probably add GET to the route.
            // For now, let's try to fetch list and filter, or I'll quickly add GET to the route in a separate step if needed.
            // Wait, I can just add GET to the route file now.

            // Let's assume I will add GET to the route file in the next step or I can use the list endpoint with a filter if I supported ID filtering.
            // The list endpoint supports status filter.
            // Let's just add GET to the route file. It's cleaner.

            // For now, I'll implement the UI assuming the API exists, and then I'll fix the API.
            // Actually, I can't assume it exists if I didn't write it.
            // I'll write the GET method in the route file first.

            // Wait, I can't switch tasks in the middle of this tool call block easily without finishing this file.
            // I'll write the UI code to use the GET endpoint, and then I'll immediately update the API route.

            const res = await fetch(`/api/super-admin/queries/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setQuery(data);
                setFormData({
                    status: data.status,
                    admin_response: data.admin_response || '',
                });
            }
        } catch (error) {
            console.error('Error fetching query details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch(`/api/super-admin/queries/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedQuery = await res.json();
                setQuery(updatedQuery);
                alert('Query updated successfully');
                router.refresh();
            } else {
                alert('Failed to update query');
            }
        } catch (error) {
            console.error('Error updating query:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">Loading...</div>
        );
    }

    if (!query) {
        return (
            <div className="p-6 text-center">Query not found</div>
        );
    }

    return (
        <div>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/super-admin/queries" className="text-blue-600 hover:underline mb-2 inline-block">
                        &larr; Back to Queries
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Query Details</h1>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{query.subject}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Company</p>
                                <p className="font-medium">{query.company?.name}</p>
                                <p className="text-xs text-gray-500">{query.company?.business_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">User</p>
                                <p className="font-medium">{query.user?.name} ({query.user?.email})</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-medium">{new Date(query.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Current Status</p>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${query.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                    query.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {query.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50">
                        <p className="text-gray-700 whitespace-pre-wrap">{query.message}</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status & Response</h3>
                    <form onSubmit={handleUpdate}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                            <textarea
                                rows={4}
                                value={formData.admin_response}
                                onChange={(e) => setFormData({ ...formData, admin_response: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your response to the seller..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={updating}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Update Query'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
