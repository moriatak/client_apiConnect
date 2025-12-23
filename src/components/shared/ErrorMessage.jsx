import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <i className="fa fa-exclamation-triangle"></i>
      </div>
      <div className={styles.content}>
        <h3>אופס! משהו השתבש</h3>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryBtn}>
            <i className="fa fa-refresh"></i> נסה שוב
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;