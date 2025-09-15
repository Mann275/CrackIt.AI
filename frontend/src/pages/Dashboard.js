import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/DashboardLayout';
import ProgressCard from '../components/dashboard/ProgressCard';
import TaskList from '../components/dashboard/TaskList';
import TestResultCard from '../components/dashboard/TestResultCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        const data = {
          progress: {
            roadmap: 65,
            testsCompleted: 12,
            totalTests: 20,
            checklist: {
              completed: 45,
              total: 100
            }
          },
          tasks: [
            {
              id: 1,
              title: 'Complete System Design Practice',
              category: 'Learning',
              dueDate: 'Today',
              completed: false
            },
            {
              id: 2,
              title: 'Take DSA Mock Test',
              category: 'Assessment',
              dueDate: 'Tomorrow',
              completed: false
            },
            {
              id: 3,
              title: 'Review Graph Algorithms',
              category: 'Review',
              dueDate: '2 days left',
              completed: true
            }
          ],
          recentTests: [
            {
              testName: 'DSA Advanced - Arrays & Strings',
              date: '2 hours ago',
              score: 85,
              improvement: 12,
              aiFeedback: 'Great improvement in problem-solving speed. Focus on optimizing space complexity.',
              areasToImprove: ['Two Pointers', 'Dynamic Programming']
            },
            {
              testName: 'System Design Basics',
              date: 'Yesterday',
              score: 72,
              improvement: -3,
              aiFeedback: 'Good understanding of basics. Need to work on scalability concepts.',
              areasToImprove: ['Load Balancing', 'Caching Strategies']
            }
          ]
        };

        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <p className="text-red-500 text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <p className="text-xl">No dashboard data available</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ProgressCard
          title="Learning Progress"
          value={dashboardData.progress.roadmap}
          maxValue={100}
          icon={ChartBarIcon}
          color="blue"
          onClick={() => navigate('/roadmap')}
        />
        <ProgressCard
          title="Tests Completed"
          value={dashboardData.progress.testsCompleted}
          maxValue={dashboardData.progress.totalTests}
          icon={AcademicCapIcon}
          color="green"
          onClick={() => navigate('/tests')}
        />
        <ProgressCard
          title="Checklist Progress"
          value={dashboardData.progress.checklist.completed}
          maxValue={dashboardData.progress.checklist.total}
          icon={ClipboardDocumentCheckIcon}
          color="yellow"
          onClick={() => navigate('/checklist')}
        />
        <ProgressCard
          title="Community Activity"
          value={85}
          maxValue={100}
          icon={ChatBubbleLeftRightIcon}
          color="purple"
          onClick={() => navigate('/chat')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.recentTests.map((result, index) => (
              <TestResultCard key={index} result={result} />
            ))}
          </div>

          {/* Upcoming Tasks */}
          <TaskList
            tasks={dashboardData.tasks}
            onToggleTask={(taskId) => {
              // TODO: Implement task toggle logic
              console.log('Toggle task:', taskId);
            }}
          />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          
          <QuickActionCard
            title="Start Mock Test"
            description="Take a practice test to assess your skills"
            icon={AcademicCapIcon}
            onClick={() => navigate('/tests')}
            color="blue"
          />
          
          <QuickActionCard
            title="View Roadmap"
            description="Check your personalized learning path"
            icon={ChartBarIcon}
            onClick={() => navigate('/roadmap')}
            color="green"
          />
          
          <QuickActionCard
            title="Join Discussion"
            description="Connect with peers in company-specific chatrooms"
            icon={ChatBubbleLeftRightIcon}
            onClick={() => navigate('/chat')}
            color="purple"
          />
          
          <QuickActionCard
            title="Review Checklist"
            description="Track your preparation progress"
            icon={ClipboardDocumentCheckIcon}
            onClick={() => navigate('/checklist')}
            color="yellow"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;