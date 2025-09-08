import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Ticket, 
  CreditCard, 
  BarChart3, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Zap,
  Heart,
  Music,
  Camera,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const LearnHowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Calendar,
      title: "Create Your Event",
      description: "Set up your event in minutes with our intuitive event builder. Add details, upload images, and customize your event page.",
      features: ["Event details & description", "Custom branding", "Multiple ticket types", "Venue information"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Ticket,
      title: "Configure Tickets",
      description: "Create different ticket types with flexible pricing options. Set quantities, early bird discounts, and special access levels.",
      features: ["Multiple ticket tiers", "Dynamic pricing", "Capacity management", "Access control"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Share & Promote",
      description: "Launch your event and reach your audience through multiple channels. Built-in marketing tools help maximize attendance.",
      features: ["Social media integration", "Email campaigns", "QR code sharing", "Analytics tracking"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Manage Attendees",
      description: "Track registrations, communicate with attendees, and manage check-ins seamlessly on event day.",
      features: ["Real-time dashboard", "Attendee communication", "Check-in system", "Live updates"],
      color: "from-orange-500 to-red-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level security with multiple payment options including mobile money and international cards."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect experience on any device. Your attendees can register and access tickets from anywhere."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track sales, monitor attendance, and get insights to make your events more successful."
    },
    {
      icon: Music,
      title: "Live Playlist",
      description: "Interactive DJ features with song requests, voting, and real-time playlist management."
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Go from idea to live event in minutes. No technical knowledge required."
    },
    {
      icon: Heart,
      title: "Community Focus",
      description: "Built specifically for bringing communities together and creating memorable experiences."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Organizer",
      content: "Ticketeer made organizing our community festival so much easier. The live playlist feature was a huge hit!",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "DJ & Host",
      content: "The real-time song requests and voting system transformed how I interact with my audience during events.",
      rating: 5
    },
    {
      name: "Lisa Patel",
      role: "Non-profit Director",
      content: "Perfect for our fundraising events. The analytics help us understand our community better.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
              How It Works
            </Badge>
            <h1 className="text-5xl md:text-6xl font-cal font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Creating Events Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover how Ticketeer empowers you to create, manage, and host unforgettable events 
              that bring communities together. From intimate gatherings to large festivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="px-8 py-4 rounded-full font-semibold group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-full font-semibold"
              >
                View Examples
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cal font-bold mb-6">
              Four Simple Steps to Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process gets you from idea to live event in no time
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="text-sm font-semibold text-primary mb-2">
                      Step {index + 1}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cal font-bold mb-6">
              Powerful Features for Every Event
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and host successful events
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cal font-bold mb-6">
              Loved by Event Organizers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our community has to say about their experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hero-gradient rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20" />
              <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/15" />
              <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/10" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-cal font-bold mb-6 leading-tight">
                Ready to Create Your First Event?
              </h2>
              
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of organizers who trust Ticketeer to bring their communities together. 
                Start creating memorable experiences today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-4 rounded-full group shadow-hero"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full border border-white/30"
                >
                  Sign In
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
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnHowItWorks;
