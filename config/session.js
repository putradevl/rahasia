const session = require('express-session');
const path = require('path');

// Session configuration
function createSessionConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  const baseConfig = {
    secret: process.env.SESSION_SECRET || 'a8f5f167f44f4964e6c998dee827110c134cf0c1a1e5f8f4e9c5f8e3b7c1d2a3
',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'strict' : 'lax'
    },
    name: 'kitanime.sid'
  };

  // Use SQLite store for production and Vercel deployment
  if (isProduction || isVercel) {
    try {
      const SQLiteStore = require('connect-sqlite3')(session);
      
      // For Vercel, use /tmp directory which is writable
      const dbPath = isVercel 
        ? '/tmp/sessions.db' 
        : path.join(__dirname, '..', 'data', 'sessions.db');
      
      baseConfig.store = new SQLiteStore({
        db: 'sessions.db',
        dir: isVercel ? '/tmp' : path.join(__dirname, '..', 'data'),
        concurrentDB: true,
        table: 'sessions',
        // Clear expired sessions every hour
        clearInterval: 3600000
      });

      console.log(`Using SQLite session store at: ${dbPath}`);
    } catch (error) {
      console.error('Failed to initialize SQLite session store:', error);
      console.log('Falling back to MemoryStore (not recommended for production)');
    }
  } else {
    console.log('Using MemoryStore for development environment');
  }

  return baseConfig;
}

module.exports = createSessionConfig;
