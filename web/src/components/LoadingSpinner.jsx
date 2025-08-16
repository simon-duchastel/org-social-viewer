import { motion } from 'framer-motion'
import './LoadingSpinner.css'

function LoadingSpinner({ message = "Loading...", size = "normal" }) {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <motion.div 
        className="loading-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="spinner-circle"></div>
        </motion.div>
        
        {message && (
          <motion.p 
            className="loading-message"
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