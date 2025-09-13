const User = require('../models/User');
const bcrypt = require('bcrypt');

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      targetCompanies, 
      preferredDomain,
      techStack, 
      expectedLPA,
      skills,
      hasCompletedGoalSetup,
      hasCompletedSkillSurvey,
      profilePhoto
    } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (targetCompanies) updateData.targetCompanies = targetCompanies;
    if (preferredDomain) updateData.preferredDomain = preferredDomain;
    if (techStack) updateData.techStack = techStack;
    if (expectedLPA) updateData.expectedLPA = expectedLPA;
    if (skills) updateData.skills = skills;
    if (hasCompletedGoalSetup !== undefined) updateData.hasCompletedGoalSetup = hasCompletedGoalSetup;
    if (hasCompletedSkillSurvey !== undefined) updateData.hasCompletedSkillSurvey = hasCompletedSkillSurvey;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};
