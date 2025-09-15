import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
    Background, 
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-hot-toast';
import aiRoadmapService from '../services/aiRoadmapService';
import {
    FiSun, 
    FiMoon, 
    FiCalendar, 
    FiBookOpen, 
    FiClock, 
    FiLink
} from 'react-icons/fi';

// Node component
const DayNode = ({ data }) => {
    const { colors } = useTheme();
    
    return (
        <div 
            className="p-4 rounded-lg border-2 shadow-lg w-72"
            style={{ 
                backgroundColor: data.status === 'completed' ? colors.success + '20' : colors.cardBg,
                borderColor: data.status === 'completed' ? colors.success : colors.border 
            }}
        >
            <h3 className="text-lg font-bold mb-2 flex items-center" style={{ color: colors.primary }}>
                <FiCalendar className="mr-2" /> {data.label}
            </h3>
            <p className="text-sm mb-3" style={{ color: colors.text }}>{data.description}</p>
            
            {data.content && (
                <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-1 flex items-center" style={{ color: colors.textSecondary }}>
                        <FiBookOpen className="mr-1" /> Today's Learning
                    </h4>
                    <p className="text-xs" style={{ color: colors.text }}>{data.content}</p>
                </div>
            )}

            {data.exercises && data.exercises.length > 0 && (
                <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>
                        Exercises
                    </h4>
                    <ul className="text-xs space-y-1">
                        {data.exercises.map((exercise, index) => (
                            <li key={index} style={{ color: colors.text }}>
                                {typeof exercise === 'object' ? (
                                    <div>
                                        <div className="font-medium">{exercise.title}</div>
                                        {exercise.description && (
                                            <div className="mt-1">{exercise.description}</div>
                                        )}
                                        {exercise.link && (
                                            <a
                                                href={exercise.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-block hover:underline"
                                                style={{ color: colors.primary }}
                                            >
                                                Go to exercise →
                                            </a>
                                        )}
                                    </div>
                                ) : exercise}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {data.estimatedHours && (
                <div className="mb-3 flex items-center text-sm" style={{ color: colors.textSecondary }}>
                    <FiClock className="mr-1" />
                    <span>Estimated time: <span className="font-medium">{data.estimatedHours} hours</span></span>
                    {data.weekEstimate && (
                        <span className="ml-1 text-xs" style={{ color: colors.textSecondary }}>
                            ({data.weekEstimate})
                        </span>
                    )}
                </div>
            )}
            
            {data.resources && data.resources.length > 0 && (
                <div className="mb-2">
                    <h4 className="text-sm font-semibold mb-1 flex items-center" style={{ color: colors.textSecondary }}>
                        <FiLink className="mr-1" /> Resources
                    </h4>
                    <ul className="text-xs space-y-1">
                        {data.resources.map((resource, index) => (
                            <li key={index}>
                                <a
                                    href={typeof resource === 'object' ? resource.url : resource}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline block p-2 rounded"
                                    style={{ 
                                        backgroundColor: colors.surface,
                                        color: colors.primary 
                                    }}
                                >
                                    {typeof resource === 'object' ? (
                                        <>
                                            <div className="font-medium">{resource.title}</div>
                                            {resource.type && (
                                                <div className="text-xs mt-1 uppercase tracking-wide">
                                                    {resource.type}
                                                </div>
                                            )}
                                        </>
                                    ) : resource}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="mt-2 flex items-center justify-between">
                {data.difficulty && (
                    <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                            backgroundColor: 
                                data.difficulty === 'Beginner' ? colors.success + '20' :
                                data.difficulty === 'Intermediate' ? colors.warning + '20' :
                                colors.error + '20',
                            color:
                                data.difficulty === 'Beginner' ? colors.success :
                                data.difficulty === 'Intermediate' ? colors.warning :
                                colors.error
                        }}
                    >
                        {data.difficulty}
                    </span>
                )}
                {data.progress !== undefined && (
                    <div 
                        className="text-xs font-medium"
                        style={{ color: colors.textSecondary }}
                    >
                        Progress: {data.progress}%
                    </div>
                )}
            </div>
        </div>
    );
};

const AIRoadmapPage = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        goals: '',
        currentLevel: 'Beginner',
        interests: '',
        timeCommitment: ''
    });
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [error, setError] = useState('');
    const [roadmapGenerated, setRoadmapGenerated] = useState(false);
    const [theme, setTheme] = useState('light');
    const [currentNode, setCurrentNode] = useState(null);

    // Load existing roadmap
    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setIsLoading(true);
                const roadmap = await aiRoadmapService.getRoadmap();
                if (roadmap && roadmap.roadmapData) {
                    setNodes(roadmap.roadmapData.nodes.map(node => ({
                        ...node,
                        type: 'custom'
                    })));
                    setEdges(roadmap.roadmapData.edges);
                    setRoadmapGenerated(true);
                }
            } catch (error) {
                console.log('No existing roadmap found');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchRoadmap();
    }, []);

    const nodeTypes = useMemo(() => ({ custom: DayNode }), []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const interests = formData.interests.split(',').map(i => i.trim());
            const response = await aiRoadmapService.generateRoadmap({
                ...formData,
                interests
            });

            if (response.roadmapData?.nodes) {
                const mappedNodes = response.roadmapData.nodes.map(node => ({
                    ...node,
                    type: 'custom'
                }));
                
                setNodes(mappedNodes);
                setEdges(response.roadmapData.edges || []);
                setRoadmapGenerated(true);
                
                if (mappedNodes.length > 0) {
                    setCurrentNode(mappedNodes[0]);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to generate roadmap');
            toast.error(err.message || 'Failed to generate roadmap');
        } finally {
            setIsLoading(false);
        }
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleNodeClick = async (e, node) => {
        setCurrentNode(node);
        
        // If node is clicked and not completed, mark as in-progress
        if (node.data.status !== 'completed') {
            try {
                await aiRoadmapService.updateProgress(node.id, 'in-progress', node.data.progress || 0);
                
                // Update local state
                setNodes(prev => prev.map(n => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                status: 'in-progress'
                            }
                        };
                    }
                    return n;
                }));
                
                toast.success('Node marked as in-progress');
            } catch (error) {
                toast.error('Failed to update node status');
            }
        }
    };

    const handleNodeComplete = async (nodeId) => {
        try {
            await aiRoadmapService.updateProgress(nodeId, 'completed', 100);
            
            // Update local state
            setNodes(prev => prev.map(n => {
                if (n.id === nodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            status: 'completed',
                            progress: 100
                        }
                    };
                }
                return n;
            }));
            
            toast.success('Node marked as completed');
        } catch (error) {
            toast.error('Failed to update node status');
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen transition-colors duration-300">
                <div className="container mx-auto p-4">
                    <div className="flex justify-between items-center mb-6">
                        <motion.h1 
                            className="text-3xl font-bold"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ color: colors.primary }}
                        >
                            AI Learning Roadmap
                        </motion.h1>
                        
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full transition-colors"
                            style={{ 
                                backgroundColor: theme === 'light' ? colors.surface : colors.cardBg,
                                color: colors.text
                            }}
                        >
                            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>
                    </div>
                    
                    {!roadmapGenerated ? (
                        <motion.div 
                            className="max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div 
                                className="p-6 rounded-lg shadow-lg"
                                style={{ backgroundColor: colors.cardBg }}
                            >
                                <h2 
                                    className="text-xl font-semibold mb-4"
                                    style={{ color: colors.primary }}
                                >
                                    Create Your Learning Path
                                </h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            What are your learning goals?
                                        </label>
                                        <textarea
                                            name="goals"
                                            value={formData.goals}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm p-3"
                                            style={{ 
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }}
                                            rows="3"
                                            placeholder="e.g., I want to learn React.js to build interactive web applications"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Current Level
                                        </label>
                                        <select
                                            name="currentLevel"
                                            value={formData.currentLevel}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm p-3"
                                            style={{ 
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }}
                                            required
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Interests (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="interests"
                                            value={formData.interests}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm p-3"
                                            style={{ 
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }}
                                            placeholder="e.g., Frontend Development, React, TypeScript"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Time Commitment
                                        </label>
                                        <select
                                            name="timeCommitment"
                                            value={formData.timeCommitment}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm p-3"
                                            style={{ 
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }}
                                            required
                                        >
                                            <option value="">Select time commitment</option>
                                            <option value="1-2 hours/day">1-2 hours/day</option>
                                            <option value="2-4 hours/day">2-4 hours/day</option>
                                            <option value="4+ hours/day">4+ hours/day</option>
                                            <option value="Weekends only">Weekends only</option>
                                        </select>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 rounded-md font-medium transition-all focus:outline-none focus:ring-2"
                                        style={{ 
                                            backgroundColor: isLoading ? colors.textSecondary : colors.primary,
                                            color: '#ffffff'
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? 'Generating Roadmap...' : 'Generate My Learning Roadmap'}
                                    </motion.button>
                                </form>

                                {error && (
                                    <div 
                                        className="mt-4 p-3 rounded-md"
                                        style={{ 
                                            backgroundColor: colors.error + '20',
                                            color: colors.error
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div 
                                className="lg:col-span-2 rounded-lg shadow-lg" 
                                style={{ 
                                    backgroundColor: colors.cardBg,
                                    height: '70vh'
                                }}
                            >
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    nodeTypes={nodeTypes}
                                    onNodeClick={handleNodeClick}
                                    fitView
                                >
                                    <Background />
                                    <Controls />
                                    <MiniMap 
                                        style={{
                                            backgroundColor: colors.surface
                                        }}
                                    />
                                    
                                    {/* Node Progress Controls */}
                                    {currentNode && (
                                        <div 
                                            style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '1rem',
                                                zIndex: 4
                                            }}
                                            className="p-4 rounded-lg shadow-lg"
                                        >
                                            <button
                                                onClick={() => handleNodeComplete(currentNode.id)}
                                                className="px-4 py-2 rounded-md text-white font-medium"
                                                style={{ backgroundColor: colors.success }}
                                            >
                                                Mark Complete
                                            </button>
                                        </div>
                                    )}
                                </ReactFlow>
                            </div>
                            
                            <div>
                                {currentNode && (
                                    <motion.div 
                                        className="p-6 rounded-lg shadow-lg"
                                        style={{ backgroundColor: colors.cardBg }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={currentNode.id}
                                    >
                                        <h2 
                                            className="text-xl font-bold mb-4"
                                            style={{ color: colors.primary }}
                                        >
                                            {currentNode.data.label}
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h3 
                                                    className="font-medium"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    Description:
                                                </h3>
                                                <p className="mt-1" style={{ color: colors.text }}>
                                                    {currentNode.data.description}
                                                </p>
                                            </div>
                                            
                                            {currentNode.data.content && (
                                                <div>
                                                    <h3 
                                                        className="font-medium"
                                                        style={{ color: colors.textSecondary }}
                                                    >
                                                        Content:
                                                    </h3>
                                                    <p className="mt-1" style={{ color: colors.text }}>
                                                        {currentNode.data.content}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h3 
                                                    className="font-medium"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    Status:
                                                </h3>
                                                <div 
                                                    className="mt-2 flex items-center space-x-2"
                                                    style={{ color: colors.text }}
                                                >
                                                    <div 
                                                        className={`w-3 h-3 rounded-full`}
                                                        style={{
                                                            backgroundColor: 
                                                                currentNode.data.status === 'completed' ? colors.success :
                                                                currentNode.data.status === 'in-progress' ? colors.warning :
                                                                colors.error
                                                        }}
                                                    />
                                                    <span className="capitalize">
                                                        {currentNode.data.status || 'not-started'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AIRoadmapPage;