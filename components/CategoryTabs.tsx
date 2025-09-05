import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const categories = [
  { id: 'all', name: 'All Events' },
  { id: 'music', name: 'Music' },
  { id: 'food', name: 'Food' },
  { id: 'art', name: 'Art' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'tech', name: 'Tech' },
  { id: 'sports', name: 'Sports' }
]

const CategoryTabs = () => {
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Create enough copies to fill the screen and ensure seamless loop
  const duplicatedCategories = [...categories, ...categories, ...categories, ...categories]

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.scrollWidth / 4) // Divide by 4 since we have 4 copies
    }
  }, [])

  return (
    <section className="mt-12 overflow-hidden">
      <div className="relative">
        <motion.div
          ref={containerRef}
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: [0, -containerWidth]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear"
            }
          }}
          style={{
            width: 'max-content'
          }}
        >
          {duplicatedCategories.map((category, index) => (
            <div
              key={`${category.id}-${index}`}
              className="flex items-center text-sm font-inconsolata font-medium text-white px-4"
            >
              <span>{category.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default CategoryTabs