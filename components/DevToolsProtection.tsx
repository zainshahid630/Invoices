'use client';

import { useEffect, useState } from 'react';

const PROTECTION_PASSWORD = '0939d6bd';

export default function DevToolsProtection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already authenticated in this session
    const authenticated = sessionStorage.getItem('devtools_auth') === 'true';
    if (authenticated) {
      setIsAuthenticated(true);
      return;
    }

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        setShowPrompt(true);
        return false;
      }
    };

    // Detect DevTools opening by checking window size changes
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!isAuthenticated) {
          setShowPrompt(true);
        }
      }
    };

    // Detect DevTools using debugger statement
    const detectDebugger = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      
      if (end - start > 100 && !isAuthenticated) {
        setShowPrompt(true);
      }
    };

    // Disable console methods
    if (!isAuthenticated) {
      const noop = () => {};
      console.log = noop;
      console.warn = noop;
      console.error = noop;
      console.info = noop;
      console.debug = noop;
      console.table = noop;
      console.clear = noop;
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    const interval = setInterval(() => {
      detectDevTools();
      detectDebugger();
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    if (password === PROTECTION_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('devtools_auth', 'true');
      setShowPrompt(false);
    } else {
      alert('Incorrect password!');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Developer Tools Detected</h2>
        <p className="text-gray-700 mb-6">
          Access to developer tools is restricted. Please enter the password to continue.
        </p>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
