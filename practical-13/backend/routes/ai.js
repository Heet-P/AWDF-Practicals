const express = require('express');
const requireJson = require('../middleware/requireJson');
const aiRateLimit = require('../middleware/aiRateLimit');
const { suggest } = require('../controllers/aiController');

const router = express.Router();

// Mounted behind the auth middleware in app.js, so only logged-in users can spend API quota
router.post('/suggest', requireJson, aiRateLimit, suggest);

module.exports = router;
