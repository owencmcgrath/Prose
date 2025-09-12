import { app, BrowserWindow, Menu, nativeTheme } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development';
const port = isDev ? 3000 : 8080;

// Set app name early
app.setName('Prose');

// Set about panel options for macOS
app.setAboutPanelOptions({
  applicationName: 'Prose',
  applicationVersion: '1.0.0',
  version: '1.0.0',
  copyright: '© 2025 Prose',
  credits: 'In loving memory of Philip King'
});

function findNodeBinary() {
  // Common Node.js locations to try
  const commonPaths = [
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    '/usr/bin/node',
    // Try to find via which command with extended PATH
    process.env.HOME + '/.nvm/versions/node/v22.17.0/bin/node'
  ];
  
  // First try the current process.env PATH
  try {
    const result = execSync('which node', { 
      env: { 
        ...process.env, 
        PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin:' + process.env.HOME + '/.nvm/versions/node/v22.17.0/bin'
      }
    }).toString().trim();
    if (result && fs.existsSync(result)) {
      console.log('Found node via which:', result);
      return result;
    }
  } catch (e) {
    console.log('which command failed, trying common paths');
  }
  
  // Try common paths
  for (const nodePath of commonPaths) {
    if (fs.existsSync(nodePath)) {
      console.log('Found node at:', nodePath);
      return nodePath;
    }
  }
  
  // Fallback to just 'node' and hope it's in PATH
  console.log('Using fallback: node');
  return 'node';
}

function startServer() {
  if (!isDev) {
    console.log('Starting production server...');
    
    // Check if running from asar archive
    const isPackaged = __dirname.includes('app.asar');
    let serverPath;
    let workingDir;
    
    if (isPackaged) {
      // In packaged app, unpacked files are in app.asar.unpacked
      workingDir = __dirname.replace('app.asar', 'app.asar.unpacked');
      serverPath = path.join(workingDir, 'server.js');
    } else {
      workingDir = __dirname;
      serverPath = path.join(__dirname, 'server.js');
    }
    
    console.log('Server path:', serverPath);
    console.log('Working dir:', workingDir);
    
    const nodeBinary = findNodeBinary();
    console.log('Using node binary:', nodeBinary);
    
    // Get userData path for storing database
    const userDataPath = app.getPath('userData');
    console.log('User data path:', userDataPath);
    
    serverProcess = spawn(nodeBinary, [serverPath], {
      cwd: workingDir,
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        USER_DATA_PATH: userDataPath,
        PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin:' + process.env.HOME + '/.nvm/versions/node/v22.17.0/bin'
      }
    });

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      // Listen for server output and ready signal
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Server: ${output.trim()}`);
        
        if (output.includes('Server running on port') && !resolved) {
          resolved = true;
          console.log('Server is ready');
          setTimeout(resolve, 1000); // Small delay to ensure server is fully ready
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });
      
      serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });
      
      // Fallback timeout after 8 seconds
      setTimeout(() => {
        if (!resolved) {
          console.log('Server startup timeout - proceeding anyway');
          resolved = true;
          resolve();
        }
      }, 8000);
    });
  }
  console.log('Development mode - expecting external server');
  return Promise.resolve();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#ffffff',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    show: true // Show immediately
  });

  // Set Content Security Policy to allow OpenAI API calls
  const session = mainWindow.webContents.session;
  session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:* ws://localhost:*; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*; " +
          "style-src 'self' 'unsafe-inline' http://localhost:*; " +
          "img-src 'self' data: http://localhost:*; " +
          "connect-src 'self' http://localhost:* ws://localhost:* https://api.openai.com; " +
          "font-src 'self' data:;"
        ]
      }
    });
  });

  const url = isDev 
    ? `http://localhost:${port}`
    : `http://localhost:${port}`;

  console.log(`Loading URL: ${url}`);
  
  // Retry loading URL with backoff
  const loadWithRetry = async (retries = 6, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Loading attempt ${i + 1}/${retries}`);
        await mainWindow.loadURL(url);
        console.log('Successfully loaded URL');
        return;
      } catch (err) {
        console.error(`Load attempt ${i + 1} failed:`, err.message);
        if (i < retries - 1) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        } else {
          // Final fallback - show error page
          console.error('All retry attempts failed, showing error page');
          await mainWindow.loadURL(`data:text/html,<h1>Error loading app</h1><p>Could not connect to server after ${retries} attempts</p><p>URL: ${url}</p><button onclick="window.location.reload()">Retry</button>`);
        }
      }
    }
  };
  
  loadWithRetry();
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Document',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-document');
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-document');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  createMenu();
  
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error('Server startup failed:', error);
    // Still create window even if server fails
    createWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});