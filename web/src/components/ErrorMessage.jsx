import { motion } from 'framer-motion'
import './ErrorMessage.css'

function ErrorMessage({ message, onRetry, onBack, showRetry = true, showBack = true }) {
  return (
    <div className="error-message-container">
      <motion.div 
        className="error-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div 
          className="error-icon"
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          ⚠️
        </motion.div>
        
        <h3 className="error-title">Something went wrong</h3>
        
        <p className="error-text">{message}</p>
        
        <div className="error-actions">
          {showRetry && onRetry && (
            <motion.button 
              className="btn btn-primary"
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">🔄</span>
              Try Again
            </motion.button>
          )}
          
          {showBack && onBack && (
            <motion.button 
              className="btn"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">←</span>
              Go Back
            </motion.button>
          )}
        </div>
        
        <details className="error-details">
          <summary>Technical Details</summary>
          <div className="error-details-content">
            <p><strong>Error:</strong> {message}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Suggestion:</strong> Check your internet connection and ensure the org-social file URL is accessible.</p>
          </div>
        </details>
      </motion.div>
    </div>
  )
}

export default ErrorMessage