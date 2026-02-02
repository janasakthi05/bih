const multer = require('multer');
const { bucket } = require('../config/firebaseAdmin');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = /pdf|jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'));
        }
    }
});

// Upload file to Firebase Storage
const uploadToFirebase = async (file, userId) => {
    if (!bucket || !bucket.name) {
        throw new Error('Firebase Storage bucket is not configured. Check FIREBASE_STORAGE_BUCKET in backend/.env');
    }

    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.originalname}`;
    const fileUpload = bucket.file(`medical-records/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
            console.error('Blob stream error:', error);
            reject(error);
        });

        blobStream.on('finish', async () => {
            try {
                // Attempt to make the file public
                await fileUpload.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
                resolve({
                    url: publicUrl,
                    fileName: file.originalname,
                    size: file.size,
                    type: file.mimetype
                });
            } catch (err) {
                console.warn('Could not make file public, trying signed URL fallback:', err.message);
                try {
                    const [signedUrl] = await fileUpload.getSignedUrl({ action: 'read', expires: '03-01-2500' });
                    resolve({
                        url: signedUrl,
                        fileName: file.originalname,
                        size: file.size,
                        type: file.mimetype
                    });
                } catch (err2) {
                    console.error('Signed URL generation failed:', err2);
                    reject(err2);
                }
            }
        });

        blobStream.end(file.buffer);
    });
};

module.exports = { upload, uploadToFirebase };