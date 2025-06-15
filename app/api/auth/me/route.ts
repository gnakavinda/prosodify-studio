// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { findUserById } from '../../../lib/database'

interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    let decoded: JWTPayload
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find user in Azure SQL Database
    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }

    return NextResponse.json({ user: userResponse })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}