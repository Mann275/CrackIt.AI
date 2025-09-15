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
    
    // Dark mode backgrounds with improved contrast and softer colors
    dark: {
      bg: {
        primary: '#0A0F1F',   // Deeper blue-black
        secondary: '#111827', // Refined dark blue
        card: '#1F2937',      // Softer card background
        cardHover: '#374151', // Lighter hover state
        elevated: '#2D3748',  // Elevated elements
      },
      text: {
        primary: '#F9FAFB',   // Crisp white
        secondary: '#E5E7EB', // Very light gray
        muted: '#9CA3AF',     // Muted text
      },
      border: '#374151',      // Refined border
      divider: '#4B5563',     // Subtle divider
    },
    
    // Light mode backgrounds with subtle off-white
    light: {
      bg: {
        primary: '#F8FAFC',   // slate-50
        secondary: '#FFFFFF', // white
        card: '#FFFFFF',      // white
        cardHover: '#F1F5F9', // slate-100
        elevated: '#F1F5F9',  // slate-100
      },
      text: {
        primary: '#0F172A',   // slate-900
        secondary: '#334155', // slate-700
        muted: '#64748B',     // slate-500
      },
      border: '#E2E8F0',      // slate-200
      divider: '#CBD5E1',     // slate-300
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
  
  // Enhanced shadows with dark mode variants
  shadows: {
    light: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      hover: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    },
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      hover: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    }
  },
  
  // Refined transitions for smoother animations
  transitions: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    height: 'max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Card styles
  card: {
    borderRadius: '1rem',
    padding: '1.5rem',
    gap: '1rem',
    hover: {
      transform: 'translateY(-2px)',
    }
  }
};

// Enhanced helper function to get theme colors based on current mode
export const getThemeColors = (isDarkMode) => {
  const mode = isDarkMode ? 'dark' : 'light';
  return {
    bg: {
      ...theme.colors[mode].bg,
    },
    text: {
      ...theme.colors[mode].text,
    },
    border: theme.colors[mode].border,
    divider: theme.colors[mode].divider,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    feedback: theme.colors.feedback,
    gradients: theme.gradients,
    shadows: theme.shadows[mode],
    transitions: theme.transitions,
    card: {
      ...theme.card,
      background: theme.colors[mode].bg.card,
      hoverBackground: theme.colors[mode].bg.cardHover,
      shadow: theme.shadows[mode].md,
      hoverShadow: theme.shadows[mode].hover,
    },
  };
};
