const UserGoals = require('../models/UserGoals');

// Get user goals
const getUserGoals = async (req, res) => {
  try {
    const goals = await UserGoals.findOne({ user: req.user.id });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create or update user goals
const updateUserGoals = async (req, res) => {
  const { targetCompany, domain, currentTechStack, expectedLPA } = req.body;

  try {
    let goals = await UserGoals.findOne({ user: req.user.id });

    if (goals) {
      // Update existing goals
      goals = await UserGoals.findOneAndUpdate(
        { user: req.user.id },
        {
          $set: {
            targetCompany,
            domain,
            currentTechStack,
            expectedLPA
          }
        },
        { new: true }
      );
    } else {
      // Create new goals
      goals = new UserGoals({
        user: req.user.id,
        targetCompany,
        domain,
        currentTechStack,
        expectedLPA
      });
      await goals.save();
    }

    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserGoals,
  updateUserGoals
};