// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { getDbConnection } from '../../lib/database'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('Server:', process.env.AZURE_SQL_SERVER)
    console.log('Database:', process.env.AZURE_SQL_DATABASE)
    console.log('Username:', process.env.AZURE_SQL_USERNAME)
    console.log('Password length:', process.env.AZURE_SQL_PASSWORD?.length)

    const pool = await getDbConnection()
    const result = await pool.request().query('SELECT GETDATE() as currentTime')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.recordset[0].currentTime,
      server: process.env.AZURE_SQL_SERVER
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      server: process.env.AZURE_SQL_SERVER
    }, { status: 500 })
  }
}