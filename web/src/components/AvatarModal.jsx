import { motion, AnimatePresence } from 'framer-motion'
import './AvatarModal.css'

function AvatarModal({ isOpen, onClose, avatarUrl, userName }) {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="avatar-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <motion.div 
            className="avatar-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <button 
              className="avatar-modal-close"
              onClick={onClose}
              aria-label="Close avatar modal"
            >
              ✕
            </button>
            
            <div className="avatar-modal-header">
              <h2>{userName}'s Avatar</h2>
            </div>
            
            <div className="avatar-modal-image-container">
              <img 
                src={avatarUrl} 
                alt={`${userName}'s avatar`}
                className="avatar-modal-image"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AvatarModal