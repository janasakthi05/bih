// Rule-based wellness chatbot
const wellnessResponses = {
    // Stress-related keywords
    stress: [
        "Stress is normal, but it's important to manage it. Try deep breathing exercises: inhale for 4 seconds, hold for 7, exhale for 8.",
        "Regular physical activity can help reduce stress. Even a 10-minute walk can make a difference.",
        "Consider mindfulness meditation - just 5 minutes a day can help calm your mind."
    ],
    
    // Tiredness/fatigue
    tired: [
        "Fatigue can be a sign of dehydration. Make sure you're drinking enough water throughout the day.",
        "Consider your sleep quality. Adults typically need 7-9 hours of quality sleep each night.",
        "Iron-rich foods like spinach, lentils, and lean meats can help combat fatigue."
    ],
    
    // Sleep issues
    sleep: [
        "Maintain a consistent sleep schedule, even on weekends. This helps regulate your body's internal clock.",
        "Create a relaxing bedtime routine - avoid screens for at least an hour before bed.",
        "Make sure your bedroom is cool, dark, and quiet for optimal sleep conditions."
    ],
    
    // Hydration
    hydration: [
        "Aim for 8 glasses of water daily, but your needs may vary based on activity level and climate.",
        "If you struggle to drink enough water, try adding slices of lemon, cucumber, or berries for flavor.",
        "Remember that fruits and vegetables also contribute to your daily hydration needs."
    ],
    
    // General wellness
    general: [
        "A balanced diet with plenty of fruits, vegetables, and whole grains supports overall health.",
        "Regular check-ups are important for preventive care. Don't skip your annual physical.",
        "Social connections are vital for mental wellness. Make time for friends and family."
    ],
    
    // Exercise
    exercise: [
        "The World Health Organization recommends 150 minutes of moderate exercise per week.",
        "Find activities you enjoy - you're more likely to stick with exercise if it's fun for you.",
        "Remember to warm up before exercise and cool down afterward to prevent injury."
    ],
    
    // Mental health
    mental: [
        "It's okay to ask for help when you need it. Talking to someone can make a big difference.",
        "Practice gratitude by noting three things you're thankful for each day.",
        "Set realistic goals and celebrate small achievements along the way."
    ]
};

const wellnessChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.uid;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Valid message required' });
        }

        const lowercaseMessage = message.toLowerCase();
        let response = null;
        let matchedCategory = 'general';

        // Check for keywords and select appropriate response
        const keywordMapping = [
            { keywords: ['stress', 'anxious', 'overwhelmed', 'pressure'], category: 'stress' },
            { keywords: ['tired', 'fatigue', 'exhausted', 'low energy'], category: 'tired' },
            { keywords: ['sleep', 'insomnia', 'sleepless', 'restless'], category: 'sleep' },
            { keywords: ['hydration', 'water', 'dehydrated', 'thirsty'], category: 'hydration' },
            { keywords: ['exercise', 'workout', 'fitness', 'active'], category: 'exercise' },
            { keywords: ['mental', 'depress', 'anxiety', 'mood', 'emotional'], category: 'mental' }
        ];

        for (const mapping of keywordMapping) {
            if (mapping.keywords.some(keyword => lowercaseMessage.includes(keyword))) {
                matchedCategory = mapping.category;
                break;
            }
        }

        // Select a random response from the category
        const categoryResponses = wellnessResponses[matchedCategory];
        response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

        // Add a disclaimer
        const disclaimer = "\n\n⚠️ **Disclaimer:** I am a wellness assistant providing general information only. I cannot provide medical advice. Please consult with a healthcare professional for medical concerns.";

        res.json({
            response: response + disclaimer,
            category: matchedCategory,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get chatbot introduction
const getChatbotIntro = (req, res) => {
    const intro = {
        message: "Hello! I'm your Wellness Assistant. I can provide general wellness tips about stress, sleep, hydration, exercise, and mental health. What would you like to talk about today?",
        capabilities: [
            "General wellness and lifestyle tips",
            "Stress management techniques",
            "Sleep improvement suggestions",
            "Hydration reminders",
            "Exercise recommendations",
            "Mental wellness guidance"
        ],
        disclaimer: "⚠️ IMPORTANT: I cannot provide medical advice, diagnosis, or treatment recommendations. Please consult healthcare professionals for medical concerns."
    };

    res.json(intro);
};

module.exports = { wellnessChatbot, getChatbotIntro };