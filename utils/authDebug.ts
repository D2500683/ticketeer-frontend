// Authentication debugging utility
export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🧹 Cleared authentication storage');
};

export const checkAuthStatus = async () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Authentication Debug Info:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Test token with backend
    try {
      const response = await fetch('http://localhost:3001/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Token validation result:', data);
      
      if (!data.valid) {
        console.log('❌ Token is invalid or expired');
        console.log('💡 Solution: Clear storage and log in again');
        return false;
      } else {
        console.log('✅ Token is valid');
        return true;
      }
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  } else {
    console.log('❌ No token found');
    console.log('💡 Solution: Log in to get a new token');
    return false;
  }
};

export const fixAuthIssues = async () => {
  console.log('🔧 Running authentication fix...');
  
  const isValid = await checkAuthStatus();
  
  if (!isValid) {
    clearAuthStorage();
    console.log('🔄 Please refresh the page and log in again');
    return false;
  }
  
  console.log('✅ Authentication is working correctly');
  return true;
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    check: checkAuthStatus,
    clear: clearAuthStorage,
    fix: fixAuthIssues
  };
  
  console.log('🛠️ Auth debug tools available:');
  console.log('- window.authDebug.check() - Check auth status');
  console.log('- window.authDebug.clear() - Clear auth storage');
  console.log('- window.authDebug.fix() - Auto-fix auth issues');
}
