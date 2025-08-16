import { motion } from 'framer-motion'
import './Header.css'

function Header({ user, onBack, onRefresh, title, showBackButton = false }) {
  return (
    <motion.header 
      className="app-header"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <motion.button 
              className="btn back-btn"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Go back"
            >
              <span className="back-icon">←</span>
            </motion.button>
          )}
          
          <div className="header-title">
            <h1>{title || 'Org-Social'}</h1>
            {user && title === 'Timeline' && (
              <span className="subtitle">@{user.nick}</span>
            )}
          </div>
        </div>

        <div className="header-right">
          <motion.button 
            className="btn refresh-btn"
            onClick={onRefresh}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title="Refresh"
          >
            <span className="refresh-icon">↻</span>
          </motion.button>
          
          {user && (
            <div className="header-user">
              <img 
                src={user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='} 
                alt={user.nick}
                className="header-avatar"
              />
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header