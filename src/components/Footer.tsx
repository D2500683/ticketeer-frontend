import { Heart, Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="mt-20 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-2xl hero-gradient flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-cal font-semibold text-foreground">
                Ticketeer
              </span>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-md">
              Bringing communities together through meaningful events. 
              Join thousands who trust us to create unforgettable experiences.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-cal font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Discover Events</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Create Event</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">My Tickets</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community Stories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-cal font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Host Resources</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* App Downloads & Contact */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>hello@ticketeer.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>(555) 123-EVENTS</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-foreground text-background rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-foreground/90 transition-colors">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">📱</span>
                </div>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </div>
              
              <div className="bg-foreground text-background rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-foreground/90 transition-colors">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">▶</span>
                </div>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 Ticketeer. Made with ❤️ for communities everywhere.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer