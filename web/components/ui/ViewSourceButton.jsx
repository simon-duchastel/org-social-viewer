'use client'
import { motion } from 'framer-motion'
import styles from './ViewSourceButton.module.css'

function ViewSourceButton({ sourceUrl, postId, className = '', title = 'View source file' }) {
  const handleClick = (e) => {
    e.stopPropagation()
    
    // Build the URL - if postId is provided, add anchor link
    const url = postId ? `${sourceUrl}#${postId}` : sourceUrl
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!sourceUrl) {
    return null
  }

  return (
    <motion.button
      className={`${styles.viewSourceBtn} ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      aria-label={title}
    >
      <span className={styles.sourceIcon}>📋</span>
    </motion.button>
  )
}

export default ViewSourceButton