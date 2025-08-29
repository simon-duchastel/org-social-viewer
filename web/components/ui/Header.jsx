'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './Header.module.css';

function Header({ user, onBack, onRefresh, title, showBackButton = false }) {
  return (
    <motion.header
      className={styles.appHeader}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          {showBackButton && (
            <motion.button
              className={`${styles.btn} ${styles.backBtn}`}
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title='Go back'
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
            title='Refresh'
          >
            <span className={styles.refreshIcon}>↻</span>
          </motion.button>

          {user && (
            <div className={styles.headerUser}>
              <Image
                src={user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='}
                alt={user.nick}
                className={styles.headerAvatar}
                width={40}
                height={40}
                priority
              />
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
