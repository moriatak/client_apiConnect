import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './Notification.module.css';

const Notification = ({ id, message, type, duration }) => {
  const { removeNotification } = useNotification();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(id);
    }, 300); // זמן האנימציה
  }, [id, removeNotification]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fa fa-check-circle"></i>;
      case 'error':
        return <i className="fa fa-times-circle"></i>;
      case 'warning':
        return <i className="fa fa-exclamation-triangle"></i>;
      default:
        return <i className="fa fa-info-circle"></i>;
    }
  };

  return (
    <div 
      className={`${styles.notification} ${styles[type]} ${isExiting ? styles.exit : ''}`}
      role="alert"
    >
      <div className={styles.icon}>
        {getIcon()}
      </div>
      <div className={styles.message}>
        {message}
      </div>
      <button 
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="סגור"
      >
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;