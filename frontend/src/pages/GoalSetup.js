import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const GoalSetup = () => {
  const { darkMode } = useTheme();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    targetCompanies: [],
    preferredDomain: '',
    techStack: [],
    expectedLPA: ''
  });

  const companies = [
    'Amazon', 'Google', 'Microsoft', 'Apple', 'Facebook', 'Netflix', 'TCS', 
    'Infosys', 'Wipro', 'Cognizant', 'IBM', 'Oracle', 'Adobe', 'Intuit'
  ];
  
  const domains = [
    'Web Development', 'App Development', 'Data Science', 'Machine Learning',
    'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain', 'IoT'
  ];
  
  const techStacks = [
    'MERN', 'MEAN', 'Java Spring Boot', 'Python Django', 'Python Flask',
    '.NET', 'Ruby on Rails', 'PHP Laravel', 'Vue.js', 'Angular', 'React Native'
  ];

  const handleCompanyToggle = (company) => {
    setFormData(prevData => {
      if (prevData.targetCompanies.includes(company)) {
        return {
          ...prevData,
          targetCompanies: prevData.targetCompanies.filter(c => c !== company)
        };
      } else {
        return {
          ...prevData,
          targetCompanies: [...prevData.targetCompanies, company]
        };
      }
    });
  };

  const handleDomainChange = (e) => {
    setFormData({
      ...formData,
      preferredDomain: e.target.value
    });
  };

  const handleTechStackToggle = (tech) => {
    setFormData(prevData => {
      if (prevData.techStack.includes(tech)) {
        return {
          ...prevData,
          techStack: prevData.techStack.filter(t => t !== tech)
        };
      } else {
        return {
          ...prevData,
          techStack: [...prevData.techStack, tech]
        };
      }
    });
  };

  const handleLPAChange = (e) => {
    setFormData({
      ...formData,
      expectedLPA: e.target.value
    });
  };

  const nextStep = () => {
    if (step === 1 && formData.targetCompanies.length === 0) {
      setError('Please select at least one target company');
      return;
    }
    
    if (step === 2 && !formData.preferredDomain) {
      setError('Please select your preferred domain');
      return;
    }
    
    if (step === 3 && formData.techStack.length === 0) {
      setError('Please select at least one technology stack');
      return;
    }
    
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.expectedLPA) {
      setError('Please enter your expected LPA');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await updateProfile({
        ...formData,
        hasCompletedGoalSetup: true
      });
      
      navigate('/skill-survey');
    } catch (err) {
      setError('Failed to save your goals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className={`rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to CrackIt.AI</h1>
            <p className="mt-2 text-lg">Let's set up your personalized placement preparation journey</p>
            
            {/* Progress Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Step {step} of 4</span>
                <span className="text-sm">{Math.round((step / 4) * 100)}% Complete</span>
              </div>
              <div className="h-2 w-full bg-gray-300 rounded-full">
                <div 
                  className="h-2 bg-blue-600 rounded-full" 
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Step 1: Target Companies */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Your Target Companies</h2>
              <p className="text-sm mb-6">Choose companies you're interested in applying to:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {companies.map(company => (
                  <div 
                    key={company}
                    onClick={() => handleCompanyToggle(company)}
                    className={`px-4 py-3 rounded-lg cursor-pointer border ${
                      formData.targetCompanies.includes(company) 
                        ? darkMode ? 'bg-blue-800 border-blue-700' : 'bg-blue-100 border-blue-300'
                        : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="mr-2"
                        checked={formData.targetCompanies.includes(company)}
                        onChange={() => {}}
                      />
                      <span>{company}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Preferred Domain */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Your Preferred Domain</h2>
              <p className="text-sm mb-6">Choose the domain you're most interested in:</p>
              
              <div className="space-y-4 mb-8">
                {domains.map(domain => (
                  <div key={domain} className="flex items-center">
                    <input
                      id={domain}
                      type="radio"
                      name="domain"
                      value={domain}
                      checked={formData.preferredDomain === domain}
                      onChange={handleDomainChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={domain} className="ml-3">
                      {domain}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Tech Stack */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Your Current Tech Stack</h2>
              <p className="text-sm mb-6">Choose technologies you're familiar with:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {techStacks.map(tech => (
                  <div 
                    key={tech}
                    onClick={() => handleTechStackToggle(tech)}
                    className={`px-4 py-3 rounded-lg cursor-pointer border ${
                      formData.techStack.includes(tech) 
                        ? darkMode ? 'bg-blue-800 border-blue-700' : 'bg-blue-100 border-blue-300'
                        : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="mr-2"
                        checked={formData.techStack.includes(tech)}
                        onChange={() => {}}
                      />
                      <span>{tech}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 4: Expected LPA */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What's Your Expected Salary?</h2>
              <p className="text-sm mb-6">Enter your expected annual package (in LPA):</p>
              
              <div className="mb-8">
                <label htmlFor="expectedLPA" className="block text-sm font-medium mb-1">Expected LPA</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="expectedLPA"
                    id="expectedLPA"
                    value={formData.expectedLPA}
                    onChange={handleLPAChange}
                    className={`block w-full pl-7 pr-12 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="0.00"
                    aria-describedby="price-currency"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                      LPA
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Your Selected Preferences</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p><strong>Target Companies:</strong> {formData.targetCompanies.join(", ")}</p>
                  <p><strong>Preferred Domain:</strong> {formData.preferredDomain}</p>
                  <p><strong>Tech Stack:</strong> {formData.techStack.join(", ")}</p>
                  <p><strong>Expected LPA:</strong> ₹{formData.expectedLPA} LPA</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={prevStep}
                className={`px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className={`px-4 py-2 rounded-md ml-auto ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded-md ml-auto ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed text-white' 
                    : darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetup;
