import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../utils/api';
import {
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    BeakerIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const PrivacyControls = () => {
    const [visibilitySettings, setVisibilitySettings] = useState({
        bloodGroup: true,
        allergies: true,
        currentMedications: true,
        emergencyContacts: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [accessLogs, setAccessLogs] = useState([]);

    useEffect(() => {
        fetchPrivacyData();
    }, []);

    const fetchPrivacyData = async () => {
        try {
            setLoading(true);
            const response = await emergencyAPI.getProfile();
            if (response.data.profile) {
                const vs = { ...(response.data.profile.visibilitySettings || {}) };
                // Remove legacy field if present
                if (vs && Object.prototype.hasOwnProperty.call(vs, 'chronicConditions')) {
                    delete vs.chronicConditions;
                }
                setVisibilitySettings(vs);
                setAccessLogs(response.data.accessLogs || []);
            }
        } catch (error) {
            console.error('Fetch privacy data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (field) => {
        setVisibilitySettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Ensure legacy keys are not sent
            const payload = { ...visibilitySettings };
            if (Object.prototype.hasOwnProperty.call(payload, 'chronicConditions')) {
                delete payload.chronicConditions;
            }
            await emergencyAPI.updateVisibility(payload);
            alert('Privacy settings updated successfully!');
        } catch (error) {
            console.error('Update settings error:', error);
            alert('Error updating privacy settings');
        } finally {
            setSaving(false);
        }
    };

    const getFieldDescription = (field) => {
        const descriptions = {
            bloodGroup: 'Your blood type - critical for transfusions',
            allergies: 'Allergies and adverse reactions - prevents medication errors',

            currentMedications: 'Current prescriptions - prevents drug interactions',
            emergencyContacts: 'Trusted contacts to notify in emergencies'
        };
        return descriptions[field] || '';
    };

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
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Privacy Controls</h1>
                            <p className="mt-2 text-gray-600">
                                Control what emergency responders can see when they scan your QR code
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start space-x-3">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">How Privacy Works</h3>
                                <p className="text-sm text-gray-700">
                                    Emergency responders can only access the information you choose to share. 
                                    Your full medical records remain private. All emergency access is logged 
                                    and time-bound.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Privacy Settings */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Emergency Data Visibility</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Toggle what information is available in emergency mode
                                </p>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {/* Blood Group */}
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <HeartIcon className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Blood Group</h3>
                                                <p className="text-sm text-gray-600">
                                                    {getFieldDescription('bloodGroup')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('bloodGroup')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                visibilitySettings.bloodGroup ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                visibilitySettings.bloodGroup ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Allergies */}
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-yellow-100 rounded-lg">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Allergies</h3>
                                                <p className="text-sm text-gray-600">
                                                    {getFieldDescription('allergies')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('allergies')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                visibilitySettings.allergies ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                visibilitySettings.allergies ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                                {/* Current Medications */}
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <BeakerIcon className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Current Medications</h3>
                                                <p className="text-sm text-gray-600">
                                                    {getFieldDescription('currentMedications')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('currentMedications')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                visibilitySettings.currentMedications ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                visibilitySettings.currentMedications ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <UserGroupIcon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Emergency Contacts</h3>
                                                <p className="text-sm text-gray-600">
                                                    {getFieldDescription('emergencyContacts')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('emergencyContacts')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                visibilitySettings.emergencyContacts ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                visibilitySettings.emergencyContacts ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Access Logs & Info */}
                    <div className="space-y-6">
                        {/* Current Settings Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Current Settings Summary</h3>
                            <div className="space-y-3">
                                {Object.entries(visibilitySettings).map(([field, isVisible]) => (
                                    <div key={field} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 capitalize">
                                            {field.replace(/([A-Z])/g, ' $1')}
                                        </span>
                                        <span className={`text-sm px-2 py-1 rounded ${
                                            isVisible
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {isVisible ? (
                                                <span className="flex items-center">
                                                    <EyeIcon className="h-3 w-3 mr-1" />
                                                    Visible
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                    Hidden
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Access Logs */}
                        {accessLogs.length > 0 && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">Recent Emergency Accesses</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {accessLogs.slice(0, 5).map((log, index) => (
                                        <div key={index} className="px-6 py-3 border-b border-gray-100 last:border-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(log.accessedAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {log.accessedFields.length} fields accessed
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.accessedAt).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Privacy Tips */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                                <LockClosedIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Privacy Best Practices</h4>
                                    <ul className="text-sm text-gray-700 space-y-2">
                                        <li>• Enable only critical information for emergencies</li>
                                        <li>• Review access logs regularly</li>

                                        <li>• Share QR code only with trusted individuals</li>
                                        <li>• Keep emergency contacts updated</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyControls;