import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../utils/api';
import { 
    QrCodeIcon, 
    HeartIcon, 
    ExclamationTriangleIcon,
    BeakerIcon,
    PhoneIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const EmergencyCard = () => {
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const [formData, setFormData] = useState({
        bloodGroup: '',
        allergies: [{ name: '', severity: '', reaction: '' }],
        currentMedications: [{ name: '', dosage: '', frequency: '', purpose: '' }],
        emergencyContacts: [{ name: '', relationship: '', phone: '', isPrimary: true }]
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await emergencyAPI.getProfile();
            if (response.data.profile) {
                const profile = response.data.profile;

                setFormData({
                    bloodGroup: profile.bloodGroup || '',
                    allergies: profile.allergies && profile.allergies.length > 0 
                        ? profile.allergies 
                        : [{ name: '', severity: '', reaction: '' }],
                    currentMedications: profile.currentMedications && profile.currentMedications.length > 0
                        ? profile.currentMedications
                        : [{ name: '', dosage: '', frequency: '', purpose: '' }],
                    emergencyContacts: profile.emergencyContacts && profile.emergencyContacts.length > 0
                        ? profile.emergencyContacts
                        : [{ name: '', relationship: '', phone: '', isPrimary: true }]
                });

                // If a QR image or shareable URL exists, show it so that the QR persists across navigation
                if (response.data.qrCodeImage) {
                    setQrCode(response.data.qrCodeImage);
                    setShowQR(true);
                }

                if (response.data.shareableUrl) {
                    // Optional: store the shareable URL in state if needed
                    // setShareableUrl(response.data.shareableUrl);
                    console.log('QR shareable URL:', response.data.shareableUrl);
                }
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) => {
                // Ensure only one primary contact can be set for emergencyContacts
                if (section === 'emergencyContacts' && field === 'isPrimary') {
                    return { ...item, isPrimary: i === index ? !!value : false };
                }

                return i === index ? { ...item, [field]: value } : item;
            })
        }));
    }; 

    const handleAddItem = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], getEmptyItem(section)]
        }));
    };

    const handleRemoveItem = (section, index) => {
        if (formData[section].length > 1) {
            setFormData(prev => ({
                ...prev,
                [section]: prev[section].filter((_, i) => i !== index)
            }));
        }
    };

    const getEmptyItem = (section) => {
        switch(section) {
            case 'allergies':
                return { name: '', severity: '', reaction: '' };

            case 'currentMedications':
                return { name: '', dosage: '', frequency: '', purpose: '' };
            case 'emergencyContacts':
                return { name: '', relationship: '', phone: '', isPrimary: false };
            default:
                return {};
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await emergencyAPI.saveProfile(formData);
            await fetchProfile();
            alert('Emergency profile saved successfully!');
        } catch (error) {
            console.error('Save profile error:', error);
            alert('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    const generateQR = async () => {
        try {
            setGeneratingQR(true);
            const response = await emergencyAPI.generateQR();
            setQrCode(response.data.qrCode);
            setShowQR(true);
        } catch (error) {
            console.error('Generate QR error:', error);
            alert('Error generating QR code');
        } finally {
            setGeneratingQR(false);
        }
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = 'emergency-qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Emergency Smart Card</h1>
                    <p className="mt-2 text-gray-600">
                        Create your emergency health profile for first responders
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Blood Group */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <HeartIcon className="h-6 w-6 text-red-500" />
                                    <h2 className="text-xl font-semibold text-gray-900">Blood Group</h2>
                                </div>
                                <select
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </div>

                            {/* Allergies */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                                        <h2 className="text-xl font-semibold text-gray-900">Allergies</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('allergies')}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        + Add Allergy
                                    </button>
                                </div>
                                {formData.allergies.map((allergy, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Allergy Name
                                            </label>
                                            <input
                                                type="text"
                                                value={allergy.name}
                                                onChange={(e) => handleInputChange('allergies', index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Penicillin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Severity
                                            </label>
                                            <select
                                                value={allergy.severity}
                                                onChange={(e) => handleInputChange('allergies', index, 'severity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">Select Severity</option>
                                                <option value="Mild">Mild</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Severe">Severe</option>
                                                <option value="Life-threatening">Life-threatening</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reaction
                                            </label>
                                            <input
                                                type="text"
                                                value={allergy.reaction}
                                                onChange={(e) => handleInputChange('allergies', index, 'reaction', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Rash, Difficulty breathing"
                                            />
                                            {formData.allergies.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem('allergies', index)}
                                                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Current Medications */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <BeakerIcon className="h-6 w-6 text-blue-500" />
                                        <h2 className="text-xl font-semibold text-gray-900">Current Medications</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('currentMedications')}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        + Add Medication
                                    </button>
                                </div>

                                {formData.currentMedications.map((med, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => handleInputChange('currentMedications', index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Atorvastatin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                                            <input
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => handleInputChange('currentMedications', index, 'dosage', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., 10 mg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                            <input
                                                type="text"
                                                value={med.frequency}
                                                onChange={(e) => handleInputChange('currentMedications', index, 'frequency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Once daily"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose (optional)</label>
                                            <input
                                                type="text"
                                                value={med.purpose}
                                                onChange={(e) => handleInputChange('currentMedications', index, 'purpose', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Cholesterol control"
                                            />
                                            {formData.currentMedications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem('currentMedications', index)}
                                                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Emergency Contacts */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <PhoneIcon className="h-6 w-6 text-green-500" />
                                        <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('emergencyContacts')}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        + Add Contact
                                    </button>
                                </div>

                                {formData.emergencyContacts.map((contact, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg items-start">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={contact.name}
                                                onChange={(e) => handleInputChange('emergencyContacts', index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="Full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                            <input
                                                type="text"
                                                value={contact.relationship}
                                                onChange={(e) => handleInputChange('emergencyContacts', index, 'relationship', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Spouse, Parent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={contact.phone}
                                                onChange={(e) => handleInputChange('emergencyContacts', index, 'phone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., +1 555 555 5555"
                                            />

                                            <div className="flex items-center justify-between mt-2">
                                                <label className="flex items-center text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!contact.isPrimary}
                                                        onChange={(e) => handleInputChange('emergencyContacts', index, 'isPrimary', e.target.checked)}
                                                        className="mr-2"
                                                    />
                                                    Primary Contact
                                                </label>

                                                {formData.emergencyContacts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem('emergencyContacts', index)}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Emergency Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - QR Code & Preview */}
                    <div className="space-y-6">
                        {/* QR Code Generation */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-center mb-6">
                                <QrCodeIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Emergency QR Code</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Generate QR code for emergency access
                                </p>
                            </div>

                            {showQR ? (
                                <div className="text-center">
                                    <img
                                        src={qrCode}
                                        alt="Emergency QR Code"
                                        className="w-48 h-48 mx-auto mb-4"
                                    />
                                    <div className="space-y-2">
                                        <button
                                            onClick={downloadQR}
                                            className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                        >
                                            Download QR Code
                                        </button>
                                        <button
                                            onClick={() => setShowQR(false)}
                                            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Generate New QR
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={generateQR}
                                    disabled={generatingQR}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {generatingQR ? 'Generating...' : 'Generate QR Code'}
                                </button>
                            )}

                            <div className="mt-6 text-sm text-gray-500">
                                <p className="flex items-center mt-2">
                                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                                    Shows only emergency data
                                </p>
                                <p className="flex items-center mt-2">
                                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                                    Read-only access for responders
                                </p>
                            </div>
                        </div>

                        {/* Emergency Preview */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">What Responders See</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Blood Group</span>
                                    <span className="font-medium">{formData.bloodGroup || 'Not set'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Allergies</span>
                                    <span className="font-medium">
                                        {formData.allergies.filter(a => a.name).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Current Medications</span>
                                    <span className="font-medium">
                                        {formData.currentMedications.filter(m => m.name).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Emergency Contacts</span>
                                    <span className="font-medium">
                                        {formData.emergencyContacts.filter(c => c.name).length}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-red-200">
                                <p className="text-xs text-red-600">
                                    ⚠️ Only critical information is shown to emergency responders
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyCard;