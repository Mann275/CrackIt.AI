from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

app = Flask(__name__)
CORS(app)

# Company-specific expectations (simplified for demo)
company_expectations = {
    "Amazon": {
        "DSA": ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
        "Core CS": ["Operating Systems", "DBMS", "Computer Networks"],
        "Development": ["Web Development", "Cloud Computing"]
    },
    "Google": {
        "DSA": ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Algorithm Design"],
        "Core CS": ["Operating Systems", "DBMS", "System Design"],
        "Development": ["Machine Learning", "Web Development"]
    },
    "Microsoft": {
        "DSA": ["Arrays", "Linked Lists", "Trees", "Recursion", "Dynamic Programming"],
        "Core CS": ["Operating Systems", "System Design", "OOPS"],
        "Development": ["Web Development", "Cloud Computing"]
    },
    "TCS": {
        "DSA": ["Arrays", "Linked Lists", "Stacks", "Queues", "Sorting"],
        "Core CS": ["DBMS", "Computer Networks", "OOPS"],
        "Development": ["Web Development", "Enterprise Software"]
    },
    "Infosys": {
        "DSA": ["Arrays", "Linked Lists", "Stacks", "Queues", "Sorting"],
        "Core CS": ["DBMS", "Computer Networks", "OOPS"],
        "Development": ["Web Development", "Enterprise Software"]
    }
}

# Domain-specific skills
domain_skills = {
    "Web Development": ["React", "Node.js", "HTML/CSS", "JavaScript", "RESTful APIs", "MongoDB"],
    "App Development": ["React Native", "Flutter", "Mobile UI Design", "API Integration", "Local Storage"],
    "Data Science": ["Python", "Pandas", "NumPy", "Data Visualization", "Statistical Analysis"],
    "Machine Learning": ["Scikit-learn", "TensorFlow", "Neural Networks", "Data Preprocessing", "Model Evaluation"],
    "Cloud Computing": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Serverless"]
}

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    user_data = request.json
    userId = user_data.get('userId')
    skills = user_data.get('skills', {})
    
    # Get user preferences from request or use defaults
    target_companies = user_data.get('targetCompanies', ['Amazon', 'Google'])
    preferred_domain = user_data.get('preferredDomain', 'Web Development')
    tech_stack = user_data.get('techStack', ['MERN', 'Python'])
    
    # Extract skill levels
    dsa_skills = skills.get('dsaSkills', {})
    core_cs_skills = skills.get('coreCSSkills', {})
    dev_experience = skills.get('devExperience', {})
    
    # Identify weak areas
    weak_dsa = [k for k, v in dsa_skills.items() if v < 3]
    weak_cs = [k for k, v in core_cs_skills.items() if v < 3]
    weak_dev = [k for k, v in dev_experience.items() if v < 3]
    
    # Generate roadmap based on weak areas and company expectations
    checklist = []
    weekly_plan = []
    
    # Add DSA tasks
    for company in target_companies[:2]:  # Focus on top 2 companies
        for dsa_topic in company_expectations.get(company, {}).get("DSA", []):
            if dsa_topic.lower() in [w.replace('_', '').lower() for w in weak_dsa]:
                checklist.append(f"Learn and practice {dsa_topic} (important for {company})")
    
    # Add Core CS tasks
    for company in target_companies[:2]:
        for cs_topic in company_expectations.get(company, {}).get("Core CS", []):
            if any(cs in cs_topic.lower() for cs in [w.replace('_', '').lower() for w in weak_cs]):
                checklist.append(f"Study {cs_topic} concepts (required by {company})")
    
    # Add Domain-specific tasks
    if preferred_domain in domain_skills:
        for skill in domain_skills[preferred_domain][:5]:
            checklist.append(f"Learn {skill} for {preferred_domain}")
    
    # Add general preparation tasks
    checklist.extend([
        "Create a GitHub portfolio with projects",
        "Practice 5 medium leetcode problems daily",
        "Prepare a personal introduction",
        "Research recent tech trends",
        "Prepare questions to ask interviewers"
    ])
    
    # Generate weekly plan (simplified)
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for i, day in enumerate(days):
        if i < len(checklist):
            weekly_plan.append(f"{day}: {checklist[i].split('(')[0].strip()}")
        else:
            weekly_plan.append(f"{day}: Review and practice previous topics")
    
    # Calculate progress based on existing skills vs required skills
    total_skills = len(dsa_skills) + len(core_cs_skills) + len(dev_experience)
    strong_skills = sum(1 for v in dsa_skills.values() if v >= 3)
    strong_skills += sum(1 for v in core_cs_skills.values() if v >= 3)
    strong_skills += sum(1 for v in dev_experience.values() if v >= 3)
    
    progress = (strong_skills / total_skills) * 100 if total_skills > 0 else 0
    
    # Generate response
    roadmap = {
        "checklist": checklist,
        "progress": progress,
        "weeklyPlan": weekly_plan
    }
    
    # Simulate processing time
    time.sleep(1)
    
    return jsonify(roadmap)

