import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import checklistService from '../services/checklistService';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const ChecklistPage = () => {
  const { darkMode } = useTheme();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('DSA');
  
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            className={`mb-8 p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Interview Preparation Checklist</h1>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className={`px-3 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                <button
                  onClick={createNewChecklist}
                  className="px-4 py-2 bg-primary text-white rounded-lg flex items-center space-x-2 hover:bg-primary-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Checklist</span>
                </button>
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
                className={`rounded-xl shadow-lg overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {/* Checklist Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{checklist.domain}</h2>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {checklist.progress.completed} / {checklist.progress.total}
                      </div>
                      <button
                        onClick={() => addNewItem(checklist._id)}
                        className="p-2 text-primary hover:bg-primary hover:text-white rounded-full transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklist.progress.percentage}%` }}
                      className="bg-primary h-2 rounded-full"
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
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          isDarkMode 
                            ? item.status === 'Completed' ? 'bg-gray-700/50' : 'bg-gray-700'
                            : item.status === 'Completed' ? 'bg-gray-50' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <button
                            onClick={() => toggleItemStatus(checklist._id, item._id, item.status)}
                            className={`p-1 rounded-full ${
                              item.status === 'Completed'
                                ? 'text-green-500'
                                : isDarkMode
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-500 hover:text-gray-700'
                            } transition-colors`}
                          >
                            {item.status === 'Completed' ? (
                              <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-current" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3 className={`font-medium ${
                              item.status === 'Completed' ? 'line-through opacity-75' : ''
                            }`}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : item.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                          <button
                            onClick={() => deleteItem(checklist._id, item._id)}
                            className="p-1 text-gray-500 hover:text-red-500"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
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
  );
};

export default ChecklistPage;