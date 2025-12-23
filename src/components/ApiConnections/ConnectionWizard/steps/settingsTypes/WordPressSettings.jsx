import React from 'react';
import styles from '../Steps.module.css';

const WordPressSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="wordpress_url" className={styles.label}>
          כתובת אתר (URL): <span className={styles.required}>*</span>
        </label>
        <input
          type="url"
          id="wordpress_url"
          className={styles.input}
          value={settings.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://example.com"
          required
        />
        <small className={styles.hint}>
          הזן את כתובת האתר המלאה כולל https://
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="wordpress_api_key" className={styles.label}>
          מפתח API / Token: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="wordpress_api_key"
          className={styles.input}
          value={settings.api_key || ''}
          onChange={(e) => onChange('api_key', e.target.value)}
          placeholder="הזן את מפתח ה-API מוורדפרס"
          required
        />
        <small className={styles.hint}>
          ניתן למצוא במסך ההגדרות של הפלאגין
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="wordpress_client_id" className={styles.label}>
          מזהה לקוח (אם יש):
        </label>
        <input
          type="text"
          id="wordpress_client_id"
          className={styles.input}
          value={settings.client_id || ''}
          onChange={(e) => onChange('client_id', e.target.value)}
          placeholder="אופציונלי - מזהה ייחודי של הלקוח"
        />
      </div>

      <div className={styles.infoBox}>
        <i className="fa fa-lightbulb-o"></i>
        <div>
          <strong>טיפ:</strong> לאחר שמירת החיבור, תקבל קוד להטמעה באתר הוורדפרס שלך
        </div>
      </div>
    </div>
  );
};

export default WordPressSettings;