import React, { useState, useEffect } from 'react';
import { recordsAPI } from '../utils/api';
import {
    DocumentArrowUpIcon,
    FolderIcon,
    CalendarIcon,
    TagIcon,
    EyeIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const MedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: '',
        dateOfRecord: '',
        tags: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await recordsAPI.getRecords();
            setRecords(response.data.records || []);
        } catch (error) {
            console.error('Fetch records error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            if (!uploadForm.title) {
                setUploadForm(prev => ({ ...prev, title: file.name }));
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('category', uploadForm.category);
            formData.append('dateOfRecord', uploadForm.dateOfRecord);
            formData.append('tags', uploadForm.tags);

            await recordsAPI.uploadRecord(formData);
            
            // Reset form
            setUploadForm({
                title: '',
                description: '',
                category: '',
                dateOfRecord: '',
                tags: ''
            });
            setSelectedFile(null);
            setShowUpload(false);
            
            // Refresh records
            await fetchRecords();
            
            alert('Medical record uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            const serverMessage = error.response?.data?.error || error.response?.data?.details || error.message;
            alert('Error uploading file: ' + serverMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            await recordsAPI.deleteRecord(recordId);
            await fetchRecords();
            alert('Record deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting record');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const categories = [
        'Prescription',
        'Lab Report',
        'Doctor Note',
        'Scan Report',
        'Vaccination',
        'Other'
    ];

    const filteredRecords = records.filter(record => {
        const matchesSearch = searchTerm === '' || 
            record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || record.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                        <p className="mt-2 text-gray-600">Securely store and organize your medical documents</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <DocumentArrowUpIcon className="h-5 w-5" />
                        <span>Upload Record</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <div className="text-sm text-gray-600 flex items-center">
                            <FolderIcon className="h-5 w-5 mr-2" />
                            <span>{filteredRecords.length} records found</span>
                        </div>
                    </div>
                </div>

                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Upload Medical Record</h3>
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleUpload} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select File (PDF, Images)
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                        <span>Choose a file</span>
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={handleFileSelect}
                                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PDF, JPG, PNG up to 10MB
                                                </p>
                                                {selectedFile && (
                                                    <p className="text-sm text-gray-900 mt-2">
                                                        Selected: {selectedFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={uploadForm.description}
                                            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category *
                                            </label>
                                            <select
                                                value={uploadForm.category}
                                                onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Record
                                            </label>
                                            <input
                                                type="date"
                                                value={uploadForm.dateOfRecord}
                                                onChange={(e) => setUploadForm({...uploadForm, dateOfRecord: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadForm.tags}
                                            onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="e.g., blood test, annual checkup, cardiology"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpload(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Record'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Records Grid */}
                {filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No medical records found</h3>
                        <p className="text-gray-600 mb-6">Upload your first medical document to get started</p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                        >
                            Upload First Record
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecords.map((record) => (
                            <div key={record._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                                record.category === 'Prescription' 
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : record.category === 'Lab Report'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {record.category}
                                            </span>
                                            <h3 className="mt-2 font-semibold text-gray-900 line-clamp-1">
                                                {record.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {record.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {record.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>
                                                {new Date(record.dateOfRecord).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>{formatFileSize(record.fileSize)}</span>
                                            <a
                                                href={record.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                <span>View</span>
                                            </a>
                                        </div>
                                    </div>

                                    {record.tags && record.tags.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex flex-wrap gap-1">
                                                {record.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        <TagIcon className="h-3 w-3 mr-1" />
                                                        {tag}
                                                    </span>
                                                ))}
                                                {record.tags.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{record.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Security Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                        <ShieldCheckIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Security & Privacy</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• All files are encrypted during transfer and storage</li>
                                <li>• Only you have access to your complete medical records</li>
                                <li>• Emergency responders can only see critical information you've approved</li>
                                <li>• All access is logged and monitored</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecords;