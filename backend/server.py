from fastapi import FastAPI, APIRouter, HTTPException, Depends, status # type: ignore
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials# type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from dotenv import load_dotenv # type: ignore
from motor.motor_asyncio import AsyncIOMotorClient # type: ignore
import os
import logging
import uuid
import bcrypt # type: ignore
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any # type: ignore
from pydantic import BaseModel, Field, EmailStr # type: ignore
from jose import JWTError, jwt # type: ignore
import socketio # type: ignore

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'crackit')
db = client[db_name]

print(f"MongoDB connection initialized with URL: {mongo_url[:20]}...")
print(f"Database name: {db_name}")

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Security
security = HTTPBearer()

# SocketIO setup with enhanced configuration for production
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",  # Allow all origins for production debugging
    logger=True,  # Enable logging for debugging
    engineio_logger=True,  # Enable engine logging
    ping_timeout=60,
    ping_interval=25,
    transports=['polling'],  # Use only polling for Render compatibility
    max_http_buffer_size=100000,
    allow_upgrades=False,  # Disable upgrades for stability
    compression=False  # Disable compression for compatibility
)

# Create the main FastAPI app
main_app = FastAPI(title="CrackIt.AI API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS for main app
main_app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://crackit-ai-frontend.onrender.com",
        "https://frontend-f1lh.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # Allow all origins for development
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"]
)

# Create socket app that combines FastAPI with SocketIO
socket_app = socketio.ASGIApp(sio, main_app)

# ===== MODELS =====

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    college: str = ""
    branch: str = ""
    graduation_year: int = 2024
    phone: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    college: str = ""
    branch: str = ""
    graduation_year: int = 2024
    phone: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Goal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    target_companies: List[str] = []
    preferred_domain: str = ""
    expected_salary: int = 0
    tech_stack: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SurveyResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    dsa_skill: int = Field(ge=1, le=10)
    os_knowledge: int = Field(ge=1, le=10)
    dbms_skill: int = Field(ge=1, le=10)
    oops_understanding: int = Field(ge=1, le=10)
    networking_knowledge: int = Field(ge=1, le=10)
    programming_languages: List[str] = []
    project_count: int = 0
    internship_experience: bool = False
    coding_practice_hours: int = 0
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoadmapItem(BaseModel):
    topic: str
    description: str
    priority: str  # High/Medium/Low
    estimated_hours: int
    resources: List[str] = []
    completed: bool = False
    completed_at: Optional[datetime] = None

class Roadmap(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    target_company: str
    domain: str
    roadmap_items: List[RoadmapItem] = []
    overall_progress: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestQuestion(BaseModel):
    question_id: str
    question: str
    options: List[str] = []
    correct_answer: str
    user_answer: str = ""
    time_taken: int = 0  # seconds

class MockTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    test_type: str  # DSA, Aptitude, Technical
    questions: List[TestQuestion] = []
    score: float = 0.0
    total_questions: int = 0
    correct_answers: int = 0
    time_spent: int = 0  # seconds
    weak_areas: List[str] = []
    feedback: str = ""
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    company: str
    message: str
    message_type: str = "text"  # text/file/image
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProgressTracker(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    readiness_percentage: float = 0.0
    category_progress: Dict[str, float] = {}
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===== HELPER FUNCTIONS =====

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_dict = await db.users.find_one({"id": user_id})
        if user_dict is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_dict)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== AI SERVICE =====

import google.generativeai as genai # type: ignore

# Configure the Gemini AI model
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

async def get_ai_response(prompt: str, system_message: str = "You are a helpful AI assistant specialized in career guidance and placement preparation.") -> str:
    try:
        # The Gemini API doesn't have a direct equivalent of a "system message" in the same way some other APIs do.
        # Instead, you can prepend instructions to your prompt.
        full_prompt = f"{system_message}\n\n{prompt}"
        
        
        response = await model.generate_content_async(full_prompt)
        print(response)
        return response.text
    except Exception as e:
        logging.error(f"AI service error: {e}")
        return "I'm sorry, I'm having trouble processing your request right now. Please try again later."


# ===== MOCK DATA =====

COMPANIES = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Adobe", 
    "Salesforce", "Oracle", "IBM", "Uber", "LinkedIn", "Twitter", "Spotify",
    "Airbnb", "Dropbox", "Slack", "Zoom", "PayPal", "Tesla"
]

TECH_DOMAINS = [
    "Full Stack Development", "Frontend Development", "Backend Development",
    "Mobile Development", "Data Science", "Machine Learning", "DevOps",
    "Cloud Computing", "Cybersecurity", "Game Development", "UI/UX Design"
]

PROGRAMMING_LANGUAGES = [
    "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "TypeScript",
    "Swift", "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB"
]

# ===== API ROUTES =====

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    user = User(**user_data.dict(exclude={"password"}))
    
    # Store user
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id})
    
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    # Find user
    user_dict = await db.users.find_one({"email": login_data.email})
    if not user_dict:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_dict["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_dict.items() if k != "password"})
    token = create_access_token({"sub": user.id})
    
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.get("/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/profile", response_model=User)
async def update_profile(updates: dict, current_user: User = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": updates}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id})
    return User(**{k: v for k, v in updated_user.items() if k != "password"})

@api_router.post("/goals", response_model=Goal)
async def set_goals(goal_data: dict, current_user: User = Depends(get_current_user)):
    goal = Goal(user_id=current_user.id, **goal_data)
    
    # Check if goals already exist for this user
    existing_goal = await db.goals.find_one({"user_id": current_user.id})
    
    if existing_goal:
        # Update existing goals
        await db.goals.update_one(
            {"user_id": current_user.id},
            {"$set": goal.dict()}
        )
    else:
        # Insert new goals
        await db.goals.insert_one(goal.dict())
    
    return goal

@api_router.get("/goals", response_model=Optional[Goal])
async def get_goals(current_user: User = Depends(get_current_user)):
    goal_dict = await db.goals.find_one({"user_id": current_user.id})
    return Goal(**goal_dict) if goal_dict else None

@api_router.post("/survey", response_model=SurveyResponse)
async def submit_survey(survey_data: dict, current_user: User = Depends(get_current_user)):
    try:
        logger.info(f"Survey submission from user {current_user.id}: {survey_data}")
        
        # Remove id if present to avoid conflicts with model's auto-generated ID
        clean_data = {k: v for k, v in survey_data.items() if k not in ['id', 'user_id']}
        
        # Check if survey already exists for this user
        existing_survey = await db.surveys.find_one({"user_id": current_user.id})
        
        if existing_survey:
            # Update existing survey - preserve the existing ID and user_id
            survey = SurveyResponse(
                id=existing_survey["id"], 
                user_id=current_user.id, 
                **clean_data
            )
            await db.surveys.update_one(
                {"user_id": current_user.id},
                {"$set": survey.dict()}
            )
            logger.info(f"Updated existing survey for user {current_user.id}")
        else:
            # Create new survey with auto-generated ID
            survey = SurveyResponse(user_id=current_user.id, **clean_data)
            await db.surveys.insert_one(survey.dict())
            logger.info(f"Created new survey for user {current_user.id}")
        
        return survey
    except Exception as e:
        logger.error(f"Survey submission error for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Survey submission failed: {str(e)}")

@api_router.get("/survey", response_model=Optional[SurveyResponse])
async def get_survey(current_user: User = Depends(get_current_user)):
    survey_dict = await db.surveys.find_one({"user_id": current_user.id})
    return SurveyResponse(**survey_dict) if survey_dict else None

@api_router.post("/roadmap/generate", response_model=Roadmap)
async def generate_roadmap(current_user: User = Depends(get_current_user)):
    # Get user goals and survey
    goal_dict = await db.goals.find_one({"user_id": current_user.id})
    survey_dict = await db.surveys.find_one({"user_id": current_user.id})
    
    if not goal_dict or not survey_dict:
        raise HTTPException(status_code=400, detail="Please complete your goals and skill survey first")
    
    goal = Goal(**goal_dict)
    survey = SurveyResponse(**survey_dict)
    
    # Generate AI roadmap
    prompt = f"""
    Generate a highly personalized placement preparation roadmap based on this SPECIFIC user profile:

    USER PROFILE:
    - Target Companies: {', '.join(goal.target_companies)}
    - Domain: {goal.preferred_domain}
    - Expected Salary: ₹{goal.expected_salary}
    - Tech Stack: {', '.join(goal.tech_stack)}
    
    CURRENT SKILL LEVELS (1-10 scale):
    - DSA: {survey.dsa_skill}/10
    - Operating Systems: {survey.os_knowledge}/10 
    - Database Management: {survey.dbms_skill}/10
    - Object-Oriented Programming: {survey.oops_understanding}/10
    - Computer Networks: {survey.networking_knowledge}/10
    
    EXPERIENCE PROFILE:
    - Programming Languages: {', '.join(survey.programming_languages)}
    - Projects Completed: {survey.project_count}
    - Internship Experience: {'Yes' if survey.internship_experience else 'No'}
    - Daily Practice Hours: {survey.coding_practice_hours}
    
    INSTRUCTIONS:
    Create a UNIQUE roadmap with 15-20 learning topics that:
    1. Focuses heavily on {goal.preferred_domain} specific skills
    2. Prioritizes weak areas (skills rated below 7/10)
    3. Matches {', '.join(goal.target_companies)} company requirements
    4. Considers the user's current experience level
    5. Includes domain-specific technologies from their tech stack: {', '.join(goal.tech_stack)}
    
    Each topic should have:
    - topic: Clear, specific topic name
    - description: 1-2 sentences explaining why it's important for this user
    - priority: High/Medium/Low based on user's weak areas and target companies
    - estimated_hours: Realistic hours needed based on current skill level
    - resources: 2-3 specific resources (prefer user's programming languages when possible)
    
    Return ONLY a JSON array of objects with the above keys.
    """
    
    ai_response = await get_ai_response(prompt, "You are an expert career coach specializing in tech placements. Create personalized roadmaps that address individual weaknesses and company-specific requirements.")
    
    # Parse AI response and create roadmap items
    roadmap_items = []
    try:
        import json
        import re
        
        # First try to extract JSON array from response
        start_idx = ai_response.find('[')
        end_idx = ai_response.rfind(']') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = ai_response[start_idx:end_idx]
            # Clean up any potential formatting issues
            json_str = re.sub(r'\n\s*', ' ', json_str)  # Remove newlines
            json_str = re.sub(r'}\s*{', '},{', json_str)  # Fix missing commas
            
            items_data = json.loads(json_str)
            
            for item in items_data[:20]:  # Limit to 20 items
                # Ensure all required fields are present with defaults
                roadmap_item = RoadmapItem(
                    topic=item.get('topic', 'Learning Topic'),
                    description=item.get('description', 'Important skill to master'),
                    priority=item.get('priority', 'Medium'),
                    estimated_hours=int(item.get('estimated_hours', 20)),
                    resources=item.get('resources', ['Practice and study materials'])
                )
                roadmap_items.append(roadmap_item)
                
    except Exception as e:
        print(f"Failed to parse AI response: {e}")
        # Continue with fallback items
    
    # If parsing failed or returned no items, use enhanced personalized default items
    if not roadmap_items:
        # Get user's weak areas (skills below 7)
        weak_skills = []
        if survey.dsa_skill < 7:
            weak_skills.extend(['DSA', 'Algorithms', 'Data Structures'])
        if survey.os_knowledge < 7:
            weak_skills.append('Operating Systems')
        if survey.dbms_skill < 7:
            weak_skills.append('Database Management')
        if survey.oops_understanding < 7:
            weak_skills.append('Object-Oriented Programming')
        if survey.networking_knowledge < 7:
            weak_skills.append('Computer Networks')
        
        # Domain-specific roadmaps
        if 'Frontend' in goal.preferred_domain or 'Frontend Development' in goal.preferred_domain:
            domain_items = [
                RoadmapItem(topic="React.js Advanced Concepts", description="Master hooks, context, and state management for modern React applications", priority="High", estimated_hours=35, resources=["React Official Documentation", "Frontend Masters React Course", "React TypeScript Cheatsheet"]),
                RoadmapItem(topic="JavaScript ES6+ Features", description="Deep dive into modern JavaScript features and async programming", priority="High", estimated_hours=25, resources=["MDN JavaScript Guide", "JavaScript.info", "ES6 Features Guide"]),
                RoadmapItem(topic="CSS Grid & Flexbox Mastery", description="Master modern CSS layout techniques for responsive design", priority="High", estimated_hours=20, resources=["CSS Grid Guide", "Flexbox Froggy", "CSS-Tricks Flexbox Guide"]),
                RoadmapItem(topic="Frontend Performance Optimization", description="Learn techniques to optimize web application performance", priority="Medium", estimated_hours=30, resources=["Web.dev Performance", "Chrome DevTools Guide", "Frontend Performance Checklist"])
            ]
        elif 'Backend' in goal.preferred_domain or 'Full Stack' in goal.preferred_domain:
            domain_items = [
                RoadmapItem(topic="REST API Design Principles", description="Master RESTful API design and best practices", priority="High", estimated_hours=25, resources=["REST API Tutorial", "API Design Best Practices", "Postman API Testing"]),
                RoadmapItem(topic="Database Optimization", description="Learn query optimization and database performance tuning", priority="High", estimated_hours=35, resources=["SQL Performance Tuning", "Database Indexing Guide", "Query Optimization Techniques"]),
                RoadmapItem(topic="Microservices Architecture", description="Understand distributed systems and microservices patterns", priority="Medium", estimated_hours=40, resources=["Microservices Patterns", "System Design Primer", "Docker & Kubernetes Basics"])
            ]
        elif 'Data Science' in goal.preferred_domain or 'Machine Learning' in goal.preferred_domain:
            domain_items = [
                RoadmapItem(topic="Statistics and Probability", description="Master statistical concepts essential for data analysis", priority="High", estimated_hours=30, resources=["Khan Academy Statistics", "Think Stats", "Statistical Learning with R"]),
                RoadmapItem(topic="Machine Learning Algorithms", description="Understand supervised and unsupervised learning algorithms", priority="High", estimated_hours=45, resources=["Scikit-learn Documentation", "Andrew Ng ML Course", "Hands-on ML Book"]),
                RoadmapItem(topic="Data Visualization", description="Learn to create meaningful visualizations and dashboards", priority="Medium", estimated_hours=25, resources=["Matplotlib/Seaborn Tutorials", "Tableau Basics", "D3.js for Web Viz"])
            ]
        else:
            domain_items = []
        
        # Skill-based items (focus on weak areas)
        skill_items = []
        if 'DSA' in weak_skills:
            skill_items.extend([
                RoadmapItem(topic="Array and String Manipulation", description="Master fundamental array and string algorithms", priority="High", estimated_hours=25, resources=["LeetCode Array Problems", "GeeksforGeeks Arrays", "Striver's A2Z DSA Sheet"]),
                RoadmapItem(topic="Dynamic Programming Mastery", description="Solve complex optimization problems using DP", priority="High", estimated_hours=35, resources=["DP Playlist by Aditya Verma", "LeetCode DP Problems", "CSES Problem Set"])
            ])
        
        if 'Operating Systems' in weak_skills:
            skill_items.append(
                RoadmapItem(topic="Process Management & Threading", description="Understand process scheduling and synchronization", priority="Medium", estimated_hours=20, resources=["Operating System Concepts", "GeeksforGeeks OS", "YouTube OS Tutorials"])
            )
        
        # Core technical items
        core_items = [
            RoadmapItem(topic="System Design Fundamentals", description="Learn scalability patterns and distributed system concepts", priority="High", estimated_hours=30, resources=["System Design Primer", "Designing Data Intensive Applications", "High Scalability Blog"]),
            RoadmapItem(topic="Git and Version Control", description="Master collaborative development with Git workflows", priority="Medium", estimated_hours=15, resources=["Git Documentation", "Atlassian Git Tutorials", "GitHub Workflow Guide"]),
            RoadmapItem(topic="Testing and Debugging", description="Learn unit testing and debugging methodologies", priority="Medium", estimated_hours=25, resources=["Testing Best Practices", f"{survey.programming_languages[0] if survey.programming_languages else 'Python'} Testing Framework", "Debugging Techniques"]),
            RoadmapItem(topic="Code Review and Best Practices", description="Understand clean code principles and review processes", priority="Medium", estimated_hours=20, resources=["Clean Code Book", "Code Review Best Practices", "Refactoring Techniques"])
        ]
        
        # Company-specific items
        company_items = []
        if 'Google' in goal.target_companies or 'Microsoft' in goal.target_companies:
            company_items.append(
                RoadmapItem(topic="Advanced Algorithm Optimization", description="Master complex algorithms for FAANG interviews", priority="High", estimated_hours=40, resources=["Elements of Programming Interviews", "Cracking the Coding Interview", "LeetCode Hard Problems"])
            )
        
        # Combine all items based on user profile
        all_items = domain_items + skill_items + core_items + company_items
        
        # Select top 15 items, prioritizing High priority items
        high_priority = [item for item in all_items if item.priority == "High"]
        medium_priority = [item for item in all_items if item.priority == "Medium"]
        
        roadmap_items = (high_priority + medium_priority)[:15]
    
    # Create roadmap with proper progress calculation
    company = goal.target_companies[0] if goal.target_companies else "General"
    
    # Calculate initial progress (all items start as incomplete)
    total_items = len(roadmap_items)
    completed_items = sum(1 for item in roadmap_items if item.completed)
    initial_progress = (completed_items / total_items * 100) if total_items > 0 else 0.0
    
    roadmap = Roadmap(
        user_id=current_user.id,
        target_company=company,
        domain=goal.preferred_domain,
        roadmap_items=roadmap_items,
        overall_progress=initial_progress
    )
    
    # Delete any existing roadmap for this user first
    await db.roadmaps.delete_many({"user_id": current_user.id})
    
    await db.roadmaps.insert_one(roadmap.dict())
    return roadmap

@api_router.get("/roadmap", response_model=Optional[Roadmap])
async def get_roadmap(current_user: User = Depends(get_current_user)):
    roadmap_dict = await db.roadmaps.find_one({"user_id": current_user.id})
    return Roadmap(**roadmap_dict) if roadmap_dict else None

@api_router.post("/roadmap/reset")
async def reset_roadmap(current_user: User = Depends(get_current_user)):
    """Reset user's roadmap - deletes existing roadmap so new one can be generated"""
    try:
        # Delete all existing roadmaps for this user
        result = await db.roadmaps.delete_many({"user_id": current_user.id})
        
        return {
            "success": True,
            "message": "Roadmap reset successfully",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        logging.error(f"Reset roadmap error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset roadmap")

@api_router.put("/roadmap/progress")
async def update_progress(updates: dict, current_user: User = Depends(get_current_user)):
    task_topic = updates.get("task_topic")
    completed = updates.get("completed", False)
    
    roadmap_dict = await db.roadmaps.find_one({"user_id": current_user.id})
    if not roadmap_dict:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Update the specific task
    update_query = {
        "$set": {
            f"roadmap_items.$[elem].completed": completed,
            f"roadmap_items.$[elem].completed_at": datetime.now(timezone.utc) if completed else None,
            "updated_at": datetime.now(timezone.utc)
        }
    }
    
    await db.roadmaps.update_one(
        {"user_id": current_user.id},
        update_query,
        array_filters=[{"elem.topic": task_topic}]
    )
    
    # Recalculate overall progress
    updated_roadmap = await db.roadmaps.find_one({"user_id": current_user.id})
    total_items = len(updated_roadmap["roadmap_items"])
    completed_items = sum(1 for item in updated_roadmap["roadmap_items"] if item["completed"])
    progress = (completed_items / total_items * 100) if total_items > 0 else 0
    
    await db.roadmaps.update_one(
        {"user_id": current_user.id},
        {"$set": {"overall_progress": progress}}
    )
    
    return {"progress": progress}

@api_router.post("/test/start", response_model=MockTest)
async def start_mock_test(test_data: dict, current_user: User = Depends(get_current_user)):
    test_type = test_data.get("test_type", "DSA")
    
    # Generate sample questions (in real app would be from question bank)
    sample_questions = [
        TestQuestion(
            question_id=str(uuid.uuid4()),
            question="What is the time complexity of binary search?",
            options=["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct_answer="O(log n)"
        ),
        TestQuestion(
            question_id=str(uuid.uuid4()),
            question="Which data structure uses LIFO principle?",
            options=["Queue", "Stack", "Array", "Tree"],
            correct_answer="Stack"
        ),
        TestQuestion(
            question_id=str(uuid.uuid4()),
            question="What is the worst-case time complexity of quick sort?",
            options=["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
            correct_answer="O(n²)"
        )
    ]
    
    mock_test = MockTest(
        user_id=current_user.id,
        test_type=test_type,
        questions=sample_questions,
        total_questions=len(sample_questions)
    )
    
    await db.mock_tests.insert_one(mock_test.dict())
    return mock_test

@api_router.put("/test/submit")
async def submit_test(submission: dict, current_user: User = Depends(get_current_user)):
    test_id = submission.get("test_id")
    answers = submission.get("answers", {})
    time_spent = submission.get("time_spent", 0)
    
    # Get test
    test_dict = await db.mock_tests.find_one({"id": test_id, "user_id": current_user.id})
    if not test_dict:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Calculate score
    correct_count = 0
    total_questions = len(test_dict["questions"])
    weak_areas = []
    
    for question in test_dict["questions"]:
        user_answer = answers.get(question["question_id"], "")
        if user_answer == question["correct_answer"]:
            correct_count += 1
        else:
            # Add to weak areas (simplified)
            if "complexity" in question["question"].lower():
                weak_areas.append("Time Complexity")
            elif "data structure" in question["question"].lower():
                weak_areas.append("Data Structures")
    
    score = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    # Generate AI feedback
    feedback_prompt = f"""
    Analyze this mock test performance:
    - Score: {score}%
    - Correct: {correct_count}/{total_questions}
    - Time: {time_spent} seconds
    - Weak areas: {', '.join(weak_areas) if weak_areas else 'None identified'}
    
    Provide constructive feedback and specific improvement suggestions in 2-3 sentences.
    """
    
    feedback = await get_ai_response(feedback_prompt, "You are a coding interview coach providing actionable feedback.")
    
    # Update test results
    await db.mock_tests.update_one(
        {"id": test_id},
        {
            "$set": {
                "score": score,
                "correct_answers": correct_count,
                "time_spent": time_spent,
                "weak_areas": list(set(weak_areas)),
                "feedback": feedback,
                "completed_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_questions,
        "feedback": feedback,
        "weak_areas": weak_areas
    }

@api_router.get("/tests/history", response_model=List[MockTest])
async def get_test_history(current_user: User = Depends(get_current_user)):
    tests = await db.mock_tests.find({"user_id": current_user.id}).to_list(1000)
    return [MockTest(**test) for test in tests]

@api_router.get("/progress", response_model=ProgressTracker)
async def get_progress(current_user: User = Depends(get_current_user)):
    # Calculate readiness based on roadmap completion and test scores
    roadmap_dict = await db.roadmaps.find_one({"user_id": current_user.id})
    tests = await db.mock_tests.find({"user_id": current_user.id}).to_list(1000)
    
    readiness = 0
    category_progress = {}
    
    if roadmap_dict:
        # Roadmap progress (50% weight)
        roadmap_progress = roadmap_dict.get("overall_progress", 0)
        readiness += roadmap_progress * 0.5
        
        category_progress["roadmap"] = roadmap_progress
    
    if tests:
        # Test performance (50% weight)
        completed_tests = [t for t in tests if t.get("completed_at")]
        if completed_tests:
            avg_score = sum(t.get("score", 0) for t in completed_tests) / len(completed_tests)
            readiness += avg_score * 0.5
            category_progress["tests"] = avg_score
    
    progress = ProgressTracker(
        user_id=current_user.id,
        readiness_percentage=min(readiness, 100),
        category_progress=category_progress
    )
    
    # Store/update progress
    await db.progress.update_one(
        {"user_id": current_user.id},
        {"$set": progress.dict()},
        upsert=True
    )
    
    return progress

@api_router.get("/companies")
async def get_companies():
    return {"companies": COMPANIES}

@api_router.get("/domains")
async def get_domains():
    return {"domains": TECH_DOMAINS}

@api_router.get("/languages")
async def get_languages():
    return {"languages": PROGRAMMING_LANGUAGES}

@api_router.get("/chatrooms/{company}/messages")
async def get_chat_history(company: str, limit: int = 100):
    messages = await db.chat_messages.find({"company": company}).sort("timestamp", -1).limit(limit).to_list(limit)
    return [ChatMessage(**msg) for msg in reversed(messages)]

# ===== SOCKET.IO EVENTS =====

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

@sio.event
async def join_room(sid, data):
    company = data.get("company")
    user_id = data.get("user_id")
    user_name = data.get("user_name", "Anonymous")
    
    await sio.enter_room(sid, company)
    await sio.emit('user_joined', {
        'user_name': user_name,
        'message': f'{user_name} joined the {company} room'
    }, room=company)

@sio.event
async def leave_room(sid, data):
    company = data.get("company")
    user_name = data.get("user_name", "Anonymous")
    
    await sio.leave_room(sid, company)
    await sio.emit('user_left', {
        'user_name': user_name,
        'message': f'{user_name} left the {company} room'
    }, room=company)

@sio.event
async def send_message(sid, data):
    company = data.get("company")
    message_text = data.get("message")
    user_id = data.get("user_id")
    user_name = data.get("user_name", "Anonymous")
    
    # Store message in database
    message = ChatMessage(
        user_id=user_id,
        user_name=user_name,
        company=company,
        message=message_text
    )
    
    await db.chat_messages.insert_one(message.dict())
    
    # Broadcast to room
    await sio.emit('new_message', {
        'id': message.id,
        'user_name': user_name,
        'message': message_text,
        'timestamp': message.timestamp.isoformat(),
        'company': company
    }, room=company)

# Include router in app
main_app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code here
    logger.info("Starting CrackIt.AI server...")
    logger.info(f"Socket.IO server configured with transports: {sio.transport}")
    yield
    # Shutdown code here
    logger.info("Shutting down CrackIt.AI server...")
    client.close()

# Update the main_app with lifespan instead of creating a new one
main_app.router.lifespan_context = lifespan


# Add CORS preflight handler
@main_app.options("/{full_path:path}")
async def preflight_handler(request, full_path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Remove explicit Socket.IO endpoints - let ASGIApp handle them automatically

# Add health check endpoint
@main_app.get("/")
async def root():
    return {"message": "CrackIt.AI API is running!", "status": "healthy", "socketio": "enabled"}

@main_app.get("/health")
async def health_check():
    try:
        # Test database connection
        await client.admin.command('ping')
        return {
            "status": "healthy", 
            "database": "connected", 
            "db_name": db.name,
            "socketio_configured": sio is not None,
            "cors_origins": "*"
        }
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Export the socket app for the ASGI server
app = socket_app

# Add explicit Socket.IO health check endpoint
@main_app.get("/socket.io/health")
async def socket_health():
    return {"socket_io": "ready", "status": "ok"}

# Debug route to check Socket.IO status
@main_app.get("/socket-debug")
async def socket_debug():
    return {
        "socket_io_configured": sio is not None,
        "transport_modes": ["polling", "websocket"],
        "cors_origins": [
            "https://crackit-ai-frontend.onrender.com",
            "https://frontend-f1lh.onrender.com",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "*"
        ],
        "socketio_path": "socket.io",
        "async_mode": "asgi"
    }

# Socket.IO endpoints handled automatically by ASGIApp

# Make sure both apps are available for different deployment scenarios
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, ws="websockets")