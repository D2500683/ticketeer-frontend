import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_CONFIG } from '@/config/api'
import { useNavigate } from 'react-router-dom'

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch real events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}?limit=3&status=draft`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % events.length)
      }, 6000)

      return () => clearInterval(timer)
    }
  }, [events.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const handleDiscoverEvent = (eventId: string) => {
    navigate(`/event/${eventId}`)
  }

  if (loading) {
    return (
      <section className="relative h-[70vh] overflow-hidden rounded-3xl mx-6 mt-8 shadow-hero bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="relative h-[70vh] overflow-hidden rounded-3xl mx-6 mt-8 shadow-hero bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-xl font-semibold mb-2">No Events Available</h3>
            <p>Check back later for exciting events!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[70vh] overflow-hidden rounded-3xl mx-6 mt-8 shadow-hero">
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={event.flyerUrl || event.image || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-2xl text-white slide-up">
                <h1 className="text-5xl md:text-6xl font-cal font-bold mb-4 leading-tight">
                  {event.title}
                </h1>
                <p className="text-xl mb-6 opacity-90 font-inter">
                  {event.description}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <div className="flex items-center text-lg">
                    <span className="font-semibold">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-lg">
                    <span>{event.location}</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="hero-gradient text-white font-semibold px-8 py-4 rounded-full hover:shadow-hero transition-all duration-300 group"
                  onClick={() => handleDiscoverEvent(event._id)}
                >
                  Discover Event
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-soft' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroCarousel