// lib/database.ts
import sql from 'mssql'

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER!,
  database: process.env.AZURE_SQL_DATABASE!,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.AZURE_SQL_USERNAME!,
      password: process.env.AZURE_SQL_PASSWORD!,
    }
  },
  options: {
    encrypt: true, // Required for Azure
    enableArithAbort: true,
  },
}

let pool: sql.ConnectionPool | undefined

export async function getDbConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config)
    await pool.connect()
  }
  return pool
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const pool = await getDbConnection()
    
    // Create users table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id NVARCHAR(50) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        name NVARCHAR(255) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE()
      )
    `)

    // Create audio_files table for TTS history
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audio_files' AND xtype='U')
      CREATE TABLE audio_files (
        id NVARCHAR(50) PRIMARY KEY,
        userId NVARCHAR(50) NOT NULL,
        filename NVARCHAR(255) NOT NULL,
        text NVARCHAR(MAX) NOT NULL,
        voice NVARCHAR(100),
        settings NVARCHAR(MAX), -- JSON string of voice settings
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `)

    console.log('Database tables initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// User operations
export async function createUser(user: {
  id: string
  email: string
  name: string
  password: string
}) {
  const pool = await getDbConnection()
  
  await pool.request()
    .input('id', sql.NVarChar(50), user.id)
    .input('email', sql.NVarChar(255), user.email)
    .input('name', sql.NVarChar(255), user.name)
    .input('password', sql.NVarChar(255), user.password)
    .query(`
      INSERT INTO users (id, email, name, password)
      VALUES (@id, @email, @name, @password)
    `)
}

export async function findUserByEmail(email: string) {
  const pool = await getDbConnection()
  
  const result = await pool.request()
    .input('email', sql.NVarChar(255), email.toLowerCase())
    .query('SELECT * FROM users WHERE email = @email')
  
  return result.recordset[0] || null
}

export async function findUserById(id: string) {
  const pool = await getDbConnection()
  
  const result = await pool.request()
    .input('id', sql.NVarChar(50), id)
    .query('SELECT * FROM users WHERE id = @id')
  
  return result.recordset[0] || null
}

// Login tracking functions
export async function updateLoginTracking(userId: string) {
  const pool = await getDbConnection()
  
  await pool.request()
    .input('userId', sql.NVarChar(50), userId)
    .query(`
      UPDATE users 
      SET last_login_at = GETDATE(),
          login_count = ISNULL(login_count, 0) + 1
      WHERE id = @userId
    `)
}

export async function getUserLoginHistory(userId: string) {
  const pool = await getDbConnection()
  
  const result = await pool.request()
    .input('userId', sql.NVarChar(50), userId)
    .query(`
      SELECT 
        id, email, name, 
        last_login_at, 
        login_count,
        createdAt
      FROM users 
      WHERE id = @userId
    `)
  
  return result.recordset[0] || null
}