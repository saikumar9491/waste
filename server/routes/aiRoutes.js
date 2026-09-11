const express = require('express');
const router = express.Router();
const { classify, predictPriority, summarize } = require('../controllers/aiController');
const upload = require('../middleware/uploadMiddleware');

router.post('/classify', upload.single('image'), classify);
router.post('/priority', predictPriority);
router.post('/summarize', summarize);

module.exports = router;