@app.route('/fetch-interview-qna', methods=['POST'])
def fetch_interview_qna():
    data = request.json
    company = data.get('company', 'Amazon')
    
    # In a real implementation, this would use Selenium to scrape from GeeksForGeeks or Glassdoor
    # Here we're simulating the results
    
    questions = []
    
    # Simulated questions for companies
    company_questions = {
        "Amazon": [
            {"question": "Describe Amazon's leadership principles and how you've demonstrated them.", 
             "answer": "Amazon has 16 leadership principles including Customer Obsession, Ownership, Learn and Be Curious, etc. In my previous role, I demonstrated Customer Obsession by prioritizing customer needs in my product designs...", 
             "topic": "Behavioral", 
             "source": "Glassdoor"},
            {"question": "Design a system to handle Amazon's delivery logistics.", 
             "answer": "I'd approach this by first understanding the requirements: package tracking, routing optimization, delivery personnel assignment. For architecture, we'd need a distributed system with microservices for routing, tracking, and notifications...", 
             "topic": "System Design", 
             "source": "GeeksForGeeks"},
            {"question": "Implement a function to find the maximum subarray sum.", 
             "answer": "This can be solved using Kadane's algorithm with O(n) time complexity. We track the current sum and the maximum sum seen so far, resetting current sum when it becomes negative...", 
             "topic": "DSA", 
             "source": "GeeksForGeeks"},
            {"question": "How would you handle a situation where you disagree with your manager?", 
             "answer": "I would first ensure I understand their perspective completely. Then I would present my viewpoint with data and reasoning in a private setting. The goal is to arrive at the best solution for the team/company...", 
             "topic": "Behavioral", 
             "source": "Glassdoor"},
            {"question": "Explain the CAP theorem and its implications for distributed databases.", 
             "answer": "The CAP theorem states that a distributed database system can only guarantee two out of three properties simultaneously: Consistency, Availability, and Partition tolerance. When designing systems, we must decide which properties to prioritize...", 
             "topic": "System Design", 
             "source": "GeeksForGeeks"}
        ],
        "Google": [
            {"question": "Implement a function to check if a binary tree is balanced.", 
             "answer": "A binary tree is balanced if the heights of its left and right subtrees differ by at most 1. We can use a recursive approach to check this property for each node...", 
             "topic": "DSA", 
             "source": "GeeksForGeeks"},
            {"question": "How would you design Google's search autocomplete feature?", 
             "answer": "I'd use a combination of Tries for prefix matching and a priority queue to maintain the most relevant suggestions. We'd need a distributed system to handle the scale...", 
             "topic": "System Design", 
             "source": "GeeksForGeeks"},
            {"question": "Tell me about a time when you had to make a decision with incomplete information.", 
             "answer": "In my previous project, we had to decide on a technology stack with limited time for research. I evaluated the available options based on team expertise, community support, and alignment with requirements...", 
             "topic": "Behavioral", 
             "source": "Glassdoor"},
            {"question": "What are the trade-offs between B-trees and Hash tables?", 
             "answer": "B-trees provide ordered data access and range queries with O(log n) operations. Hash tables offer O(1) average case lookups but don't maintain order and perform poorly for range queries...", 
             "topic": "DSA", 
             "source": "GeeksForGeeks"},
            {"question": "How would you improve Google Maps?", 
             "answer": "I would enhance real-time traffic predictions using ML on historical and current data, improve indoor mapping for complex buildings, and add AR features for better navigation...", 
             "topic": "Product Design", 
             "source": "Glassdoor"}
        ],
        "TCS": [
            {"question": "Explain the differences between REST and SOAP web services.", 
             "answer": "REST uses standard HTTP methods, is lightweight and supports multiple data formats including JSON. SOAP is a protocol with stricter standards, uses XML exclusively, and has built-in error handling...", 
             "topic": "Web Development", 
             "source": "GeeksForGeeks"},
            {"question": "What are the ACID properties in DBMS?", 
             "answer": "ACID stands for Atomicity (transactions are all-or-nothing), Consistency (database remains in a valid state), Isolation (concurrent transactions don't interfere), and Durability (completed transactions persist)...", 
             "topic": "DBMS", 
             "source": "GeeksForGeeks"},
            {"question": "Describe your experience with the software development lifecycle.", 
             "answer": "I've worked with Agile methodologies involving requirements gathering, design, implementation, testing, deployment, and maintenance phases. In my last project, I participated in daily stand-ups and sprint planning...", 
             "topic": "Software Engineering", 
             "source": "Glassdoor"},
            {"question": "What are the advantages of normalized database design?", 
             "answer": "Normalization reduces data redundancy, improves data integrity by eliminating update anomalies, and makes the database more flexible for future changes...", 
             "topic": "DBMS", 
             "source": "GeeksForGeeks"},
            {"question": "How would you handle a situation where project requirements change mid-development?", 
             "answer": "I would assess the impact on timeline, resources, and existing work. Then communicate with stakeholders to prioritize requirements and adjust the sprint backlog accordingly...", 
             "topic": "Project Management", 
             "source": "Glassdoor"}
        ]
    }
    
    # Return questions for the requested company or default ones
    questions = company_questions.get(company, company_questions["Amazon"])
    
    # Simulate scraping delay
    time.sleep(2)
    
    return jsonify({"questions": questions})

