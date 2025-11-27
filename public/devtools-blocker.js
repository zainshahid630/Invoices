// DevTools Blocker - Password: 0939d6bd
(function() {
  'use strict';
  
  const PASSWORD = '0939d6bd';
  let isAuthenticated = false;

  // Check session storage
  if (sessionStorage.getItem('devtools_auth') === 'true') {
    isAuthenticated = true;
    return;
  }

  // Disable console
  const disableConsole = () => {
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp'];
    
    methods.forEach(method => {
      window.console[method] = noop;
    });
  };

  // Detect DevTools
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if ((widthThreshold || heightThreshold) && !isAuthenticated) {
      blockAccess();
    }
  };

  // Block access
  const blockAccess = () => {
    document.body.innerHTML = '';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;display:flex;align-items:center;justify-content:center;';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:white;padding:40px;border-radius:10px;max-width:400px;text-align:center;';
    box.innerHTML = `
      <h2 style="color:#dc2626;margin-bottom:20px;font-size:24px;">⚠️ Access Restricted</h2>
      <p style="color:#374151;margin-bottom:20px;">Developer tools are disabled. Enter password to continue.</p>
      <input type="password" id="devtools-pwd" placeholder="Enter password" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:5px;margin-bottom:15px;font-size:16px;" />
      <button id="devtools-submit" style="width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;">Unlock</button>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    document.getElementById('devtools-submit').onclick = () => {
      const pwd = document.getElementById('devtools-pwd').value;
      if (pwd === PASSWORD) {
        isAuthenticated = true;
        sessionStorage.setItem('devtools_auth', 'true');
        location.reload();
      } else {
        alert('Incorrect password!');
      }
    };
    
    document.getElementById('devtools-pwd').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('devtools-submit').click();
      }
    });
  };

  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!isAuthenticated) {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Cmd+Option+I, Cmd+Option+J, Cmd+Option+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.key === 'U')
      ) {
        e.preventDefault();
        blockAccess();
        return false;
      }
    }
  });

  // Disable console
  if (!isAuthenticated) {
    disableConsole();
  }

  // Continuous detection
  setInterval(() => {
    if (!isAuthenticated) {
      detectDevTools();
      
      // Debugger detection
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        blockAccess();
      }
    }
  }, 1000);

  // Detect if DevTools is open on load
  detectDevTools();
})();
