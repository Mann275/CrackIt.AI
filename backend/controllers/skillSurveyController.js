const SkillSurvey = require('../models/SkillSurvey');

// Get user's skill survey
const getUserSkillSurvey = async (req, res) => {
  try {
    const survey = await SkillSurvey.findOne({ user: req.user.id });
    res.json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create or update skill survey
const updateSkillSurvey = async (req, res) => {
  const { dsaTopics, coreSubjects, developmentExperience } = req.body;

  try {
    let survey = await SkillSurvey.findOne({ user: req.user.id });

    if (survey) {
      // Update existing survey
      survey = await SkillSurvey.findOneAndUpdate(
        { user: req.user.id },
        {
          $set: {
            dsaTopics,
            coreSubjects,
            developmentExperience,
            lastUpdated: Date.now()
          }
        },
        { new: true }
      );
    } else {
      // Create new survey
      survey = new SkillSurvey({
        user: req.user.id,
        dsaTopics,
        coreSubjects,
        developmentExperience
      });
      await survey.save();
    }

    res.json(survey);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get survey statistics
const getSurveyStats = async (req, res) => {
  try {
    const survey = await SkillSurvey.findOne({ user: req.user.id });
    
    if (!survey) {
      return res.json({
        averageConfidence: 0,
        strongestAreas: [],
        weakestAreas: [],
        completionStatus: 0
      });
    }

    // Calculate average confidence across all areas
    const allConfidences = [
      ...survey.dsaTopics.map(t => t.confidenceLevel),
      ...survey.coreSubjects.map(s => s.confidenceLevel),
      ...survey.developmentExperience.map(d => d.confidenceLevel)
    ];

    const averageConfidence = allConfidences.length > 0
      ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length
      : 0;

    // Find strongest and weakest areas
    const allAreas = [
      ...survey.dsaTopics.map(t => ({ name: t.name, confidence: t.confidenceLevel, type: 'DSA' })),
      ...survey.coreSubjects.map(s => ({ name: s.name, confidence: s.confidenceLevel, type: 'Core' })),
      ...survey.developmentExperience.map(d => ({ name: d.area, confidence: d.confidenceLevel, type: 'Dev' }))
    ];

    const sortedAreas = [...allAreas].sort((a, b) => b.confidence - a.confidence);
    const strongestAreas = sortedAreas.slice(0, 3);
    const weakestAreas = sortedAreas.slice(-3).reverse();

    // Calculate completion status
    const expectedTopics = {
      dsa: 13, // Number of DSA topics in schema validation
      core: 6, // Number of core subjects in schema validation
      dev: 8   // Number of development areas in schema validation
    };

    const completionStatus = (
      (survey.dsaTopics.length / expectedTopics.dsa +
      survey.coreSubjects.length / expectedTopics.core +
      survey.developmentExperience.length / expectedTopics.dev) / 3
    ) * 100;

    res.json({
      averageConfidence,
      strongestAreas,
      weakestAreas,
      completionStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserSkillSurvey,
  updateSkillSurvey,
  getSurveyStats
};