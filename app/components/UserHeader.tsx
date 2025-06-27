'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, RefreshCw } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function UserHeader() {
  const { user, logout, refreshUserData } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!user) return null

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUserData()
    setIsRefreshing(false)
  }

  return (
    <div className="bg-primary border-b border-primary px-6 py-2 transition-colors">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Prosodify Studio
          </h1>
        </div>

        {/* Theme Toggle & User Menu */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 bg-secondary hover-bg rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={14} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-primary">{user.name}</p>
                <p className="text-xs text-muted capitalize">{user.subscriptionStatus} Plan</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-secondary rounded-lg shadow-lg border border-primary py-2 z-50">
                <div className="px-4 py-2 border-b border-primary">
                  <p className="text-sm font-medium text-primary">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-secondary hover-bg disabled:opacity-50"
                >
                  <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={16} />
                  <span>Refresh Usage</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-secondary hover-bg">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="border-t border-primary mt-2 pt-2">
                  <button
                    onClick={() => {
                      logout()
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}