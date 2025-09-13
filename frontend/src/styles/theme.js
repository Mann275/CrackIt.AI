// Theme colors for consistent use across the application

export const theme = {
  colors: {
    // Primary palette
    primary: {
      light: '#6366f1', // indigo-500
      main: '#4f46e5',  // indigo-600
      dark: '#4338ca',  // indigo-700
    },
    
    // Secondary palette
    secondary: {
      light: '#10b981', // emerald-500
      main: '#059669',  // emerald-600
      dark: '#047857',  // emerald-700
    },
    
    // Accent colors
    accent: {
      purple: '#8b5cf6', // violet-500
      blue: '#3b82f6',   // blue-500
      amber: '#f59e0b',  // amber-500
      rose: '#f43f5e',   // rose-500
    },
    
    // Dark mode backgrounds
    dark: {
      bg: {
        primary: '#111827',   // gray-900
        secondary: '#1f2937', // gray-800
        card: '#374151',      // gray-700
      },
      text: {
        primary: '#f9fafb',   // gray-50
        secondary: '#e5e7eb', // gray-200
        muted: '#9ca3af',     // gray-400
      },
      border: '#374151',      // gray-700
    },
    
    // Light mode backgrounds
    light: {
      bg: {
        primary: '#ffffff',
        secondary: '#f9fafb', // gray-50
        card: '#f3f4f6',      // gray-100
      },
      text: {
        primary: '#111827',   // gray-900
        secondary: '#374151', // gray-700
        muted: '#6b7280',     // gray-500
      },
      border: '#e5e7eb',      // gray-200
    },
    
    // Feedback colors
    feedback: {
      success: '#10b981', // emerald-500
      error: '#ef4444',   // red-500
      warning: '#f59e0b', // amber-500
      info: '#3b82f6',    // blue-500
    }
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(to right, #4f46e5, #8b5cf6)', // indigo to violet
    secondary: 'linear-gradient(to right, #10b981, #3b82f6)', // emerald to blue
    accent: 'linear-gradient(to right, #8b5cf6, #ec4899)', // violet to pink
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Transitions
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  }
};

// Helper function to get theme colors based on current mode
export const getThemeColors = (isDarkMode) => {
  return {
    bg: {
      primary: isDarkMode ? theme.colors.dark.bg.primary : theme.colors.light.bg.primary,
      secondary: isDarkMode ? theme.colors.dark.bg.secondary : theme.colors.light.bg.secondary,
      card: isDarkMode ? theme.colors.dark.bg.card : theme.colors.light.bg.card,
    },
    text: {
      primary: isDarkMode ? theme.colors.dark.text.primary : theme.colors.light.text.primary,
      secondary: isDarkMode ? theme.colors.dark.text.secondary : theme.colors.light.text.secondary,
      muted: isDarkMode ? theme.colors.dark.text.muted : theme.colors.light.text.muted,
    },
    border: isDarkMode ? theme.colors.dark.border : theme.colors.light.border,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    feedback: theme.colors.feedback,
    gradients: theme.gradients,
    shadows: theme.shadows,
    transitions: theme.transitions,
  };
};
