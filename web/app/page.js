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
    params.set('view', 'timeline')
    
    // Push state with proper navigation context
    const newUrl = `?${params.toString()}`
    window.history.pushState({ fromUrlInput: true, url }, '', newUrl)
    router.push(newUrl)
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
    } else if (!urlParam && orgSocialUrl) {
      // URL has no param but state has URL - user navigated back
      setOrgSocialUrl(null)
    }
  }, [searchParams, orgSocialUrl])

  // Handle browser back button to return to URL input
  useEffect(() => {
    const handlePopState = (event) => {
      const currentUrl = new URL(window.location)
      const urlParam = currentUrl.searchParams.get('url')
      
      // If we're back to the main page without URL params, show URL input
      if (!urlParam) {
        setOrgSocialUrl(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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