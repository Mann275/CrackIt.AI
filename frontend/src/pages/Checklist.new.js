import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import checklistService from '../services/checklistService';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  AcademicCapIcon,
  LightBulbIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const domains = ['DSA', 'Web Development', 'Machine Learning', 'System Design'];

const ChecklistPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('DSA');

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const data = await checklistService.getUserChecklists();
      setChecklists(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async () => {
    try {
      await checklistService.createChecklist({
        domain: selectedDomain,
        items: []
      });
      toast.success('Checklist created successfully');
      fetchChecklists();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleItem = async (checklistId, itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await checklistService.updateItemStatus(checklistId, itemId, newStatus);
      fetchChecklists();
      toast.success('Item status updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddItem = async (checklistId) => {
    try {
      await checklistService.addChecklistItem(checklistId, {
        title: 'New Item',
        description: '',
        priority: 'Medium',
        status: 'Pending'
      });
      fetchChecklists();
      toast.success('New item added');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteItem = async (checklistId, itemId) => {
    try {
      await checklistService.deleteChecklistItem(checklistId, itemId);
      fetchChecklists();
      toast.success('Item deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'DSA':
        return <BeakerIcon className="w-6 h-6" style={{ color: colors.primary }} />;
      case 'Web Development':
        return <DocumentTextIcon className="w-6 h-6" style={{ color: colors.success }} />;
      case 'Machine Learning':
        return <LightBulbIcon className="w-6 h-6" style={{ color: colors.warning }} />;
      case 'System Design':
        return <AcademicCapIcon className="w-6 h-6" style={{ color: colors.info }} />;
      default:
        return <DocumentTextIcon className="w-6 h-6" style={{ color: colors.primary }} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-4 rounded-full"
              style={{ 
                borderColor: colors.surface,
                borderTopColor: colors.primary
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-8 h-8" style={{ color: colors.primary }} />
                <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                  Interview Checklists
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateChecklist}
                  className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: colors.primary, color: colors.buttonText }}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Checklist</span>
                </motion.button>
              </div>
            </div>

            {/* Checklists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {checklists.map((checklist) => (
                <motion.div
                  key={checklist._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  {/* Checklist Header */}
                  <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDomainIcon(checklist.domain)}
                        <div>
                          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                            {checklist.domain}
                          </h2>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {checklist.items.length} items
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddItem(checklist._id)}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <PlusIcon className="w-5 h-5" style={{ color: colors.primary }} />
                      </motion.button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color: colors.textSecondary }}>Progress</span>
                        <span style={{ color: colors.primary }}>
                          {Math.round((checklist.items.filter(i => i.status === 'Completed').length / checklist.items.length) * 100) || 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surface }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(checklist.items.filter(i => i.status === 'Completed').length / checklist.items.length) * 100 || 0}%`
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="p-4 space-y-2">
                    {checklist.items.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-lg flex items-center gap-4"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleItem(checklist._id, item._id, item.status)}
                        >
                          {item.status === 'Completed' ? (
                            <CheckCircleIcon className="w-6 h-6" style={{ color: colors.success }} />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full border-2"
                              style={{ borderColor: colors.border }}
                            />
                          )}
                        </motion.button>

                        <div className="flex-1">
                          <h3
                            className="font-medium"
                            style={{
                              color: colors.text,
                              textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                              opacity: item.status === 'Completed' ? 0.6 : 1
                            }}
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteItem(checklist._id, item._id)}
                          className="p-1 rounded-lg hover:bg-red-500/10"
                        >
                          <XCircleIcon className="w-5 h-5" style={{ color: colors.error }} />
                        </motion.button>
                      </motion.div>
                    ))}

                    {checklist.items.length === 0 && (
                      <div
                        className="text-center py-8 rounded-lg"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <p style={{ color: colors.textSecondary }}>No items yet</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddItem(checklist._id)}
                          className="mt-2 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                          style={{ backgroundColor: colors.primary, color: colors.buttonText }}
                        >
                          <PlusIcon className="w-5 h-5" />
                          <span>Add First Item</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {checklists.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-2 text-center py-16 rounded-xl"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <DocumentTextIcon
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: colors.primary }}
                  />
                  <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                    No Checklists Yet
                  </h2>
                  <p className="mb-6" style={{ color: colors.textSecondary }}>
                    Create your first checklist to track your interview preparation
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateChecklist}
                    className="px-6 py-3 rounded-xl inline-flex items-center gap-2"
                    style={{ backgroundColor: colors.primary, color: colors.buttonText }}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create First Checklist</span>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistPage;