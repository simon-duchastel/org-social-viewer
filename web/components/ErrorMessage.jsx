'use client'
import { motion } from 'framer-motion'
import styles from './ErrorMessage.module.css'

function ErrorMessage({ message, onRetry, onBack, showRetry = true, showBack = true }) {
  return (
    <div className={styles.errorMessageContainer}>
      <motion.div 
        className={styles.errorContent}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div 
          className={styles.errorIcon}
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
        
        <h3 className={styles.errorTitle}>Something went wrong</h3>
        
        <p className={styles.errorText}>{message}</p>
        
        <div className={styles.errorActions}>
          {showRetry && onRetry && (
            <motion.button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.btnIcon}>🔄</span>
              Try Again
            </motion.button>
          )}
          
          {showBack && onBack && (
            <motion.button 
              className={styles.btn}
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.btnIcon}>←</span>
              Go Back
            </motion.button>
          )}
        </div>
        
        <details className={styles.errorDetails}>
          <summary>Technical Details</summary>
          <div className={styles.errorDetailsContent}>
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