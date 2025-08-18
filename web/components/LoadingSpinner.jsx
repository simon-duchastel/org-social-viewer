'use client'
import { motion } from 'framer-motion'
import styles from './LoadingSpinner.module.css'

function LoadingSpinner({ message = "Loading...", size = "normal" }) {
  return (
    <div className={`${styles.loadingSpinnerContainer} ${styles[size]}`}>
      <motion.div 
        className={styles.loadingContent}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={styles.spinnerCircle}></div>
        </motion.div>
        
        {message && (
          <motion.p 
            className={styles.loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

export default LoadingSpinner