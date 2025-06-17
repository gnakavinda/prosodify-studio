'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { X, Eye, EyeOff, Mail, User, Lock } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, error, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let success = false
      if (activeTab === 'login') {
        success = await login(formData.email, formData.password)
      } else {
        success = await register(formData.email, formData.password, formData.name)
      }

      if (success) {
        onClose()
        setFormData({ email: '', password: '', name: '' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    clearError()
    setFormData({ email: '', password: '', name: '' })
  }

  return (
    <div className="fixed inset-0 flex z-50">
      <div className="w-full h-full flex">
        
        {/* Left Side - Empty for now (will have animation later) */}
        <div className="flex-1 bg-gradient-to-br from-orange-50 to-amber-50 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Placeholder for future animation/content */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl mb-8 mx-auto opacity-20"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your ideas,
                <br />
                amplified
              </h2>
              <p className="text-gray-600 text-lg">
                Privacy-first AI that helps you create with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 bg-white flex flex-col justify-center px-12 py-8 relative max-w-lg">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>

          {/* Prosodify Branding */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'login' 
                ? 'Sign in to continue to Prosodify Studio' 
                : 'Start creating with Prosodify Studio'
              }
            </p>
          </div>

          {/* Google Sign In Button */}
          <button className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register only) */}
            {activeTab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
                placeholder="Enter your personal or work email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Please wait...' : `Continue with email`}
            </button>
          </form>

          {/* Switch between Login/Register */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {activeTab === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchTab('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => switchTab('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="mt-8 text-xs text-gray-500 text-center">
            By continuing, you agree to Prosodify&apos;s{' '}
            <a href="#" className="underline hover:text-gray-700">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}