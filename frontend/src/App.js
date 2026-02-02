import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmergencyCard from './pages/EmergencyCard';
import EmergencyPublicView from './pages/EmergencyPublicView';
import MedicalRecords from './pages/MedicalRecords';
import PrivacyControls from './pages/PrivacyControls';
import ChatAssistant from './pages/ChatAssistant';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/emergency/:hash" element={<EmergencyPublicView />} />
                        
                        {/* Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <Dashboard />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/emergency" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <EmergencyCard />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/records" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <MedicalRecords />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/privacy" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <PrivacyControls />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/chat" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <ChatAssistant />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/reminders" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <Reminders />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <div className="md:pl-64">
                                        <Profile />
                                    </div>
                                </>
                            </ProtectedRoute>
                        } />
                        
                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;