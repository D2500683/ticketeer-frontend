import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stories = [
  {
    id: 1,
    title: "The Art of Community Building Through Food",
    excerpt: "How a simple cooking class turned into a neighborhood movement",
    author: "Maria Rodriguez",
    readTime: "5 min read",
    category: "Community"
  },
  {
    id: 2,
    title: "From Garage Band to Main Stage",
    excerpt: "Local musicians share their journey to headlining festivals",
    author: "James Chen",
    readTime: "8 min read", 
    category: "Music"
  },
  {
    id: 3,
    title: "Wellness Wednesday: Mental Health in Events",
    excerpt: "Creating safe spaces for connection and healing",
    author: "Dr. Sarah Kim",
    readTime: "6 min read",
    category: "Wellness"
  }
]

const CommunityStories = () => {
  return (
    <section className="mt-20">
      {/* Mobile: Full width gradient section */}
      <div className="px-4 md:px-6 md:container md:mx-auto">
        <div className="community-gradient rounded-3xl p-6 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Community Stories
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real stories from real people in our vibrant community
            </p>
          </div>
          
          {/* Stories Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {stories.map((story) => (
              <article key={story.id} className="bg-card border-border rounded-2xl p-6 hover:shadow-soft transition-all duration-300 cursor-pointer group">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {story.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {story.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {story.author}</span>
                  <span>{story.readTime}</span>
                </div>
                
                <div className="mt-4 flex items-center text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm">Read More</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
          
          {/* Footer Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8 bg-white text-primary hover:bg-white/90 border-white/30">
              Read All Stories
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CommunityStories