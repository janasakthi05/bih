const isConfigured = !!process.env.CLOUDINARY_CLOUD_NAME;

let uploadToCloudinary = () => Promise.reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME in backend/.env and install the `cloudinary` & `streamifier` packages (npm install cloudinary streamifier).'));

if (isConfigured) {
    let cloudinary, streamifier;
    try {
        cloudinary = require('cloudinary').v2;
        streamifier = require('streamifier');
    } catch (err) {
        // If packages are missing, provide a helpful error when used
        uploadToCloudinary = () => Promise.reject(new Error('Cloudinary packages are not installed. Run `npm install cloudinary streamifier` in the backend folder.'));
    }

    if (cloudinary && streamifier) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        uploadToCloudinary = (file, folder = 'medical-records') => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        fileName: file.originalname,
                        size: file.size,
                        type: file.mimetype
                    });
                });

                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        };
    }
}

module.exports = { uploadToCloudinary, isConfigured };