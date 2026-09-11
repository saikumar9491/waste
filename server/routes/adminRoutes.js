const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getHotspots, registerDriver, deleteDriver } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/hotspots', protect, authorize('admin'), getHotspots);
router.post('/drivers', protect, authorize('admin'), registerDriver);
router.delete('/drivers/:id', protect, authorize('admin'), deleteDriver);

module.exports = router;
