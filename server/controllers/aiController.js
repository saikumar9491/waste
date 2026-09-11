const aiService = require('../services/aiService');

// @desc AI image validation and classification
// @route POST /api/ai/classify
const classify = async (req, res) => {
  try {
    const { description } = req.body;
    let imageLocalPath = req.file ? req.file.path : '';
    const originalFilename = req.file ? req.file.originalname : '';
    const result = await aiService.analyzeImage(imageLocalPath, originalFilename, description);
    res.json({
      success: true,
      wasteDetected: result.wasteDetected,
      wasteType: result.wasteType,
      confidence: result.confidence,
      description: result.description,
      priority: result.priority,
      priorityReason: result.priorityReason,
      engine: result.engine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Standalone AI priority prediction
// @route POST /api/ai/priority
const predictPriority = async (req, res) => {
  try {
    const { wasteType, description, address, confidence } = req.body;
    const result = aiService.predictPriority({ wasteType, description, address, confidence });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Standalone AI summary generation
// @route POST /api/ai/summarize
const summarize = async (req, res) => {
  try {
    const { description, address } = req.body;
    const summary = aiService.generateSummary(description, address);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  classify,
  predictPriority,
  summarize
};
