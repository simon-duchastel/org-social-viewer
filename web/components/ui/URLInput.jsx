import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './URLInput.module.css';

function URLInput({ onUrlSubmit }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate URL format
      new URL(url);

      // Basic validation that it might be an org file
      if (!url.toLowerCase().includes('.org')) {
        setError('Please provide a URL to an .org file');
        setIsLoading(false);
        return;
      }

      // For external URLs, we'll handle CORS in the main app
      // Just validate the URL format here

      onUrlSubmit(url);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Invalid URL')) {
        setError('Please enter a valid URL');
      } else {
        setError(err.message || 'Unable to load the org-social file');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.urlInputContainer}>
      <motion.div
        className={styles.urlInputContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            📡
          </motion.div>
          <h1>Org-Social Viewer</h1>
        </div>

        <p className={styles.description}>
          Enter the URL of an org-social file to start exploring decentralized social networks
        </p>

        <form onSubmit={handleSubmit} className={styles.urlForm}>
          <div className={styles.inputGroup}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/social.org"
              className={styles.urlInput}
              disabled={isLoading}
              autoFocus
            />
            <motion.button
              type="submit"
              className='btn btn-primary'
              disabled={isLoading || !url.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <motion.div
                  className={styles.loadingSpinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⟳
                </motion.div>
              ) : (
                'Connect'
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </form>

        <div className={styles.examples}>
          <h3>Try these examples:</h3>
          <div className={styles.exampleUrls}>
            <button
              type="button"
              className={styles.exampleUrl}
              onClick={() => setUrl(`${window.location.origin}/social.org`)}
            >
              ./social.org (local example)
            </button>
            <button
              type="button"
              className={styles.exampleUrl}
              onClick={() => setUrl('https://andros.dev/static/social.org')}
            >
              andros.dev/static/social.org (Org-Social creator)
            </button>
            <button
              type="button"
              className={styles.exampleUrl}
              onClick={() => setUrl('https://rossabaker.com/social.org')}
            >
              rossabaker.com/social.org
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <h3>What is Org-Social?</h3>
          <p>
            Org-Social is a decentralized social network built on simple Org Mode files.
            No registration, no databases - just you and your text file hosted anywhere on the web.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default URLInput;
