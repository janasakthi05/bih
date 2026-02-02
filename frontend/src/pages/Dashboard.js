import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    QrCodeIcon, 
    FolderIcon, 
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    BellIcon,
    UserGroupIcon,
    CalendarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { emergencyAPI, recordsAPI, remindersAPI } from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        emergencyProfile: false,
        recordsCount: 0,
        remindersCount: 0,
        recentAccesses: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch emergency profile
            const emergencyRes = await emergencyAPI.getProfile();
            
            // Fetch records count
            const recordsRes = await recordsAPI.getRecords({ limit: 1 });
            
            // Fetch reminders count
            const remindersRes = await remindersAPI.getReminders({
                status: 'Pending',
                startDate: new Date().toISOString().split('T')[0]
            });

            setStats({
                emergencyProfile: !!emergencyRes.data.profile,
                recordsCount: recordsRes.data.pagination?.total || 0,
                remindersCount: remindersRes.data.reminders?.length || 0,
                recentAccesses: emergencyRes.data.profile?.accessLogs || []
            });
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Emergency Smart Card',
            description: 'Create or update your emergency profile',
            icon: QrCodeIcon,
            path: '/emergency',
            color: 'bg-red-100 text-red-600'
        },
        {
            title: 'Upload Medical Record',
            description: 'Add new medical documents',
            icon: FolderIcon,
            path: '/records',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'Privacy Settings',
            description: 'Control emergency data visibility',
            icon: ShieldCheckIcon,
            path: '/privacy',
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Add Reminder',
            description: 'Set medication or appointment reminders',
            icon: BellIcon,
            path: '/reminders',
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Your health information at a glance</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Emergency Profile</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats.emergencyProfile ? 'Completed' : 'Incomplete'}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <UserGroupIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/emergency"
                                className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                                {stats.emergencyProfile ? 'Update profile' : 'Create profile'} →
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medical Records</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats.recordsCount}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FolderIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/records"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                View all records →
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Today's Reminders</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats.remindersCount}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <BellIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/reminders"
                                className="text-sm font-medium text-purple-600 hover:text-purple-500"
                            >
                                Manage reminders →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.title}
                                to={action.path}
                                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg ${action.color}`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Emergency Access */}
                {stats.recentAccesses.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Emergency Accesses</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {stats.recentAccesses.slice(0, 5).map((access, index) => (
                                <div key={index} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Accessed on {new Date(access.accessedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {access.ipAddress} • {access.userAgent?.substring(0, 50)}...
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(access.accessedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Health Tips */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Health Tips</h3>
                    </div>
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            <span className="font-semibold">Stay Hydrated:</span> Drink at least 8 glasses of water daily.
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Regular Check-ups:</span> Don't skip your annual health screenings.
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Emergency Preparedness:</span> Keep your emergency profile updated and share with trusted contacts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;