const mongoose = require('mongoose');
const Test = require('../models/Test');
const User = require('../models/User');

// Sample user ID for creating tests
const ADMIN_ID = '60d0fe4f5311236168a109ca'; // Replace with actual admin user ID

// Sample test data
const mockTests = [
  {
    title: 'Data Structures Fundamentals',
    description: 'Test your knowledge of fundamental data structures including arrays, linked lists, stacks, and queues.',
    topic: 'Data Structures',
    difficulty: 'easy',
    duration: 30,
    createdBy: ADMIN_ID,
    questions: [
      {
        question: 'What is the time complexity of searching for an element in a sorted array using binary search?',
        type: 'multiple-choice',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 'O(log n)',
        explanation: 'Binary search divides the search interval in half with each comparison, resulting in logarithmic time complexity.',
        difficulty: 'easy',
        topic: 'Arrays',
        points: 1
      },
      {
        question: 'Which data structure operates on the principle of "First-In-First-Out" (FIFO)?',
        type: 'multiple-choice',
        options: ['Stack', 'Queue', 'Tree', 'Heap'],
        correctAnswer: 'Queue',
        explanation: 'A queue follows the FIFO principle where the first element added is the first one to be removed.',
        difficulty: 'easy',
        topic: 'Queues',
        points: 1
      },
      {
        question: 'What is the time complexity of inserting an element at the beginning of a singly linked list?',
        type: 'multiple-choice',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 'O(1)',
        explanation: 'Inserting at the beginning of a singly linked list only requires updating the head pointer, which is a constant time operation.',
        difficulty: 'easy',
        topic: 'Linked Lists',
        points: 1
      },
      {
        question: 'Implement a function to reverse a singly linked list.',
        type: 'coding',
        correctAnswer: `function reverseLinkedList(head) {
  let prev = null;
  let current = head;
  let next = null;
  
  while (current !== null) {
    next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}`,
        explanation: 'To reverse a linked list, we iterate through each node, changing the next pointer to point to the previous node instead of the next node.',
        difficulty: 'medium',
        topic: 'Linked Lists',
        points: 2
      },
      {
        question: 'Which data structure is best for implementing a "undo" functionality in a text editor?',
        type: 'multiple-choice',
        options: ['Array', 'Queue', 'Stack', 'Tree'],
        correctAnswer: 'Stack',
        explanation: 'A stack follows the Last-In-First-Out (LIFO) principle, which is ideal for undo operations where the most recent action is undone first.',
        difficulty: 'easy',
        topic: 'Stacks',
        points: 1
      }
    ]
  },
  {
    title: 'Algorithm Design and Analysis',
    description: 'Test your understanding of algorithm design techniques, complexity analysis, and common algorithms.',
    topic: 'Algorithms',
    difficulty: 'medium',
    duration: 45,
    createdBy: ADMIN_ID,
    questions: [
      {
        question: 'What is the worst-case time complexity of the quicksort algorithm?',
        type: 'multiple-choice',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        correctAnswer: 'O(n²)',
        explanation: 'The worst-case scenario for quicksort occurs when the pivot selection consistently results in the most unbalanced partition possible, leading to a quadratic time complexity.',
        difficulty: 'medium',
        topic: 'Sorting',
        points: 1
      },
      {
        question: 'Which algorithm is commonly used to find the shortest path between nodes in a weighted graph?',
        type: 'multiple-choice',
        options: ['Depth-First Search', 'Breadth-First Search', "Dijkstra's Algorithm", 'Bubble Sort'],
        correctAnswer: "Dijkstra's Algorithm",
        explanation: "Dijkstra's algorithm is designed to find the shortest path between nodes in a graph with non-negative edge weights.",
        difficulty: 'medium',
        topic: 'Graph Algorithms',
        points: 1
      },
      {
        question: 'What is the primary advantage of dynamic programming over a naive recursive approach?',
        type: 'multiple-choice',
        options: ['It always has better space complexity', 'It avoids stack overflow errors', 'It reuses calculated results to avoid redundant calculations', 'It always guarantees an optimal solution'],
        correctAnswer: 'It reuses calculated results to avoid redundant calculations',
        explanation: 'Dynamic programming stores the results of subproblems to avoid recalculating them, which can significantly improve efficiency for problems with overlapping subproblems.',
        difficulty: 'medium',
        topic: 'Dynamic Programming',
        points: 1
      },
      {
        question: 'Implement a function to find the nth Fibonacci number using dynamic programming.',
        type: 'coding',
        correctAnswer: `function fibonacci(n) {
  if (n <= 1) return n;
  
  const fib = new Array(n + 1);
  fib[0] = 0;
  fib[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  
  return fib[n];
}`,
        explanation: 'This dynamic programming approach avoids the exponential time complexity of a naive recursive implementation by storing previously calculated Fibonacci numbers.',
        difficulty: 'medium',
        topic: 'Dynamic Programming',
        points: 2
      },
      {
        question: 'What is the time complexity of the merge sort algorithm?',
        type: 'multiple-choice',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        correctAnswer: 'O(n log n)',
        explanation: 'Merge sort divides the array into halves (log n levels) and merges each level in linear time, resulting in an overall time complexity of O(n log n).',
        difficulty: 'medium',
        topic: 'Sorting',
        points: 1
      }
    ]
  },
  {
    title: 'System Design Principles',
    description: 'Evaluate your knowledge of system design concepts, scalability considerations, and architectural patterns.',
    topic: 'System Design',
    difficulty: 'hard',
    duration: 60,
    createdBy: ADMIN_ID,
    questions: [
      {
        question: 'Which of the following is NOT a principle of RESTful architecture?',
        type: 'multiple-choice',
        options: ['Stateless communication', 'Uniform interface', 'Cacheability', 'Shared session state'],
        correctAnswer: 'Shared session state',
        explanation: 'RESTful architecture emphasizes stateless communication, where each request contains all information needed to complete it, rather than relying on shared session state.',
        difficulty: 'medium',
        topic: 'API Design',
        points: 1
      },
      {
        question: 'Which pattern is most appropriate for implementing a distributed counter in a high-traffic web application?',
        type: 'multiple-choice',
        options: ['Mutex locks', 'Database transactions', 'Sharded counters', 'Single central counter'],
        correctAnswer: 'Sharded counters',
        explanation: 'Sharded counters distribute the counting load across multiple nodes to avoid contention and improve throughput in high-traffic scenarios.',
        difficulty: 'hard',
        topic: 'Scalability',
        points: 1
      },
      {
        question: 'What is the purpose of a load balancer in a distributed system?',
        type: 'multiple-choice',
        options: ['To increase storage capacity', 'To distribute incoming requests across multiple servers', 'To encrypt data transmission', 'To backup data'],
        correctAnswer: 'To distribute incoming requests across multiple servers',
        explanation: 'Load balancers improve system reliability and performance by distributing workloads across multiple computing resources.',
        difficulty: 'medium',
        topic: 'Distributed Systems',
        points: 1
      },
      {
        question: 'Design a URL shortening service like bit.ly. Describe the main components, database schema, and API endpoints.',
        type: 'coding',
        correctAnswer: `// URL Shortening Service Design
// 
// Components:
// 1. API Service - Handles URL shortening and redirection requests
// 2. Database - Stores mapping between short and long URLs
// 3. Cache Layer - For fast retrieval of frequently accessed URLs
//
// Database Schema:
// Table: urls
//   - id: PRIMARY KEY
//   - short_key: VARCHAR(10), UNIQUE, INDEXED
//   - original_url: TEXT
//   - user_id: FOREIGN KEY (optional)
//   - created_at: TIMESTAMP
//   - expiration_date: TIMESTAMP (optional)
//   - click_count: INTEGER
//
// API Endpoints:
// 1. POST /api/shorten
//    - Request: { url: "https://example.com/long/url" }
//    - Response: { shortUrl: "https://short.ly/abc123" }
//
// 2. GET /:shortKey
//    - Redirects to the original URL
//
// 3. GET /api/stats/:shortKey
//    - Response: { url: "https://example.com", clicks: 42, created_at: "2023-01-01" }
//
// URL Generation Algorithm:
function generateShortKey(counter) {
  // Convert to base62 (a-z, A-Z, 0-9)
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const base = characters.length;
  let shortKey = '';
  
  let id = counter;
  while (id > 0) {
    shortKey = characters[id % base] + shortKey;
    id = Math.floor(id / base);
  }
  
  return shortKey.padStart(6, '0');
}`,
        explanation: 'This design covers the key aspects of a URL shortening service, including the data model, API endpoints, and a strategy for generating unique short URLs.',
        difficulty: 'hard',
        topic: 'System Design',
        points: 3
      },
      {
        question: 'What is the CAP theorem in distributed systems?',
        type: 'multiple-choice',
        options: [
          'Consistency, Availability, Partition tolerance - you can only guarantee two out of three',
          'Caching, Authentication, Performance - the three pillars of web design',
          'Create, Append, Process - the fundamental operations in data systems',
          'Centralized, Automated, Parallelized - the evolution stages of system design'
        ],
        correctAnswer: 'Consistency, Availability, Partition tolerance - you can only guarantee two out of three',
        explanation: 'The CAP theorem states that a distributed system cannot simultaneously provide more than two out of the three guarantees: Consistency, Availability, and Partition tolerance.',
        difficulty: 'hard',
        topic: 'Distributed Systems',
        points: 1
      }
    ]
  }
];

// Function to seed test data
const seedTests = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/crackit-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to database');
    
    // Clear existing tests
    await Test.deleteMany({});
    console.log('Cleared existing tests');
    
    // Create admin user if doesn't exist
    const adminExists = await User.findById(ADMIN_ID);
    if (!adminExists) {
      console.log('Admin user not found. Please make sure to have a valid user ID in the script.');
    }
    
    // Insert tests
    const result = await Test.insertMany(mockTests);
    console.log(`Successfully seeded ${result.length} tests`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding tests:', error);
  }
};

// Execute the seed function
seedTests();
