import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiFlag } from 'react-icons/fi';
import 'reactflow/dist/style.css';

const CustomNode = ({ data, isConnectable }) => {
  const priorityColors = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-green-500'
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl shadow-lg border ${
        data.completed
          ? 'bg-green-900/50 border-green-500'
          : 'bg-gray-800/90 border-gray-600'
      } backdrop-blur-md min-w-[200px]`}
    >
      {/* Priority Indicator */}
      <div className="flex justify-between items-center mb-2">
        <div className={`px-2 py-1 rounded-full text-xs text-white ${priorityColors[data.priority]}`}>
          {data.priority} Priority
        </div>
        <div className="flex items-center">
          <FiClock className="mr-1 text-gray-400" />
          <span className="text-xs text-gray-400">{data.timeEstimate}</span>
        </div>
      </div>
      
      {/* Topic Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{data.topic}</h3>
      
      {/* Description */}
      <p className="text-sm text-gray-300 mb-3">{data.description}</p>
      
      {/* Resources */}
      {data.resources && data.resources.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Resources:</div>
          <div className="space-y-1">
            {data.resources.slice(0, 2).map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-indigo-400 hover:text-indigo-300 truncate"
              >
                {resource.title}
              </a>
            ))}
            {data.resources.length > 2 && (
              <div className="text-xs text-gray-500">
                +{data.resources.length - 2} more resources
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Completion Checkbox */}
      <button
        onClick={() => data.onComplete?.(!data.completed)}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
          data.completed
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
      >
        <FiCheckCircle className={`mr-2 ${data.completed ? 'text-white' : 'text-gray-400'}`} />
        {data.completed ? 'Completed' : 'Mark as Complete'}
      </button>
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

const RoadmapFlow = ({ roadmapData, onNodeComplete }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(roadmapData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(roadmapData.edges || []);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Calculate completion percentage
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(node => node.data.completed).length;
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // Handle node completion
  const handleNodeComplete = useCallback((nodeId, completed) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              completed
            }
          };
        }
        return node;
      })
    );
    onNodeComplete?.(nodeId, completed);
  }, [setNodes, onNodeComplete]);

  return (
    <div className="w-full h-[800px] relative">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-gray-800/90 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          
          // Debounce node position updates
          if (debounceTimeout) clearTimeout(debounceTimeout);
          setDebounceTimeout(setTimeout(() => {
            const movedNodes = changes
              .filter(change => change.type === 'position')
              .map(change => ({
                id: change.id,
                position: nodes.find(n => n.id === change.id).position
              }));
            
            if (movedNodes.length > 0) {
              fetch(`http://localhost:5001/api/roadmap/${roadmapData._id}/node-positions`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nodes: movedNodes })
              }).catch(console.error);
            }
          }, 500));
        }}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.data?.completed) return '#22c55e';
            return '#475569';
          }}
          nodeColor={(n) => {
            if (n.data?.completed) return '#22c55e';
            return '#1f2937';
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default RoadmapFlow;