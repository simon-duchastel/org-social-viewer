'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import URLInput from '../components/URLInput'
import MainApp from '../components/MainApp'

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orgSocialUrl, setOrgSocialUrl] = useState(null)

  const handleUrlSubmit = (url) => {
    setOrgSocialUrl(url)
    // Add URL state to browser history when entering the app
    const params = new URLSearchParams()
    params.set('url', encodeURIComponent(url))
    router.push(`?${params.toString()}`)
  }

  const handleBack = () => {
    setOrgSocialUrl(null)
    // Clear URL params when going back to URL input
    router.push('/')
  }

  // Handle browser navigation and restore app state from URL
  useEffect(() => {
    const urlParam = searchParams.get('url')
    if (urlParam && !orgSocialUrl) {
      setOrgSocialUrl(decodeURIComponent(urlParam))
    }
  }, [searchParams])

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        {!orgSocialUrl ? (
          <motion.div
            key="url-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <URLInput onUrlSubmit={handleUrlSubmit} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MainApp url={orgSocialUrl} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}