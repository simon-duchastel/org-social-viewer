'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import styles from './AvatarModal.module.css';

function AvatarModal({ isOpen, onClose, avatarUrl, userName }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.avatarModalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className={styles.avatarModalContent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className={styles.avatarModalClose}
              onClick={onClose}
              aria-label='Close avatar modal'
            >
              ✕
            </button>

            <div className={styles.avatarModalHeader}>
              <h2>{userName}&apos;s Avatar</h2>
            </div>

            <div className={styles.avatarModalImageContainer}>
              <img
                src={avatarUrl}
                alt={`${userName}&apos;s avatar`}
                className={styles.avatarModalImage}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AvatarModal;
