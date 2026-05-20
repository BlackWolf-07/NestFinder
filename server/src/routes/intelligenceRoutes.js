const express = require(\"express\");
const router = express.Router();
const { getLocationIntelligence } = require(\"../controllers/intelligenceController\");

router.get(\"/\", getLocationIntelligence);

module.exports = router;
