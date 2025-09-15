const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const SkillSurvey = require('../models/SkillSurvey');

// @route   GET api/survey
// @desc    Get user's skill survey
// @access  Private
router.get('/', auth, function(req, res) {
  SkillSurvey.findOne({ user: req.user.id })
    .then(survey => res.json(survey))
    .catch(err => res.status(500).send('Server Error'));
});

// @route   POST api/survey
// @desc    Create or update skill survey
// @access  Private
router.post('/', auth, function(req, res) {
  const { dsaTopics, coreSubjects, developmentExperience } = req.body;
  
  SkillSurvey.findOneAndUpdate(
    { user: req.user.id },
    { 
      $set: {
        dsaTopics,
        coreSubjects,
        developmentExperience,
        lastUpdated: Date.now()
      }
    },
    { new: true, upsert: true }
  )
    .then(survey => res.json(survey))
    .catch(err => res.status(500).send('Server Error'));
});

// @route   GET api/survey/stats
// @desc    Get survey statistics
// @access  Private
router.get('/stats', auth, function(req, res) {
  SkillSurvey.findOne({ user: req.user.id })
    .then(survey => {
      if (!survey) {
        return res.json({
          averageConfidence: 0,
          strongestAreas: [],
          weakestAreas: [],
          completionStatus: 0
        });
      }

      const allConfidences = [
        ...survey.dsaTopics.map(t => t.confidenceLevel),
        ...survey.coreSubjects.map(s => s.confidenceLevel),
        ...survey.developmentExperience.map(d => d.confidenceLevel)
      ];

      const stats = {
        averageConfidence: allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length,
        strongestAreas: [],
        weakestAreas: [],
        completionStatus: 0
      };

      res.json(stats);
    })
    .catch(err => res.status(500).send('Server Error'));
});

module.exports = router;