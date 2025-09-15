import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { toast } from 'react-hot-toast';

const GoalSetup = () => {
  const { colors } = useTheme();
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
      toast.error('Please select at least one target company');
      return;
    }
    
    if (step === 2 && !formData.preferredDomain) {
      toast.error('Please select your preferred domain');
      return;
    }
    
    if (step === 3 && formData.techStack.length === 0) {
      toast.error('Please select at least one technology stack');
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
      toast.error('Please enter your expected LPA');
      return;
    }
    
    setLoading(true);
    
    try {
      await updateProfile({
        goals: {
          ...formData,
          hasCompletedGoalSetup: true
        }
      });

      toast.success('Goals saved successfully!');
      navigate('/skill-survey');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="min-h-screen">
      <BackButton />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to CrackIt.AI</h1>
            <p className="mt-2 text-lg">Let's set up your personalized placement preparation journey</p>
            
            {/* Progress Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Step {step} of 4</span>
                <span className="text-sm">{Math.round((step / 4) * 100)}% Complete</span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ backgroundColor: colors.surface }}>
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${(step / 4) * 100}%`,
                    backgroundColor: colors.primary
                  }}
                ></div>
              </div>
            </div>
          </div>
          
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
                    className="px-4 py-3 rounded-lg cursor-pointer border"
                    style={{ 
                      backgroundColor: formData.targetCompanies.includes(company) ? colors.primary + '20' : colors.surface,
                      borderColor: formData.targetCompanies.includes(company) ? colors.primary : colors.border
                    }}
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
                      className="h-4 w-4"
                      style={{ accentColor: colors.primary }}
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
                    className="px-4 py-3 rounded-lg cursor-pointer border"
                    style={{ 
                      backgroundColor: formData.techStack.includes(tech) ? colors.primary + '20' : colors.surface,
                      borderColor: formData.techStack.includes(tech) ? colors.primary : colors.border
                    }}
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
                    <span style={{ color: colors.textSecondary }}>₹</span>
                  </div>
                  <input
                    type="number"
                    name="expectedLPA"
                    id="expectedLPA"
                    value={formData.expectedLPA}
                    onChange={handleLPAChange}
                    className="block w-full pl-7 pr-12 py-2 rounded-md"
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    placeholder="0.00"
                    aria-describedby="price-currency"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span style={{ color: colors.textSecondary }} id="price-currency">
                      LPA
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Your Selected Preferences</h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
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
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 rounded-md"
                style={{ backgroundColor: colors.surface }}
              >
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 rounded-md"
                style={{ backgroundColor: colors.surface }}
              >
                Cancel
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-md"
                style={{ backgroundColor: colors.primary, color: colors.buttonText }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-md"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.buttonText,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : 'Start Survey'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetup;