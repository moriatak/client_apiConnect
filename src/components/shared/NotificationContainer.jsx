import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import Notification from './Notification';
import styles from './NotificationContainer.module.css';

const NotificationContainer = () => {
  const { notifications } = useNotification();

  return (
    <div className={styles.container}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;