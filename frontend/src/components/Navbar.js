import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import {
    HomeIcon,
    QrCodeIcon,
    FolderIcon,
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
        { name: 'Emergency Card', path: '/emergency', icon: QrCodeIcon },
        { name: 'Medical Records', path: '/records', icon: FolderIcon },
        { name: 'Privacy Controls', path: '/privacy', icon: ShieldCheckIcon },
        { name: 'Chat Assistant', path: '/chat', icon: ChatBubbleLeftRightIcon },
        { name: 'Reminders', path: '/reminders', icon: BellIcon },
        { name: 'Profile', path: '/profile', icon: UserCircleIcon },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-white md:shadow">
                <div className="flex flex-col h-full">
                    <div className="flex items-center px-6 py-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheckIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-blue-600">Health Vault</span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 py-6">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                            isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4 mr-3" />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    <div className="px-4 pb-6">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Nav */}
<nav className="md:hidden bg-white shadow-lg">
    <div className="w-full px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">

            {/* LEFT: MENU BUTTON */}
            <div className="flex items-center">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* CENTER: LOGO */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-blue-600">Health Vault</span>
            </div>

        </div>
    </div>

    {/* DROPDOWN MENU */}
    {isMenuOpen && (
        <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}

                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )}
</nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80">
                        <h2 className="text-lg font-semibold text-gray-900">Confirm Logout</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Are you sure you want to logout?
                        </p>

                        <div className="mt-5 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await signOut(auth);
                                        setShowLogoutModal(false);
                                        navigate('/login');
                                    } catch (error) {
                                        console.error('Logout error:', error);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;