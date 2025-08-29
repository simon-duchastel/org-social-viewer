'use client';
import { motion } from 'framer-motion';
import ViewSourceButton from './ViewSourceButton';
import Image from 'next/image';
import styles from './Post.module.css';

function Post({ post, onProfileClick, allUsers }) {

  const renderContent = (content) => {
    if (!content) {
      return null;
    }

    // Handle pre-processed HTML content from parser
    if (content.includes('<')) {
      return (
        <div
          className={styles.postContentHtml}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Fallback for plain text
    return <div className={styles.postContentText}>{content}</div>;
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    onProfileClick(post.user);
  };

  const handlePostClick = () => {
    // Could implement post detail view here
  };

  const getAvatarUrl = (user) => {
    return user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo=';
  };

  return (
    <motion.article
      className={`${styles.post} ${post.isReply ? styles.postReply : ''} ${post.isPoll ? styles.postPoll : ''}`}
      onClick={handlePostClick}
      whileHover={{ backgroundColor: 'var(--twitter-hover-bg)' }}
      transition={{ duration: 0.1 }}
    >
      {post.isReply && (
        <div className={styles.replyIndicator}>
          <div className={styles.replyLine}></div>
          <span className={styles.replyIcon}>↳</span>
          <span className={styles.replyText}>Replying to post</span>
        </div>
      )}

      <div className={styles.postMain}>
        <motion.div
          className={styles.postAvatar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src={getAvatarUrl(post.user)}
            alt={`${post.user.nick}'s avatar`}
            onClick={handleProfileClick}
            width={40}
            height={40}
          />
        </motion.div>

        <div className={styles.postContent}>
          <div className={styles.postHeader}>
            <div className={styles.postUserInfo}>
              <motion.span
                className={styles.postDisplayName}
                onClick={handleProfileClick}
                whileHover={{ textDecoration: 'underline' }}
              >
                {post.user.title || post.user.nick}
              </motion.span>
              <motion.span
                className={styles.postUsername}
                onClick={handleProfileClick}
                whileHover={{ color: 'var(--twitter-blue)' }}
              >
                @{post.user.nick}
              </motion.span>
              <span className={styles.postSeparator}>·</span>
              <span className={styles.postTimestamp} title={post.fullTimestamp || post.timestamp}>
                {post.formattedTimestamp || 'invalid date'}
              </span>
              <ViewSourceButton
                sourceUrl={post.sourceUrl}
                postId={post.id}
                className="timestampBtn"
                title="View source file for this post"
              />
            </div>

            {(post.properties.LANG || post.properties.CLIENT) && (
              <div className={styles.postMetadata}>
                {post.properties.LANG && (
                  <span className={styles.postLang}>{post.properties.LANG}</span>
                )}
                {post.properties.CLIENT && (
                  <span className={styles.postClient}>via {post.properties.CLIENT}</span>
                )}
              </div>
            )}
          </div>

          {post.properties.CONTENT_WARNING && (
            <div className={styles.contentWarning}>
              <span className={styles.warningIcon}>⚠️</span>
              <span>Content Warning: {post.properties.CONTENT_WARNING}</span>
            </div>
          )}

          <div className={styles.postBody}>
            {renderContent(post.displayContent || post.content)}
          </div>

          {post.isPoll && post.checkboxes && post.checkboxes.length > 0 && (
            <div className={styles.pollOptions}>
              {post.checkboxes.map((option, index) => (
                <div key={index} className={`${styles.pollOption} ${option.checked ? styles.checked : ''}`}>
                  <span className={styles.pollCheckbox}>{option.checked ? '☑️' : '☐'}</span>
                  <span className={styles.pollText}>{option.text}</span>
                </div>
              ))}
              {post.properties.POLL_END && (
                <div className={styles.pollEnd}>
                  Ends: {post.properties.POLL_END}
                </div>
              )}
            </div>
          )}

          {post.mentions && post.mentions.length > 0 && (
            <div className={styles.postMentions}>
              {post.mentions.map((mention, index) => (
                <motion.span
                  key={index}
                  className={styles.mention}
                  whileHover={{ backgroundColor: 'var(--twitter-blue)', color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Find user by URL or name
                    const mentionedUser = allUsers.find(user =>
                      user.sourceUrl === mention.url || user.nick === mention.name
                    );
                    if (mentionedUser) {
                      onProfileClick(mentionedUser);
                    }
                  }}
                >
                  @{mention.name}
                </motion.span>
              ))}
            </div>
          )}

          {post.properties.TAGS && (
            <div className={styles.postTags}>
              {post.properties.TAGS.split(' ').map((tag, index) => (
                <span key={index} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          {post.properties.MOOD && (
            <div className={styles.postMood}>
              <span className={styles.moodIcon}>{post.properties.MOOD}</span>
            </div>
          )}

          <div className={styles.postActions}>
            <motion.button
              className={`${styles.actionBtn} ${styles.replyBtn}`}
              whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={styles.actionIcon}>💬</span>
            </motion.button>

            <motion.button
              className={`${styles.actionBtn} ${styles.repostBtn}`}
              whileHover={{ scale: 1.1, color: 'var(--twitter-success)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={styles.actionIcon}>🔄</span>
            </motion.button>

            <motion.button
              className={`${styles.actionBtn} ${styles.likeBtn}`}
              whileHover={{ scale: 1.1, color: 'var(--twitter-error)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={styles.actionIcon}>❤️</span>
            </motion.button>

            <motion.button
              className={`${styles.actionBtn} ${styles.shareBtn}`}
              whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                const url = `${post.sourceUrl}#${post.id}`;
                navigator.clipboard.writeText(url);
              }}
            >
              <span className={styles.actionIcon}>📤</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default Post;
