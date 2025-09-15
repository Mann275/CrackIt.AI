const UserGoals = require('../models/UserGoals');

function getUserGoals(req, res) {
  UserGoals.findOne({ user: req.user.id })
    .then(goals => res.json(goals || { goals: [] }))
    .catch(err => {
      console.error('Get goals error:', err);
      res.status(500).json({ message: 'Server Error' });
    });
}

function updateUserGoals(req, res) {
  const { targetCompany, domain, currentTechStack, expectedLPA } = req.body;
  
  if (!targetCompany || !domain || !expectedLPA) {
    return res.status(400).json({ 
      message: 'Missing required fields' 
    });
  }

  const update = {
    targetCompany,
    domain,
    currentTechStack,
    expectedLPA
  };

  UserGoals.findOneAndUpdate(
    { user: req.user.id },
    { $set: update },
    { new: true, upsert: true }
  )
    .then(goals => res.json(goals))
    .catch(err => {
      console.error('Update goals error:', err);
      res.status(500).json({ message: 'Server Error' });
    });
}

module.exports = {
  getUserGoals,
  updateUserGoals
};