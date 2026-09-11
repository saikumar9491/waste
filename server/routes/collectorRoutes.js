const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  updateTaskStatus,
  uploadCollectionProof,
  getAllCollectors,
  getDriverTracking,
  updateCollectorLocation
} = require('../controllers/collectorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getAllCollectors);
router.get('/tracking', protect, authorize('admin'), getDriverTracking);
router.get('/tasks', protect, authorize('collector', 'admin'), getMyTasks);
router.put('/tasks/:id/status', protect, authorize('collector', 'admin'), updateTaskStatus);
router.post('/tasks/:id/proof', protect, authorize('collector', 'admin'), upload.single('proofImage'), uploadCollectionProof);
router.put('/:id/location', protect, authorize('collector', 'admin'), updateCollectorLocation);

module.exports = router;
