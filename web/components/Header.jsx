'use client'
import { motion } from 'framer-motion'
import styles from './Header.module.css'

function Header({ user, onBack, onRefresh, title, showBackButton = false }) {
  return (
    <motion.header 
      className={styles.appHeader}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          {showBackButton && (
            <motion.button 
              className={`${styles.btn} ${styles.backBtn}`}
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Go back"
            >
              <span className={styles.backIcon}>←</span>
            </motion.button>
          )}
          
          <div className={styles.headerTitle}>
            <h1>{title || 'Org-Social'}</h1>
            {user && title === 'Timeline' && (
              <span className={styles.subtitle}>@{user.nick}</span>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <motion.button 
            className={`${styles.btn} ${styles.refreshBtn}`}
            onClick={onRefresh}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title="Refresh"
          >
            <span className={styles.refreshIcon}>↻</span>
          </motion.button>
          
          {user && (
            <div className={styles.headerUser}>
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nick}`} 
                alt={user.nick}
                className={styles.headerAvatar}
              />
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header