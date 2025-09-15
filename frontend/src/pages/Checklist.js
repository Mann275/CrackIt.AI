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

const ChecklistPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('DSA');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const domains = ['DSA', 'Web Development', 'Machine Learning', 'System Design'];
  
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
  
  const createNewChecklist = async () => {
    try {
      await checklistService.createChecklist({
        domain: selectedDomain,
        items: []
      });
      toast.success('New checklist created');
      fetchChecklists();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleItemStatus = async (checklistId, itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await checklistService.updateItemStatus(checklistId, itemId, newStatus);
      fetchChecklists();
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addNewItem = async (checklistId) => {
    try {
      const itemData = {
        title: 'New Item',
        description: 'Add description here',
        category: 'Technical',
        priority: 'Medium',
        status: 'Pending'
      };
      
      await checklistService.addChecklistItem(checklistId, itemData);
      fetchChecklists();
      toast.success('New item added');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteItem = async (checklistId, itemId) => {
    try {
      await checklistService.deleteChecklistItem(checklistId, itemId);
      fetchChecklists();
      toast.success('Item deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateItem = async (checklistId, itemId, updates) => {
    try {
      await checklistService.updateChecklistItem(checklistId, itemId, updates);
      fetchChecklists();
      toast.success('Item updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get domain icon
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
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 blur-lg opacity-50 animate-pulse" />
            <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        </div>
      ) : (
        <>
          {/* Domain Selection and Create New Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-8 h-8" style={{ color: colors.primary }} />
                <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Interview Preparation Checklist</h1>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-3 py-2 rounded-lg transition-colors"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewChecklist}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  style={{ backgroundColor: colors.primary, color: colors.text }}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Checklist</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Checklists */}
          <div className="space-y-6">
            {checklists.map((checklist, index) => (
              <motion.div
                key={checklist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{ backgroundColor: colors.cardBg }}
              >
                {/* Checklist Header */}
                <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getDomainIcon(checklist.domain)}
                      <h2 className="text-xl font-semibold" style={{ color: colors.text }}>{checklist.domain}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: colors.surface, color: colors.text }}>
                        {checklist.progress.completed} / {checklist.progress.total}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addNewItem(checklist._id)}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: colors.surface, color: colors.primary }}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: colors.surface }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklist.progress.percentage}%` }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {checklist.items.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-lg flex items-center justify-between"
                        style={{ 
                          backgroundColor: item.status === 'Completed' ? 
                            `${colors.surface}80` : colors.surface
                        }}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleItemStatus(checklist._id, item._id, item.status)}
                            className="p-1 rounded-full transition-colors"
                            style={{ 
                              color: item.status === 'Completed' ? 
                                colors.success : colors.text
                            }}
                          >
                            {item.status === 'Completed' ? (
                              <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-current" />
                            )}
                          </motion.button>
                          <div className="flex-1">
                            <h3 className="font-medium" style={{ 
                              color: colors.text,
                              textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                              opacity: item.status === 'Completed' ? 0.75 : 1
                            }}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: item.priority === 'High' ? 
                                `${colors.error}20` : item.priority === 'Medium' ? 
                                `${colors.warning}20` : `${colors.success}20`,
                              color: item.priority === 'High' ? 
                                colors.error : item.priority === 'Medium' ? 
                                colors.warning : colors.success
                            }}>
                            {item.priority}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteItem(checklist._id, item._id)}
                            className="p-1 transition-colors"
                            style={{ color: colors.error }}
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
    </DashboardLayout>
  );
};

export default ChecklistPage;