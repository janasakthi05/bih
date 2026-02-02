import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { emergencyAPI } from '../utils/api';
import {
    HeartIcon,
    ExclamationTriangleIcon,
    BeakerIcon,
    PhoneIcon,
    ShieldExclamationIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const EmergencyPublicView = () => {
    const { hash } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmergencyData = async () => {
            try {
                setLoading(true);
                const response = await emergencyAPI.getPublicProfile(hash);
                setData(response.data);
                setError('');
            } catch (err) {
                setError('Invalid or expired QR code');
                console.error('Fetch emergency data error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmergencyData();
    }, [hash]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading emergency information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <ShieldExclamationIcon className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                <p className="text-gray-600 text-center max-w-md">{error}</p>
                <p className="mt-4 text-sm text-gray-500">
                    This QR code may have expired or is invalid.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
            {/* Emergency Header */}
            <div className="bg-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <HeartIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">EMERGENCY HEALTH INFORMATION</h1>
                                <p className="text-red-100 text-sm mt-1">
                                    For emergency medical personnel only
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs bg-white/20 px-2 py-1 rounded">
                                <ClockIcon className="h-3 w-3 inline mr-1" />
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-xs mt-1 text-red-100">Read-only access</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Patient Info */}
                <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
                    <div className="bg-gray-800 text-white px-6 py-4">
                        <h2 className="text-xl font-bold">PATIENT INFORMATION</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Full Name</p>
                                <p className="text-lg font-semibold">{data.userInfo.fullName}</p>
                            </div>
                            {data.userInfo.age && (
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="text-lg font-semibold">{data.userInfo.age} years</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Critical Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Blood Group */}
                    {data.emergencyData.bloodGroup && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <HeartIcon className="h-6 w-6 text-red-500" />
                                <h3 className="font-bold text-gray-900">Blood Group</h3>
                            </div>
                            <div className="text-center py-4">
                                <span className="text-4xl font-bold text-red-600">
                                    {data.emergencyData.bloodGroup}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Allergies */}
                    {data.emergencyData.allergies && data.emergencyData.allergies.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                                <h3 className="font-bold text-gray-900">Allergies</h3>
                            </div>
                            <div className="space-y-3">
                                {data.emergencyData.allergies.map((allergy, index) => (
                                    <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{allergy.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                allergy.severity === 'Life-threatening' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {allergy.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Medications */}
                    {data.emergencyData.currentMedications && data.emergencyData.currentMedications.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <BeakerIcon className="h-6 w-6 text-blue-500" />
                                <h3 className="font-bold text-gray-900">Current Medications</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.emergencyData.currentMedications.map((med, index) => (
                                    <div key={index} className="bg-blue-50 p-4 rounded border border-blue-200">
                                        <p className="font-medium text-gray-900">{med.name}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Dosage:</span> {med.dosage}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Frequency:</span> {med.frequency}
                                            </p>
                                            {med.purpose && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Purpose:</span> {med.purpose}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Emergency Contacts */}
                    {data.emergencyData.emergencyContacts && data.emergencyData.emergencyContacts.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <PhoneIcon className="h-6 w-6 text-green-500" />
                                <h3 className="font-bold text-gray-900">Emergency Contacts</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.emergencyData.emergencyContacts.map((contact, index) => (
                                    <div key={index} className={`p-4 rounded border ${
                                        contact.isPrimary
                                            ? 'bg-green-50 border-green-300'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{contact.name}</p>
                                                {contact.isPrimary && (
                                                    <div className="mt-1">
                                                        <span className="text-xs text-green-800 font-semibold">PRIMARY</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center space-x-4">
                                                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                                                    <a
                                                        href={`tel:${contact.phone}`}
                                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        <PhoneIcon className="h-4 w-4" />
                                                        <span className="font-medium ml-1">{contact.phone}</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                        <ShieldExclamationIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">IMPORTANT DISCLAIMER</h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• This information is provided by the patient for emergency medical purposes only</li>
                                <li>• Data shown is limited to critical emergency information as selected by the patient</li>
                                <li>• This is not a complete medical record</li>
                                <li>• Verify information with patient when possible</li>
                                <li>• Access is logged and monitored for security</li>
                            </ul>
                            <p className="mt-4 text-xs text-gray-500">
                                Smart Health Vault • Emergency-First Digital Health Identity • {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyPublicView;