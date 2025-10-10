import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

// Components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { toast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import Home from './components/Home';
import Features from './components/Features';
import { 
  User, 
  Target, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Award,
  Brain,
  Code,
  Users,
  Send,
  LogOut,
  Home as HomeIcon,
  Settings,
  RotateCcw
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
      return true;
    } catch (error) {
      toast({ title: "Login failed", description: error.response?.data?.detail || "Invalid credentials", variant: "destructive" });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      toast({ title: "Welcome to CrackIt.AI!", description: "Your account has been created successfully." });
      return true;
    } catch (error) {
      toast({ title: "Registration failed", description: error.response?.data?.detail || "Please try again", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    console.log('Logout initiated');
    try {
      // Clear user state first
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Show success message
      toast({ 
        title: "Logged out", 
        description: "You've been successfully logged out." 
      });
      
      console.log('Logout completed successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the state
      setUser(null);
      setToken(null);
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Pages
const AuthPage = () => {
  const { login, register } = useAuth();
  const [currentView, setCurrentView] = useState('home'); // 'home', 'features', 'login', 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    college: '',
    branch: '',
    graduation_year: 2024,
    phone: ''
  });

  // Password strength checker
  const getPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(criteria).filter(Boolean).length;
    const checks = [
      { label: 'At least 8 characters', met: criteria.length },
      { label: 'One number', met: criteria.number },
      { label: 'One uppercase letter', met: criteria.uppercase },
      { label: 'One special character', met: criteria.special }
    ];
    
    return { score, checks, isStrong: score === 4 };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleShowAuth = (type) => {
    if (type === 'login') {
      setCurrentView('login');
    } else if (type === 'register') {
      setCurrentView('register');
    } else if (type === 'features') {
      setCurrentView('features');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for registration
    if (currentView === 'register') {
      if (!passwordStrength.isStrong) {
        toast({
          title: "Weak Password",
          description: "Please create a stronger password that meets all criteria.",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please check and try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentView === 'login') {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Force hide any potential background elements
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, 100);
      }
    } else if (currentView === 'register') {
      const success = await register(formData);
      if (success) {
        // Force hide any potential background elements
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, 100);
      }
    }
  };

  // Show Home page by default
  if (currentView === 'home') {
    return (
      <div className="min-h-screen">
        <Home onShowAuth={handleShowAuth} />
      </div>
    );
  }

  // Show Features page
  if (currentView === 'features') {
    return (
      <div className="min-h-screen">
        <Features onBack={() => setCurrentView('home')} onShowAuth={handleShowAuth} />
      </div>
    );
  }

  // Show Auth Form (login/register)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 relative">
        <CardHeader className="text-center space-y-2">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('home')}
            className="absolute top-4 left-4 text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Home
          </button>
          
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">CrackIt.AI</CardTitle>
          <CardDescription className="text-slate-600">
            {currentView === 'login' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentView === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Input
                      id="college"
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({...formData, college: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              {/* Password Strength Indicator - Only show for registration */}
              {currentView === 'register' && formData.password && (
                <div className="mt-2 p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Password Strength</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.isStrong ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {passwordStrength.isStrong ? 'Strong password' : 'Weak password'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.score === 1 ? 'bg-red-500 w-1/4' :
                          passwordStrength.score === 2 ? 'bg-orange-500 w-2/4' :
                          passwordStrength.score === 3 ? 'bg-yellow-500 w-3/4' :
                          passwordStrength.score === 4 ? 'bg-green-500 w-full' : 'bg-orange-200 w-0'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-3">
                    {passwordStrength.checks.map((check, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                          check.met ? 'bg-green-500 text-white' : 'bg-orange-300 text-orange-600'
                        }`}>
                          {check.met ? '✓' : ''}
                        </div>
                        <span className={`text-xs ${
                          check.met ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password - Only show for registration */}
            {currentView === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="text-xs">
                      {formData.password === formData.confirmPassword ? '✓' : '✗'}
                    </span>
                    <span className="text-xs font-medium">
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              {currentView === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setCurrentView(currentView === 'login' ? 'register' : 'login')}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              {currentView === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">CrackIt.AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'roadmap', label: 'Roadmap', icon: Target },
                { id: 'tests', label: 'Tests', icon: BookOpen },
                { id: 'chat', label: 'Community', icon: MessageCircle },
                { id: 'profile', label: 'Profile', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === id 
                      ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [progress, setProgress] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progressRes, roadmapRes, testsRes] = await Promise.all([
        axios.get(`${API}/progress`),
        axios.get(`${API}/roadmap`),
        axios.get(`${API}/tests/history`)
      ]);
      
      setProgress(progressRes.data);
      setRoadmap(roadmapRes.data);
      setTests(testsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const readinessScore = progress?.readiness_percentage || 0;
  const recentTests = tests.slice(0, 3);
  const completedTasks = roadmap?.roadmap_items?.filter(item => item.completed).length || 0;
  const totalTasks = roadmap?.roadmap_items?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Placement Journey</h2>
        <p className="text-slate-600">Track your progress and stay motivated</p>
      </div>

      {/* Readiness Score */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Placement Readiness</h3>
              <div className="text-4xl font-bold">{Math.round(readinessScore)}%</div>
              <p className="text-orange-100 mt-2">
                {readinessScore >= 80 ? 'Excellent! You\'re almost ready' : 
                 readinessScore >= 60 ? 'Good progress, keep going!' : 
                 'Let\'s build your skills step by step'}
              </p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <Award className="h-12 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Progress Cards */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Roadmap Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-2">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-slate-600 text-sm mb-3">Tasks completed</p>
            <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Mock Tests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-2">{tests.length}</div>
            <p className="text-slate-600 text-sm mb-3">Tests completed</p>
            {recentTests.length > 0 && (
              <div className="text-sm text-slate-600">
                Latest: {Math.round(recentTests[0].score)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-2">
              {Math.max(0, completedTasks - 3)}
            </div>
            <p className="text-slate-600 text-sm">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roadmap?.roadmap_items?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
                <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.topic}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Goals Setup Component
const GoalsSetup = ({ onComplete }) => {
  const [goals, setGoals] = useState({
    target_companies: [],
    preferred_domain: '',
    expected_salary: 600000,
    tech_stack: []
  });
  const [companies, setCompanies] = useState([]);
  const [domains, setDomains] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [companiesRes, domainsRes, languagesRes] = await Promise.all([
        axios.get(`${API}/companies`),
        axios.get(`${API}/domains`),
        axios.get(`${API}/languages`)
      ]);
      
      setCompanies(companiesRes.data.companies);
      setDomains(domainsRes.data.domains);
      setLanguages(languagesRes.data.languages);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/goals`, goals);
      toast({ title: "Goals set successfully!", description: "Let's move to the skill assessment." });
      onComplete();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save goals", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set Your Career Goals</CardTitle>
          <CardDescription>Help us personalize your preparation journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">Target Companies (Select up to 5)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {companies.slice(0, 15).map(company => (
                  <label key={company} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={goals.target_companies.includes(company)}
                      onCheckedChange={(checked) => {
                        if (checked && goals.target_companies.length < 5) {
                          setGoals({...goals, target_companies: [...goals.target_companies, company]});
                        } else if (!checked) {
                          setGoals({...goals, target_companies: goals.target_companies.filter(c => c !== company)});
                        }
                      }}
                    />
                    <span className="text-sm">{company}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="domain">Preferred Domain</Label>
              <Select value={goals.preferred_domain} onValueChange={(value) => setGoals({...goals, preferred_domain: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salary">Expected Annual Salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                value={goals.expected_salary}
                onChange={(e) => setGoals({...goals, expected_salary: parseInt(e.target.value)})}
                min="100000"
                step="100000"
              />
            </div>

            <div>
              <Label>Tech Stack (Select your known technologies)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {languages.slice(0, 12).map(lang => (
                  <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={goals.tech_stack.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGoals({...goals, tech_stack: [...goals.tech_stack, lang]});
                        } else {
                          setGoals({...goals, tech_stack: goals.tech_stack.filter(t => t !== lang)});
                        }
                      }}
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Continue to Skill Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Skill Survey Component
const SkillSurvey = ({ onComplete }) => {
  const [survey, setSurvey] = useState({
    dsa_skill: 5,
    os_knowledge: 5,
    dbms_skill: 5,
    oops_understanding: 5,
    networking_knowledge: 5,
    programming_languages: [],
    project_count: 0,
    internship_experience: false,
    coding_practice_hours: 1
  });
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
    fetchExistingSurvey(); // Load existing survey data if available
  }, []);

  const fetchExistingSurvey = async () => {
    try {
      const response = await axios.get(`${API}/survey`);
      if (response.data) {
        console.log('Loading existing survey data:', response.data);
        setSurvey(response.data);
      }
    } catch (error) {
      console.log('No existing survey found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API}/languages`);
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting survey data:', survey);
      console.log('API URL:', `${API}/survey`);
      
      const response = await axios.post(`${API}/survey`, survey);
      console.log('Survey response:', response.data);
      
      toast({ 
        title: "Assessment updated!", 
        description: "Your skills assessment has been saved successfully." 
      });
      onComplete();
    } catch (error) {
      console.error('Survey submission error:', error);
      console.error('Error response:', error.response?.data);
      
      toast({ 
        title: "Error", 
        description: error.response?.data?.detail || error.message || "Failed to save assessment. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const SkillSlider = ({ label, value, onChange }) => (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label className="font-medium">{label}</Label>
        <span className="text-sm font-medium text-orange-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Beginner</span>
        <span>Expert</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onComplete} 
            className="absolute left-0 top-0 hover:bg-slate-100"
          >
            ← Back
          </Button>
          <CardTitle className="text-2xl">Skill Assessment</CardTitle>
          <CardDescription>Update your current skill level and experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Technical Skills */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Technical Skills</h3>
              
              <SkillSlider
                label="Data Structures & Algorithms"
                value={survey.dsa_skill}
                onChange={(value) => setSurvey({...survey, dsa_skill: value})}
              />
              
              <SkillSlider
                label="Operating Systems"
                value={survey.os_knowledge}
                onChange={(value) => setSurvey({...survey, os_knowledge: value})}
              />
              
              <SkillSlider
                label="Database Management"
                value={survey.dbms_skill}
                onChange={(value) => setSurvey({...survey, dbms_skill: value})}
              />
              
              <SkillSlider
                label="Object-Oriented Programming"
                value={survey.oops_understanding}
                onChange={(value) => setSurvey({...survey, oops_understanding: value})}
              />
              
              <SkillSlider
                label="Computer Networks"
                value={survey.networking_knowledge}
                onChange={(value) => setSurvey({...survey, networking_knowledge: value})}
              />
            </div>

            {/* Programming Languages */}
            <div>
              <Label className="text-base font-medium">Programming Languages (Select all you know)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {languages.map(lang => (
                  <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={survey.programming_languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSurvey({...survey, programming_languages: [...survey.programming_languages, lang]});
                        } else {
                          setSurvey({...survey, programming_languages: survey.programming_languages.filter(l => l !== lang)});
                        }
                      }}
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Experience</h3>
              
              <div>
                <Label htmlFor="projects">Number of Projects Completed</Label>
                <Input
                  id="projects"
                  type="number"
                  value={survey.project_count}
                  onChange={(e) => setSurvey({...survey, project_count: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internship"
                  checked={survey.internship_experience}
                  onCheckedChange={(checked) => setSurvey({...survey, internship_experience: checked})}
                />
                <Label htmlFor="internship">I have internship experience</Label>
              </div>

              <div>
                <Label htmlFor="practice">Daily Coding Practice (hours)</Label>
                <Input
                  id="practice"
                  type="number"
                  value={survey.coding_practice_hours}
                  onChange={(e) => setSurvey({...survey, coding_practice_hours: parseInt(e.target.value) || 0})}
                  min="0"
                  max="12"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Generate My Roadmap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Roadmap Component
const RoadmapView = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const response = await axios.get(`${API}/roadmap`);
      console.log('Roadmap response:', response.data);
      setRoadmap(response.data);
    } catch (error) {
      console.error('Failed to fetch roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      console.log('Generating roadmap...');
      
      // Check if backend is reachable
      try {
        await axios.get(`${API}/profile`);
      } catch (connectionError) {
        throw new Error("Backend server is not reachable. Please make sure the backend is running on port 8000.");
      }
      
      const response = await axios.post(`${API}/roadmap/generate`);
      console.log('Roadmap generation response:', response.data);
      
      if (response.data && response.data.roadmap_items) {
        console.log('Roadmap items count:', response.data.roadmap_items.length);
        setRoadmap(response.data);
        toast({ 
          title: "Roadmap generated!", 
          description: `Your personalized learning path with ${response.data.roadmap_items.length} tasks is ready.` 
        });
      } else {
        console.error('Invalid roadmap data:', response.data);
        throw new Error("Invalid roadmap data received");
      }
    } catch (error) {
      console.error('Roadmap generation error:', error);
      let errorMessage = "Failed to generate roadmap. Please try again.";
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = "Network error: Please check if the backend server is running and try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error: There was an issue generating your roadmap. Please try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication error: Please log in again.";
      } else if (error.message.includes('Backend server')) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetRoadmap = async () => {
    if (!window.confirm('Are you sure you want to reset your roadmap? This will permanently delete your current progress and all completed tasks.')) {
      return;
    }

    setResetting(true);
    try {
      const response = await axios.post(`${API}/roadmap/reset`);
      if (response.data.success) {
        setRoadmap(null);
        toast({ 
          title: "Roadmap Reset!", 
          description: "Your roadmap has been reset. You can now generate a new one." 
        });
      }
    } catch (error) {
      console.error('Reset roadmap error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to reset roadmap. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setResetting(false);
    }
  };

  const toggleTask = async (taskTopic, completed) => {
    try {
      const response = await axios.put(`${API}/roadmap/progress`, {
        task_topic: taskTopic,
        completed: completed
      });
      
      // Update local state with new progress from server
      setRoadmap(prev => {
        const updatedItems = prev.roadmap_items.map(item =>
          item.topic === taskTopic ? { 
            ...item, 
            completed, 
            completed_at: completed ? new Date().toISOString() : null 
          } : item
        );
        
        return {
          ...prev,
          roadmap_items: updatedItems,
          overall_progress: response.data.progress || 0
        };
      });
      
      toast({ 
        title: completed ? "Task completed!" : "Task unmarked", 
        description: `Great job ${completed ? 'completing' : 'updating'} "${taskTopic}"` 
      });
    } catch (error) {
      console.error('Progress update error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update progress. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center p-8">
        <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Roadmap Yet</h3>
        <p className="text-slate-600 mb-6">Complete your goals and skill assessment to generate a personalized roadmap.</p>
        <Button onClick={generateRoadmap} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          Generate Roadmap
        </Button>
      </div>
    );
  }

  const completedTasks = roadmap?.roadmap_items?.filter(item => item.completed).length || 0;
  const totalTasks = roadmap?.roadmap_items?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Learning Roadmap</h2>
            <p className="text-slate-600">Personalized for {roadmap.target_company} • {roadmap.domain}</p>
          </div>
          <Button
            onClick={resetRoadmap}
            disabled={resetting}
            variant="outline"
            className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{resetting ? 'Resetting...' : 'Reset Roadmap'}</span>
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Overall Progress</h3>
              <p className="text-slate-600">You've completed {completedTasks} out of {totalTasks} tasks</p>
            </div>
            <div className="text-3xl font-bold text-orange-600">{Math.round(progressPercentage)}%</div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {roadmap?.roadmap_items && roadmap.roadmap_items.length > 0 ? (
          roadmap.roadmap_items.map((item, index) => (
            <Card key={index} className={`border-0 shadow-md transition-all hover:shadow-lg ${item.completed ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleTask(item.topic, !item.completed)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-slate-300 hover:border-orange-500'
                    }`}
                  >
                    {item.completed && <CheckCircle className="h-4 w-4" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${item.completed ? 'text-green-800 line-through' : 'text-slate-800'}`}>
                        {item.topic}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}>
                          {item.priority}
                        </Badge>
                        <span className="text-sm text-slate-500">{item.estimated_hours}h</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-3">{item.description}</p>
                    
                    {item.resources && item.resources.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Resources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.resources.map((resource, idx) => (
                            <Badge key={idx} variant="outline" className="text-blue-600 border-blue-200">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Learning Tasks Found</h3>
              <p className="text-slate-600 mb-4">It looks like your roadmap doesn't have any learning tasks yet.</p>
              <Button onClick={generateRoadmap} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Regenerate Roadmap
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Mock Test Component
const MockTests = () => {
  const [currentTest, setCurrentTest] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);

  useEffect(() => {
    fetchTestHistory();
  }, []);

  useEffect(() => {
    if (currentTest && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentTest && timeRemaining === 0) {
      submitTest();
    }
  }, [timeRemaining, currentTest]);

  const fetchTestHistory = async () => {
    try {
      const response = await axios.get(`${API}/tests/history`);
      setTestHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch test history:', error);
    }
  };

  const startTest = async (testType) => {
    if (testInProgress) {
      toast({ title: "Test in progress", description: "Please complete your current test before starting a new one.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    setTestInProgress(true);
    try {
      const response = await axios.post(`${API}/test/start`, { test_type: testType });
      setCurrentTest(response.data);
      setSelectedAnswers({});
      setTimeRemaining(response.data.questions.length * 120); // 2 minutes per question
      toast({ title: "Test started!", description: `${testType} test is now active. Good luck!` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start test", variant: "destructive" });
      setTestInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!currentTest) return;
    
    setLoading(true);
    try {
      const testStartTime = new Date(currentTest.completed_at).getTime();
      const timeSpent = Math.floor((Date.now() - testStartTime) / 1000);
      
      const response = await axios.put(`${API}/test/submit`, {
        test_id: currentTest.id,
        answers: selectedAnswers,
        time_spent: timeSpent
      });
      
      toast({ 
        title: "Test completed!", 
        description: `You scored ${Math.round(response.data.score)}% (${response.data.correct_answers}/${response.data.total_questions})` 
      });
      
      setCurrentTest(null);
      setSelectedAnswers({});
      setTestInProgress(false);
      fetchTestHistory();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit test", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentTest) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Test Header */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{currentTest.test_type} Mock Test</h2>
                  <p className="text-slate-600">{currentTest.questions.length} Questions</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{formatTime(timeRemaining)}</div>
                  <p className="text-sm text-slate-600">Time Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {currentTest.questions.map((question, index) => (
              <Card key={question.question_id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {index + 1}. {question.question}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          name={question.question_id}
                          value={option}
                          checked={selectedAnswers[question.question_id] === option}
                          onChange={(e) => setSelectedAnswers({...selectedAnswers, [question.question_id]: e.target.value})}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="text-slate-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={submitTest} 
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {loading ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Mock Tests</h2>
        <p className="text-slate-600">Practice with AI-powered assessments</p>
      </div>

      {/* Test Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { type: 'DSA', title: 'Data Structures & Algorithms', description: 'Test your problem-solving skills', icon: Code },
          { type: 'Aptitude', title: 'Aptitude & Reasoning', description: 'Logical and analytical thinking', icon: Brain },
          { type: 'Technical', title: 'Technical Concepts', description: 'OS, DBMS, Networks, and more', icon: BookOpen }
        ].map(({ type, title, description, icon: Icon }) => (
          <Card key={type} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => startTest(type)}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600 mb-4">{description}</p>
              <Button 
                disabled={loading || testInProgress} 
                className="w-full"
                onClick={() => startTest(type)}
              >
                {loading ? 'Starting...' : testInProgress ? 'Test in Progress' : 'Start Test'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Test History</CardTitle>
            <CardDescription>Track your progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testHistory.map((test, index) => (
                <div key={test.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="font-semibold text-slate-800">{test.test_type} Test</h4>
                    <p className="text-sm text-slate-600">
                      {new Date(test.completed_at).toLocaleDateString()} • 
                      {test.correct_answers}/{test.total_questions} correct
                    </p>
                    {test.feedback && (
                      <p className="text-sm text-slate-600 mt-1 italic">"{test.feedback}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">{Math.round(test.score)}%</div>
                    {test.weak_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {test.weak_areas.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Chat Component
const ChatRoom = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchCompanies();
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    try {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      });
      
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setConnected(true);
        toast({ title: "Connected", description: "Chat is now active!" });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      newSocket.on('new_message', (messageData) => {
        setMessages(prev => [...prev, messageData]);
      });

      newSocket.on('user_joined', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          user_name: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          company: selectedCompany
        }]);
      });

      newSocket.on('user_left', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          user_name: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          company: selectedCompany
        }]);
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast({ title: "Connection Error", description: "Chat functionality unavailable", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchChatHistory();
      if (socket) {
        socket.emit('join_room', {
          company: selectedCompany,
          user_id: user?.id,
          user_name: user?.name
        });
      }
    }
  }, [selectedCompany, socket, user]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/chatrooms/${selectedCompany}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && connected) {
      socket.emit('send_message', {
        company: selectedCompany,
        message: newMessage,
        user_id: user?.id,
        user_name: user?.name
      });
      setNewMessage('');
    } else if (!connected) {
      toast({ title: "Connection Error", description: "Chat is not connected. Please refresh the page.", variant: "destructive" });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Company Communities</h2>
          <p className="text-slate-600">Connect with peers preparing for the same companies</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Company List */}
          <Card className="border-0 shadow-lg lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Companies</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {companies.slice(0, 10).map(company => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                      selectedCompany === company ? 'bg-orange-50 border-r-4 border-orange-500 font-medium text-orange-700' : 'text-slate-700'
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-0 shadow-lg lg:col-span-3">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                <span>{selectedCompany} Community</span>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </CardTitle>
              <CardDescription>
                Share experiences, tips, and resources 
                {connected ? ' • Connected' : ' • Disconnected'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                  <div key={message.id || index} className={`flex ${message.user_name === user?.name ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
                      message.user_name === 'System' 
                        ? 'bg-slate-100 text-slate-600 text-sm text-center mx-auto'
                        : message.user_name === user?.name
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {message.user_name !== 'System' && message.user_name !== user?.name && (
                        <div className="text-xs font-medium mb-1 text-slate-600">{message.user_name}</div>
                      )}
                      <div>{message.message}</div>
                      <div className={`text-xs mt-1 ${
                        message.user_name === user?.name ? 'text-orange-100' : 'text-slate-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedCompany} community...`}
                    className="flex-1 resize-none min-h-[40px]"
                    rows={1}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const ProfileView = ({ setSetupStep }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [goals, setGoals] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [domains, setDomains] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    if (user) {
      setProfile(user);
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [goalsRes, surveyRes, companiesRes, domainsRes, languagesRes] = await Promise.all([
        axios.get(`${API}/goals`),
        axios.get(`${API}/survey`),
        axios.get(`${API}/companies`),
        axios.get(`${API}/domains`),
        axios.get(`${API}/languages`)
      ]);
      
      console.log('Survey data loaded:', surveyRes.data); // Debug log
      setGoals(goalsRes.data);
      setSurvey(surveyRes.data);
      setCompanies(companiesRes.data.companies || []);
      setDomains(domainsRes.data.domains || []);
      setLanguages(languagesRes.data.languages || []);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API}/profile`, updates);
      setProfile(response.data);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const updateGoals = async (updatedGoals) => {
    try {
      const response = await axios.post(`${API}/goals`, updatedGoals);
      setGoals(response.data);
      setEditingGoals(false);
      toast({ title: "Goals updated!", description: "Your career goals have been updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update goals", variant: "destructive" });
    }
  };

  const GoalsEditForm = () => {
    const [editGoals, setEditGoals] = useState({
      target_companies: goals?.target_companies || [],
      preferred_domain: goals?.preferred_domain || '',
      expected_salary: goals?.expected_salary || 600000,
      tech_stack: goals?.tech_stack || []
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      updateGoals(editGoals);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-base font-medium">Target Companies (Select up to 5)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 max-h-40 overflow-y-auto">
            {companies.slice(0, 15).map(company => (
              <label key={company} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={editGoals.target_companies.includes(company)}
                  onCheckedChange={(checked) => {
                    if (checked && editGoals.target_companies.length < 5) {
                      setEditGoals({...editGoals, target_companies: [...editGoals.target_companies, company]});
                    } else if (!checked) {
                      setEditGoals({...editGoals, target_companies: editGoals.target_companies.filter(c => c !== company)});
                    }
                  }}
                />
                <span className="text-sm">{company}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="domain">Preferred Domain</Label>
          <Select value={editGoals.preferred_domain} onValueChange={(value) => setEditGoals({...editGoals, preferred_domain: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select your preferred domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map(domain => (
                <SelectItem key={domain} value={domain}>{domain}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="salary">Expected Annual Salary (₹)</Label>
          <Input
            id="salary"
            type="number"
            value={editGoals.expected_salary}
            onChange={(e) => setEditGoals({...editGoals, expected_salary: parseInt(e.target.value)})}
            min="100000"
            step="100000"
          />
        </div>

        <div>
          <Label>Tech Stack (Select your known technologies)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 max-h-40 overflow-y-auto">
            {languages.slice(0, 12).map(lang => (
              <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={editGoals.tech_stack.includes(lang)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setEditGoals({...editGoals, tech_stack: [...editGoals.tech_stack, lang]});
                    } else {
                      setEditGoals({...editGoals, tech_stack: editGoals.tech_stack.filter(t => t !== lang)});
                    }
                  }}
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            Save Goals
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditingGoals(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Profile Settings</h2>
        <p className="text-slate-600">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name || ''}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                onBlur={() => updateProfile({ name: profile.name })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                onBlur={() => updateProfile({ phone: profile.phone })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={profile.college || ''}
                  onChange={(e) => setProfile({...profile, college: e.target.value})}
                  onBlur={() => updateProfile({ college: profile.college })}
                />
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={profile.branch || ''}
                  onChange={(e) => setProfile({...profile, branch: e.target.value})}
                  onBlur={() => updateProfile({ branch: profile.branch })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Summary */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Career Goals</span>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingGoals(true)}
                disabled={!goals}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Goals
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingGoals ? (
              <GoalsEditForm />
            ) : goals ? (
              <div className="space-y-4">
                <div>
                  <Label>Target Companies</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {goals.target_companies.map(company => (
                      <Badge key={company} variant="outline">{company}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Preferred Domain</Label>
                  <p className="text-slate-600 mt-1">{goals.preferred_domain}</p>
                </div>
                <div>
                  <Label>Expected Salary</Label>
                  <p className="text-slate-600 mt-1">₹{goals.expected_salary.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Tech Stack</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {goals.tech_stack.map(tech => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No goals set yet</p>
            )}
          </CardContent>
        </Card>

        {/* Skills Summary */}
        <Card className="border-0 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Skills Assessment</span>
              </div>
              {survey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSetupStep(2)}
                  disabled={!survey}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Assessment
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {survey ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800">Technical Skills</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Data Structures & Algorithms', value: survey.dsa_skill },
                      { label: 'Operating Systems', value: survey.os_knowledge },
                      { label: 'Database Management', value: survey.dbms_skill },
                      { label: 'Object-Oriented Programming', value: survey.oops_understanding },
                      { label: 'Computer Networks', value: survey.networking_knowledge }
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span className="font-medium">{value}/10</span>
                        </div>
                        <Progress value={value * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800">Experience</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Projects Completed</span>
                      <span className="font-medium">{survey.project_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internship Experience</span>
                      <span className="font-medium">{survey.internship_experience ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Practice</span>
                      <span className="font-medium">{survey.coding_practice_hours}h</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold text-slate-800">Programming Languages</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {survey.programming_languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">No skills assessment completed yet</p>
                <Button
                  onClick={() => setSetupStep(2)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Complete Skills Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main App Component
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [setupStep, setSetupStep] = useState(0);
  const [goals, setGoals] = useState(null);
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const [goalsRes, surveyRes] = await Promise.all([
        axios.get(`${API}/goals`).catch(() => ({ data: null })),
        axios.get(`${API}/survey`).catch(() => ({ data: null }))
      ]);
      
      setGoals(goalsRes.data);
      setSurvey(surveyRes.data);
      
      if (!goalsRes.data) {
        setSetupStep(1); // Show goals setup
      } else if (!surveyRes.data) {
        setSetupStep(2); // Show survey
      } else {
        setSetupStep(0); // Setup complete
      }
    } catch (error) {
      console.error('Failed to check setup status:', error);
    }
  };

  const handleGoalsComplete = () => {
    setSetupStep(2);
    checkSetupStatus();
  };

  const handleSurveyComplete = () => {
    setSetupStep(0);
    setActiveTab('profile'); // Redirect back to profile page after survey completion
    checkSetupStatus();
  };

  // Setup flow
  if (setupStep === 1) {
    return <GoalsSetup onComplete={handleGoalsComplete} />;
  }
  
  if (setupStep === 2) {
    return <SkillSurvey onComplete={handleSurveyComplete} />;
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pb-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'tests' && <MockTests />}
        {activeTab === 'chat' && <ChatRoom />}
        {activeTab === 'profile' && <ProfileView setSetupStep={setSetupStep} />}
      </main>
    </div>
  );
};

// Root App Component
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading CrackIt.AI...</p>
        </div>
      </div>
    );
  }

  // FORCE: If user is logged in, ONLY show MainApp - NO Home component at all
  if (user) {
    return (
      <div className="App logged-in" style={{ position: 'relative', zIndex: 1000 }}>
        <MainApp />
        <Toaster />
      </div>
    );
  }

  // Only show AuthPage if user is NOT logged in
  return (
    <div className="App logged-out" style={{ position: 'relative', zIndex: 1 }}>
      <AuthPage />
      <Toaster />
    </div>
  );
}

// Root with providers
export default function AppRoot() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}