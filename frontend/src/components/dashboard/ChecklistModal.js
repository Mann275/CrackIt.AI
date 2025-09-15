import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ChecklistModal = ({ isOpen, onClose, onGenerate, category }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await onGenerate();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="relative w-full max-w-md rounded-xl p-6 shadow-xl"
              style={{ backgroundColor: colors.cardBg }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1 rounded-full transition-colors"
                style={{ color: colors.textSecondary }}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  Generate {category} Checklist
                </h3>
                <p 
                  className="mb-6"
                  style={{ color: colors.textSecondary }}
                >
                  Generate an AI-powered checklist for your {category} interview preparation
                </p>

                {loading ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 rounded-full"
                      style={{ 
                        borderColor: colors.surface,
                        borderTopColor: colors.primary
                      }}
                    />
                    <p style={{ color: colors.textSecondary }}>
                      Generating your checklist...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p style={{ color: colors.text }}>
                      This will create a personalized checklist with:
                    </p>
                    <ul 
                      className="text-left space-y-2 mb-6"
                      style={{ color: colors.textSecondary }}
                    >
                      <li>• 10-15 essential topics</li>
                      <li>• Difficulty levels for each item</li>
                      <li>• Progress tracking</li>
                      <li>• Detailed descriptions</li>
                    </ul>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg"
                        style={{ backgroundColor: colors.surface }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="px-4 py-2 rounded-lg"
                        style={{ 
                          backgroundColor: colors.primary,
                          color: colors.buttonText
                        }}
                      >
                        Generate Checklist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChecklistModal;