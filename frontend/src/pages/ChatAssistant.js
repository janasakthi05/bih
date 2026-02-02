import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../utils/api';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    UserCircleIcon,
    ArrowPathIcon,
    LightBulbIcon,
    HeartIcon,
    MoonIcon,
    BeakerIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatIntro, setChatIntro] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchChatIntro();
        // Add welcome message
        setMessages([{
            type: 'bot',
            text: "Hello! I'm your Wellness Assistant. How can I help you today?",
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatIntro = async () => {
        try {
            const response = await chatAPI.getIntro();
            setChatIntro(response.data);
        } catch (error) {
            console.error('Fetch chat intro error:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        // Get bot response
        try {
            setLoading(true);
            const response = await chatAPI.sendMessage(userMessage);
            
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response.data.response,
                category: response.data.category,
                timestamp: new Date(response.data.timestamp)
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "I'm having trouble responding right now. Please try again in a moment.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        setInput(question);
    };

    const quickQuestions = [
        {
            question: "I'm feeling stressed",
            icon: LightBulbIcon,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            question: "Tips for better sleep",
            icon: MoonIcon,
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            question: "How to stay hydrated",
            icon: BeakerIcon,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            question: "Exercise recommendations",
            icon: HeartIcon,
            color: 'bg-red-100 text-red-600'
        }
    ];

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Wellness Assistant</h1>
                            <p className="mt-2 text-gray-600">
                                Get general wellness tips and lifestyle guidance
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer Banner */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Important Disclaimer</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    I am a wellness assistant providing general information only. I cannot provide 
                                    medical advice, diagnosis, or treatment recommendations. Please consult healthcare 
                                    professionals for medical concerns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chat Container */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Wellness Assistant</h3>
                                            <p className="text-xs text-gray-500">Online • General wellness guidance</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setMessages([{
                                            type: 'bot',
                                            text: "Hello! I'm your Wellness Assistant. How can I help you today?",
                                            timestamp: new Date()
                                        }])}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <ArrowPathIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-lg p-4 ${
                                            msg.type === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}>
                                            <div className="flex items-start space-x-2">
                                                {msg.type === 'bot' && (
                                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                    <p className={`text-xs mt-2 ${
                                                        msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                                                    }`}>
                                                        {formatTime(msg.timestamp)}
                                                    </p>
                                                </div>
                                                {msg.type === 'user' && (
                                                    <UserCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-pulse flex space-x-1">
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                </div>
                                                <span className="text-sm text-gray-500">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Questions */}
                            <div className="px-4 py-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickQuestions.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickQuestion(item.question)}
                                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${item.color} hover:opacity-90`}
                                        >
                                            <item.icon className="h-3 w-3" />
                                            <span>{item.question}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-200 p-4">
                                <form onSubmit={handleSend} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your wellness question here..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Chat Info & Topics */}
                    <div className="space-y-6">
                        {/* Capabilities */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">What I Can Help With</h3>
                            <div className="space-y-3">
                                {chatIntro?.capabilities?.map((capability, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-700">{capability}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wellness Topics */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Popular Wellness Topics</h3>
                            <div className="space-y-3">
                                <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                                    <div className="flex items-center space-x-2">
                                        <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-gray-900">Stress Management</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Breathing exercises, mindfulness, coping strategies
                                    </p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                                    <div className="flex items-center space-x-2">
                                        <MoonIcon className="h-4 w-4 text-indigo-500" />
                                        <span className="text-sm font-medium text-gray-900">Sleep Hygiene</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Sleep schedules, bedtime routines, sleep environment
                                    </p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                                    <div className="flex items-center space-x-2">
                                        <HeartIcon className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium text-gray-900">Physical Activity</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Exercise recommendations, staying active, fitness tips
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Wellness Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• Drink water first thing in the morning</li>
                                <li>• Take short breaks during work</li>
                                <li>• Practice gratitude daily</li>
                                <li>• Get sunlight exposure in the morning</li>
                                <li>• Maintain social connections</li>
                            </ul>
                        </div>

                        {/* Reminder */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Emergency Note</p>
                                    <p className="text-xs text-red-700 mt-1">
                                        For medical emergencies, call your local emergency number immediately. 
                                        Do not rely on this chatbot for emergency medical advice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;