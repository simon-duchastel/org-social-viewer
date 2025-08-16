import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import URLInput from './components/URLInput'
import MainApp from './components/MainApp'

function App() {
  const [orgSocialUrl, setOrgSocialUrl] = useState(null)

  const handleUrlSubmit = (url) => {
    setOrgSocialUrl(url)
  }

  const handleBack = () => {
    setOrgSocialUrl(null)
  }

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

export default App