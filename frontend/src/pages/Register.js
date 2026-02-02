import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authAPI } from '../utils/api';
import {
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    PhoneIcon,
    CalendarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: ''
    });

    // Quick runtime check: avoid hitting Firebase with placeholder keys
    const isFirebaseApiKeySet = !!process.env.REACT_APP_FIREBASE_API_KEY && !process.env.REACT_APP_FIREBASE_API_KEY.includes('your-');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    // Strict email validation helper (checks structure, label lengths and TLD length)
    const isValidEmailStrict = (email) => {
        if (!email || typeof email !== 'string') return false;
        const e = email.trim();
        if (e.length > 254) return false; // practical upper limit
        if (e.includes(' ')) return false;

        const parts = e.split('@');
        if (parts.length !== 2) return false;

        const [local, domain] = parts;
        if (!local || !domain) return false;
        if (local.length > 64) return false;

        // local part basic char check (simplified RFC-safe subset)
        if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;

        // domain checks
        const domainParts = domain.toLowerCase().split('.');
        if (domainParts.some(p => !p || p.length > 63)) return false;

        const tld = domainParts[domainParts.length - 1];
        if (!/^[a-z]{2,6}$/.test(tld)) return false; // require 2-6 letter TLD

        if (!/^[A-Za-z0-9.-]+$/.test(domain)) return false;

        return true;
    };

    const validateStep1 = () => {
        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        if (!isValidEmailStrict(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password) {
            setError('Please enter a password');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    // Validate optional fields presented in step 2 before submit
    const validateStep2 = () => {
        if (formData.phone && formData.phone.trim()) {
            // Extract digits and require exactly 10 digits
            const digits = (formData.phone || '').replace(/\D/g, '');
            if (digits.length !== 10) {
                setError('Phone number must contain exactly 10 digits');
                return false;
            }
        }

        if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
            const dob = new Date(formData.dateOfBirth);
            const today = new Date();
            // Normalize time portion to compare dates only
            const dobDate = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (dobDate > todayDate) {
                setError('Date of birth cannot be in the future');
                return false;
            }
        }

        // All good
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep1()) {
            return;
        }

        // Validate step 2 fields (phone, date of birth) before submitting
        if (!validateStep2()) {
            return;
        }

        if (!isFirebaseApiKeySet) {
            setError('Firebase API key is not configured. Set REACT_APP_FIREBASE_API_KEY in frontend/.env and restart the dev server.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const firebaseUid = userCredential.user.uid;
            const token = await userCredential.user.getIdToken();

            // Register user in our database
            await authAPI.register({
                firebaseUid,
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined
            });

            // Store token
            localStorage.setItem('token', token);

            setSuccess('Account created successfully! Setting up your health vault...');

            // Redirect to dashboard after short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);

            if (error?.message && error.message.includes('api-key-not-valid')) {
                setError('Firebase API key is invalid or not configured. Update REACT_APP_FIREBASE_API_KEY in frontend/.env and restart the dev server.');
            } else if (error?.message && error.message.includes('configuration-not-found')) {
                setError('Firebase Authentication is not configured for this project. Open the Firebase Console → Authentication → Sign-in method and enable Email/Password sign-in (also add `localhost`/your domain to Authorized domains).');
            } else {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        setError('An account with this email already exists');
                        break;
                    case 'auth/invalid-email':
                        setError('Invalid email address');
                        break;
                    case 'auth/operation-not-allowed':
                        setError('Email/password accounts are not enabled');
                        break;
                    case 'auth/weak-password':
                        setError('Password is too weak');
                        break;
                    default:
                        setError('Failed to create account. Please try again');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    const getStrengthColor = (strength) => {
        if (strength < 50) return 'bg-red-500';
        if (strength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center">
                            <ShieldCheckIcon className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Create Your Smart Health Vault
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Secure your emergency health information in minutes. Take control of your medical data.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <span className="mt-2 text-sm font-medium">Account</span>
                        </div>
                        <div className="flex-1 h-1 mx-4 bg-gray-200">
                            <div className={`h-full transition-all duration-300 ${
                                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                            }`}></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                <CheckCircleIcon className="h-5 w-5" />
                            </div>
                            <span className="mt-2 text-sm font-medium">Complete</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Benefits */}
                        <div className="md:w-2/5 bg-gradient-to-b from-blue-600 to-indigo-700 p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6">Why You Need a Health Vault</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ShieldCheckIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Emergency-First Design</h3>
                                        <p className="text-sm text-blue-100 mt-1">
                                            Critical health information accessible instantly by first responders
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Privacy Control</h3>
                                        <p className="text-sm text-blue-100 mt-1">
                                            You decide exactly what information is visible in emergencies
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Complete Medical Management</h3>
                                        <p className="text-sm text-blue-100 mt-1">
                                            Store records, set reminders, and get wellness guidance
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Quick Setup</h3>
                                        <p className="text-sm text-blue-100 mt-1">
                                            Get your emergency profile ready in under 5 minutes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-blue-500">
                                <p className="text-sm text-blue-200">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold text-white hover:text-blue-100">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Registration Form */}
                        <div className="md:w-3/5 p-8">
                            {success ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{success}</h3>
                                    <p className="text-gray-600">
                                        Redirecting you to your dashboard...
                                    </p>
                                    <div className="mt-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="John Doe"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="block w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                
                                                {/* Password Strength Meter */}
                                                {formData.password && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>Password strength</span>
                                                            <span>{passwordStrength(formData.password)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${getStrengthColor(passwordStrength(formData.password))}`}
                                                                style={{ width: `${passwordStrength(formData.password)}%` }}
                                                            ></div>
                                                        </div>
                                                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                                                            <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                                                                {formData.password.length >= 8 ? '✓' : '•'} At least 8 characters
                                                            </li>
                                                            <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                                                {/[A-Z]/.test(formData.password) ? '✓' : '•'} One uppercase letter
                                                            </li>
                                                            <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                                                {/[0-9]/.test(formData.password) ? '✓' : '•'} One number
                                                            </li>
                                                            <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                                                {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '•'} One special character
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirm Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className={`block w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                                ? 'border-red-300'
                                                                : 'border-gray-300'
                                                        }`}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                                                )}
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Continue to Additional Details
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number (Optional)
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="(123) 456-7890"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Used for emergency contact and reminders
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Date of Birth (Optional)
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="dateOfBirth"
                                                        value={formData.dateOfBirth}
                                                        onChange={handleChange}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Helps provide age-appropriate health guidance
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800">Your Data is Protected</p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            We use bank-level encryption to secure your health information. 
                                                            Your data will never be shared without your explicit permission.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="terms"
                                                    name="terms"
                                                    type="checkbox"
                                                    required
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                                    I agree to the{' '}
                                                    <a href="/terms" className="text-blue-600 hover:text-blue-500">
                                                        Terms of Service
                                                    </a>{' '}
                                                    and{' '}
                                                    <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                                                        Privacy Policy
                                                    </a>
                                                </label>
                                            </div>

                                            <div className="flex space-x-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center justify-center">
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Creating Account...
                                                        </span>
                                                    ) : (
                                                        'Create Account'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-center text-sm text-gray-500">
                                            Already have an account?{' '}
                                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                                Sign in here
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
                 </div>
                  </div>

    );
};

export default Register;