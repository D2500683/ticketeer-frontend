import { useState } from 'react'
import { Search, Calendar, Ticket, Menu, X, Play, Pause, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const toggleVideo = () => {
    const video = document.getElementById('header-video') as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <header className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/V9H0F0pfLNM?autoplay=1&mute=1&loop=1&playlist=V9H0F0pfLNM&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="w-full h-full"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '56.25vw', // 16:9 aspect ratio
            minHeight: '100vh',
            minWidth: '177.78vh', // 16:9 aspect ratio
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {/* Black overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation Bar */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                <Ticket className="w-5 h-5 text-black" />
              </div>
              <span className="text-2xl font-cal font-semibold text-white">
                Ticketeer
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
{isAuthenticated ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Tickets</span>
                </button>
              ) : (
                <a href="#tickets" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>My Tickets</span>
                </a>
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <Button 
                    className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center space-x-2"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.username}</span>
                  </Button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user?.email}
                      </div>
                      <button
                        onClick={() => {
                          logout()
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-all duration-300" asChild>
                  <a href="/login">Login</a>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-white/20 fade-in">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    navigate('/discover')
                    setIsMenuOpen(false)
                  }}
                  className="text-white hover:text-gray-300 transition-colors font-medium text-left"
                >
                  Discover
                </button>
                <a href="#create" className="text-white hover:text-gray-300 transition-colors font-medium">
                  Create
                </a>
                {isAuthenticated ? (
  <button 
    onClick={() => {
      navigate('/dashboard')
      setIsMenuOpen(false)
    }}
    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium"
  >
    <Calendar className="w-4 h-4" />
    <span>My Tickets</span>
  </button>
) : (
  <a href="#tickets" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium">
    <Calendar className="w-4 h-4" />
    <span>My Tickets</span>
  </a>
) }
                {isAuthenticated ? (
                  <div className="mt-4 space-y-2">
                    <div className="text-white font-medium flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user?.username}</span>
                    </div>
                    <div className="text-gray-300 text-sm">{user?.email}</div>
                    <Button 
                      className="bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-all duration-300 flex items-center space-x-2"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                ) : (
                  <Button className="bg-white text-black font-semibold mt-4 rounded-full" asChild>
                    <a href="/login">Login</a>
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-cal font-bold text-white mb-6">
              Experience
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Unforgettable
              </span>
              <br />
              Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover, create, and share amazing experiences with your community
            </p>
          </div>
        </div>

        {/* Video Controls */}
      </div>
    </header>
  )
}

export default Header