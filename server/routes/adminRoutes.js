const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getHotspots } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/hotspots', protect, authorize('admin'), getHotspots);

module.exports = router;
