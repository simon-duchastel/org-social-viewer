import { useState } from 'react'
import { motion } from 'framer-motion'
import './URLInput.css'

function URLInput({ onUrlSubmit }) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError('')

    try {
      // Validate URL format
      new URL(url)
      
      // Basic validation that it might be an org file
      if (!url.toLowerCase().includes('.org')) {
        setError('Please provide a URL to an .org file')
        setIsLoading(false)
        return
      }

      // For external URLs, we'll handle CORS in the main app
      // Just validate the URL format here

      onUrlSubmit(url)
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Invalid URL')) {
        setError('Please enter a valid URL')
      } else {
        setError(err.message || 'Unable to load the org-social file')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="url-input-container">
      <motion.div 
        className="url-input-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="logo">
          <motion.div 
            className="logo-icon"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            📡
          </motion.div>
          <h1>Org-Social Viewer</h1>
        </div>
        
        <p className="description">
          Enter the URL of an org-social file to start exploring decentralized social networks
        </p>

        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/social.org"
              className="url-input"
              disabled={isLoading}
              autoFocus
            />
            <motion.button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !url.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <motion.div 
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⟳
                </motion.div>
              ) : (
                'Connect'
              )}
            </motion.button>
          </div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </form>

        <div className="examples">
          <h3>Try these examples:</h3>
          <div className="example-urls">
            <button 
              type="button"
              className="example-url"
              onClick={() => setUrl('./social.org')}
            >
              ./social.org (local example)
            </button>
            <button 
              type="button"
              className="example-url"
              onClick={() => setUrl('https://andros.dev/static/social.org')}
            >
              andros.dev/static/social.org (Org-Social creator)
            </button>
            <button 
              type="button"
              className="example-url"
              onClick={() => setUrl('https://rossabaker.com/social.org')}
            >
              rossabaker.com/social.org
            </button>
          </div>
        </div>

        <div className="info">
          <h3>What is Org-Social?</h3>
          <p>
            Org-Social is a decentralized social network built on simple Org Mode files. 
            No registration, no databases - just you and your text file hosted anywhere on the web.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default URLInput