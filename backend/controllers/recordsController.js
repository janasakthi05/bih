const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { uploadToFirebase } = require('../utils/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

const uploadMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.uid;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Find user
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Upload file (Cloudinary if configured, otherwise Firebase Storage)
        let uploadResult;
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            uploadResult = await uploadToCloudinary(file);
        } else {
            uploadResult = await uploadToFirebase(file, user._id);
        }

        // Create medical record entry
        const medicalRecord = new MedicalRecord({
            userId: user._id,
            title: req.body.title || file.originalname,
            description: req.body.description,
            category: req.body.category || 'Other',
            fileUrl: uploadResult.url,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.size,
            fileType: uploadResult.type,
            dateOfRecord: req.body.dateOfRecord ? new Date(req.body.dateOfRecord) : new Date(),
            tags: req.body.tags ? req.body.tags.split(',') : []
        });

        await medicalRecord.save();

        res.status(201).json({
            message: 'Medical record uploaded successfully',
            record: medicalRecord
        });
    } catch (error) {
        console.error('Upload error:', error);
        const payload = { error: 'Internal server error' };
        if (process.env.NODE_ENV === 'development') {
            payload.details = error.message;
        }
        res.status(500).json(payload);
    }
};

const getMedicalRecords = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { category, startDate, endDate, tag } = req.query;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build query
        const query = { userId: user._id };

        if (category) {
            query.category = category;
        }

        if (startDate || endDate) {
            query.dateOfRecord = {};
            if (startDate) query.dateOfRecord.$gte = new Date(startDate);
            if (endDate) query.dateOfRecord.$lte = new Date(endDate);
        }

        if (tag) {
            query.tags = tag;
        }

        // Get records with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const records = await MedicalRecord.find(query)
            .sort({ dateOfRecord: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalRecord.countDocuments(query);

        res.json({
            records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { recordId } = req.params;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const record = await MedicalRecord.findOneAndDelete({
            _id: recordId,
            userId: user._id
        });

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        // TODO: Delete file from Firebase Storage

        res.json({
            message: 'Medical record deleted successfully'
        });
    } catch (error) {
        console.error('Delete record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { recordId } = req.params;
        const updates = req.body;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const record = await MedicalRecord.findOneAndUpdate(
            {
                _id: recordId,
                userId: user._id
            },
            {
                $set: { ...updates, updatedAt: new Date() }
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({
            message: 'Record updated successfully',
            record
        });
    } catch (error) {
        console.error('Update record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    uploadMedicalRecord,
    getMedicalRecords,
    deleteMedicalRecord,
    updateMedicalRecord
};