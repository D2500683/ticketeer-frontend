import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CTABanner = () => {
  return (
    <section className="px-6 mt-20">
      <div className="container mx-auto">
        <div className="hero-gradient rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/15" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/10" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 mr-3" />
              <span className="text-lg font-semibold">Ready to Host?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-cal font-bold mb-6 leading-tight">
              Start Creating Memorable Events Today
            </h2>
            
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of hosts who trust Ticketeer to bring their communities together. 
              From intimate gatherings to large festivals, we make event hosting simple and rewarding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-full group shadow-hero"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full border border-white/30"
              >
                Learn How It Works
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2" />
                <span>Easy setup</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTABanner