const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#1a56db',
                light: '#ffffff'
            }
        });
        return qrCodeDataURL;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw error;
    }
};

const generateEmergencyQRData = (hash, baseUrl) => {
    return {
        url: `${baseUrl}/emergency/${hash}`,
        timestamp: new Date().toISOString(),
        type: 'emergency_health_profile'
    };
};

module.exports = { generateQRCode, generateEmergencyQRData };