import { useState, useEffect } from 'react'
import Login from '../components/Auth/Login'
import Signup from '../components/Auth/Signup'
import UserDashboard from '../components/Dashboard/UserDashboard'
import PageTransition from '../components/PageTransition'
import LoadingSpinner from '../components/LoadingSpinner'
import { FaLink } from 'react-icons/fa'

const HomePage = () => {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [isLoading, setIsLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')

        if (token && userData) {
          const parsedUserData = JSON.parse(userData)
          console.log('✅ [HOME] Found existing authentication:', parsedUserData.email)
          setUser(parsedUserData)
        } else {
          console.log('ℹ️ [HOME] No existing authentication found')
        }
      } catch (error) {
        console.error('❌ [HOME] Error checking authentication:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    console.log('🎉 [HOME] User logged in:', userData.user.email)
    setUser(userData.user)
    setShowAuth(false)
  }

  const handleSignup = (userData) => {
    console.log('🎉 [HOME] User signed up:', userData.user.email)
    setUser(userData.user)
    setShowAuth(false)
  }

  const handleLogout = () => {
    console.log('👋 [HOME] User logged out')
    setUser(null)
    setShowAuth(false)
  }

  const switchToSignup = () => {
    console.log('🔄 [HOME] Switching to signup mode')
    setIsTransitioning(true)
    setTimeout(() => {
      setAuthMode('signup')
      setIsTransitioning(false)
    }, 150)
  }

  const switchToLogin = () => {
    console.log('🔄 [HOME] Switching to login mode')
    setIsTransitioning(true)
    setTimeout(() => {
      setAuthMode('login')
      setIsTransitioning(false)
    }, 150)
  }

  const showLoginForm = () => {
    setAuthMode('login')
    setShowAuth(true)
  }

  const showSignupForm = () => {
    setAuthMode('signup')
    setShowAuth(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <PageTransition isLoading={true} loadingMessage="Initializing URL Shortener..." />
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (user) {
    return (
      <PageTransition isLoading={false}>
        <UserDashboard user={user} onLogout={handleLogout} />
      </PageTransition>
    )
  }

  // If showing auth forms
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageTransition isLoading={isTransitioning} loadingMessage="Switching...">
          {authMode === 'login' ? (
            <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
          ) : (
            <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
          )}
        </PageTransition>
      </div>
    )
  }

  // Default homepage with login/signup buttons
  return (
    <PageTransition isLoading={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <FaLink className="text-4xl text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">URL Shortener</h1>
            </div>

            {/* Auth Buttons */}
            <div className="mb-6 flex space-x-3">
              <button
                onClick={showLoginForm}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={showSignupForm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Please login to create and manage your short URLs
              </p>
            </div>

            <div className="bg-gray-50 px-8 py-4 rounded-lg">
              <p className="text-center text-gray-600 text-sm">
                Create short, memorable links in seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default HomePage