import Header from '@/components/Header'
import HeroCarousel from '@/components/HeroCarousel'
import CategoryTabs from '@/components/CategoryTabs'
import FeaturedSection from '@/components/FeaturedSection'
import EventDiscoveryGrid from '@/components/EventDiscoveryGrid'
import CommunityStories from '@/components/CommunityStories'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <CategoryTabs />
        <FeaturedSection />
        <EventDiscoveryGrid />
        {/* <CommunityStories /> */}
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}

export default Index