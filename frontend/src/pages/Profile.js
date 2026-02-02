import React, { useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '', dateOfBirth: '', profilePicture: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await authAPI.getProfile();
            setProfile(res.data.user);
            setForm({
                fullName: res.data.user.fullName || '',
                phone: res.data.user.phone || '',
                dateOfBirth: res.data.user.dateOfBirth ? new Date(res.data.user.dateOfBirth).toISOString().slice(0,10) : '',
                profilePicture: res.data.user.profilePicture || ''
            });
        } catch (err) {
            console.error('Fetch profile error:', err);
            alert('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await authAPI.updateProfile(form);
            setProfile(res.data.user);
            alert('Profile updated');
        } catch (err) {
            console.error('Update profile error:', err);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="mt-2 text-gray-600">Your account details</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full name</label>
                                    <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input value={profile.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>

            

                            <div className="mt-6 flex justify-end">
                                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Save profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900">Account Info</h3>
                            <div className="mt-4 text-sm text-gray-700">
                                <p><strong>User ID:</strong> {profile.firebaseUid}</p>
                                <p className="mt-2"><strong>Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
                                <p className="mt-2"><strong>Last login:</strong> {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
