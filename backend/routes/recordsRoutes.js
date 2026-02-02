const express = require('express');
const router = express.Router();
const {
    uploadMedicalRecord,
    getMedicalRecords,
    deleteMedicalRecord,
    updateMedicalRecord
} = require('../controllers/recordsController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { upload } = require('../utils/upload');

// Protected routes
router.post('/upload', 
    verifyFirebaseToken,
    upload.single('file'),
    uploadMedicalRecord
);

router.get('/', verifyFirebaseToken, getMedicalRecords);
router.put('/:recordId', verifyFirebaseToken, updateMedicalRecord);
router.delete('/:recordId', verifyFirebaseToken, deleteMedicalRecord);

module.exports = router;