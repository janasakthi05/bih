import React, { useState, useEffect } from 'react';
import { remindersAPI } from '../utils/api';
import {
    BellIcon,
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    const [formData, setFormData] = useState({
        type: 'Medication',
        title: '',
        description: '',
        scheduledFor: '',
        recurrence: 'Once',
        notificationPreference: 'SMS',
        metadata: {
            medicationName: '',
            dosage: '',
            doctorName: '',
            location: '',
            notes: ''
        }
    });

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const response = await remindersAPI.getReminders();
            setReminders(response.data.reminders || []);
        } catch (error) {
            console.error('Fetch reminders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('metadata.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReminder) {
                await remindersAPI.updateReminder(editingReminder._id, formData);
                alert('Reminder updated successfully!');
            } else {
                await remindersAPI.createReminder(formData);
                alert('Reminder created successfully!');
            }
            
            setShowForm(false);
            setEditingReminder(null);
            setFormData({
                type: 'Medication',
                title: '',
                description: '',
                scheduledFor: '',
                recurrence: 'Once',
                notificationPreference: 'Push',
                metadata: {
                    medicationName: '',
                    dosage: '',
                    doctorName: '',
                    location: '',
                    notes: ''
                }
            });
            
            await fetchReminders();
        } catch (error) {
            console.error('Save reminder error:', error);
            alert('Error saving reminder');
        }
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setFormData({
            type: reminder.type,
            title: reminder.title,
            description: reminder.description || '',
            scheduledFor: new Date(reminder.scheduledFor).toISOString().slice(0, 16),
            recurrence: reminder.recurrence,
            notificationPreference: reminder.notificationPreference,
            metadata: reminder.metadata || {
                medicationName: '',
                dosage: '',
                doctorName: '',
                location: '',
                notes: ''
            }
        });
        setShowForm(true);
    };

    const handleDelete = async (reminderId) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) {
            return;
        }

        try {
            await remindersAPI.deleteReminder(reminderId);
            await fetchReminders();
            alert('Reminder deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting reminder');
        }
    };

    const handleStatusChange = async (reminderId, status) => {
        try {
            await remindersAPI.updateReminder(reminderId, { status });
            await fetchReminders();
        } catch (error) {
            console.error('Update status error:', error);
            alert('Error updating reminder status');
        }
    };

    const getReminderIcon = (type) => {
        switch(type) {
            case 'Medication':
                return '💊';
            case 'Appointment':
                return '🏥';
            case 'Follow-up':
                return '📅';
            case 'Test':
                return '🧪';
            default:
                return '🔔';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Skipped':
                return 'bg-gray-100 text-gray-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const upcomingReminders = reminders.filter(r => 
        r.status === 'Pending' && 
        new Date(r.scheduledFor) >= new Date()
    ).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

    const pastReminders = reminders.filter(r => 
        r.status !== 'Pending' || 
        new Date(r.scheduledFor) < new Date()
    ).sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));

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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                        <p className="mt-2 text-gray-600">Manage medication, appointments, and health reminders</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingReminder(null);
                            setFormData({
                                type: 'Medication',
                                title: '',
                                description: '',
                                scheduledFor: '',
                                recurrence: 'Once',
                                notificationPreference: 'SMS',
                                metadata: {
                                    medicationName: '',
                                    dosage: '',
                                    doctorName: '',
                                    location: '',
                                    notes: ''
                                }
                            });
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Add Reminder</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Upcoming Reminders */}
                        {upcomingReminders.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Reminders</h2>
                                <div className="space-y-4">
                                    {upcomingReminders.map((reminder) => (
                                        <div key={reminder._id} className="bg-white rounded-lg shadow p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="text-2xl">
                                                        {getReminderIcon(reminder.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <h3 className="font-semibold text-gray-900">
                                                                {reminder.title}
                                                            </h3>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status)}`}>
                                                                {reminder.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mt-1">{reminder.description}</p>
                                                        
                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                                <CalendarIcon className="h-4 w-4" />
                                                                <span>{formatDateTime(reminder.scheduledFor)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                                <BellIcon className="h-4 w-4" />
                                                                <span>{reminder.notificationPreference} notifications</span>
                                                            </div>
                                                        </div>

                                                        {/* Metadata */}
                                                        {reminder.metadata && (
                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                {reminder.metadata.medicationName && (
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">Medication:</span> {reminder.metadata.medicationName}
                                                                    </p>
                                                                )}
                                                                {reminder.metadata.dosage && (
                                                                    <p className="text-sm mt-1">
                                                                        <span className="font-medium">Dosage:</span> {reminder.metadata.dosage}
                                                                    </p>
                                                                )}
                                                                {reminder.metadata.doctorName && (
                                                                    <p className="text-sm mt-1">
                                                                        <span className="font-medium">Doctor:</span> {reminder.metadata.doctorName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleStatusChange(reminder._id, 'Completed')}
                                                        className="p-1 text-green-600 hover:text-green-800"
                                                        title="Mark as completed"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(reminder)}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                        title="Edit reminder"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(reminder._id)}
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                        title="Delete reminder"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Reminders */}
                        {pastReminders.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Reminders</h2>
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Reminder
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {pastReminders.map((reminder) => (
                                                    <tr key={reminder._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="text-lg mr-3">
                                                                    {getReminderIcon(reminder.type)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {reminder.title}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {reminder.type}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDateTime(reminder.scheduledFor)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status)}`}>
                                                                {reminder.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(reminder)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(reminder._id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reminders.length === 0 && (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
                                <p className="text-gray-600 mb-6">Create your first reminder to stay on top of your health</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                                >
                                    Create First Reminder
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Form & Stats */}
                    <div className="space-y-6">
                        {/* Reminder Form */}
                        {showForm && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingReminder(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        >
                                            <option value="Medication">Medication</option>
                                            <option value="Appointment">Appointment</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Test">Test</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="e.g., Take morning medication"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows="2"
                                            placeholder="Additional details..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="scheduledFor"
                                            value={formData.scheduledFor}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recurrence
                                        </label>
                                        <select
                                            name="recurrence"
                                            value={formData.recurrence}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="Once">Once</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>

                                    {/* Medication-specific fields */}
                                    {formData.type === 'Medication' && (
                                        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900">Medication Details</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medication Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="metadata.medicationName"
                                                    value={formData.metadata.medicationName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dosage
                                                </label>
                                                <input
                                                    type="text"
                                                    name="metadata.dosage"
                                                    value={formData.metadata.dosage}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="e.g., 500mg"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment-specific fields */}
                                    {formData.type === 'Appointment' && (
                                        <div className="space-y-3 p-3 bg-green-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900">Appointment Details</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Doctor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="metadata.doctorName"
                                                    value={formData.metadata.doctorName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    name="metadata.location"
                                                    value={formData.metadata.location}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="e.g., City Hospital, Room 302"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notification Preference
                                        </label>
                                        <select
                                            name="notificationPreference"
                                            value={formData.notificationPreference}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                                            <option value="SMS">SMS Text Message</option>
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                                        >
                                            {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Reminder Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Reminders</span>
                                    <span className="font-semibold">{reminders.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Upcoming</span>
                                    <span className="font-semibold text-blue-600">{upcomingReminders.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Completed</span>
                                    <span className="font-semibold text-green-600">
                                        {reminders.filter(r => r.status === 'Completed').length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Reminder Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• Set reminders 15 minutes before appointments</li>
                                <li>• Use recurring reminders for daily medications</li>
                                <li>• Add location details for appointments</li>
                                <li>• Include dosage instructions for medications</li>
                                <li>• Review and update reminders weekly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reminders;