@app.route('/analyze-test-results', methods=['POST'])
def analyze_test_results():
    data = request.json
    test_results = data.get('results', [])
    
    # In a real implementation, this would use ML to analyze the results
    # Here we're simulating the analysis
    
    total_questions = len(test_results)
    correct_answers = sum(1 for q in test_results if q.get('isCorrect', False))
    
    accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Group questions by topic
    topics = {}
    for question in test_results:
        topic = question.get('topic', 'Unknown')
        if topic not in topics:
            topics[topic] = {'total': 0, 'correct': 0}
        
        topics[topic]['total'] += 1
        if question.get('isCorrect', False):
            topics[topic]['correct'] += 1
    
    # Identify weak topics (less than 60% correct)
    weak_topics = []
    for topic, stats in topics.items():
        topic_accuracy = (stats['correct'] / stats['total']) * 100 if stats['total'] > 0 else 0
        if topic_accuracy < 60:
            weak_topics.append(topic)
    
    # Generate suggested next steps
    suggested_next_steps = []
    for topic in weak_topics:
        suggested_next_steps.append(f"Review {topic} concepts and practice more problems")
    
    if not weak_topics:
        suggested_next_steps = ["Continue practicing to maintain your skills", 
                              "Try more advanced problems",
                              "Focus on interview preparation"]
    
    # Generate response
    analysis = {
        "accuracy": accuracy,
        "weakTopics": weak_topics,
        "suggestedNextSteps": suggested_next_steps
    }
    
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(debug=True)
