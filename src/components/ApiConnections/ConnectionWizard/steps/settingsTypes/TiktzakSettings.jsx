import React from 'react';
import styles from '../Steps.module.css';

const TiktzakSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="tiktzak_form_id" className={styles.label}>
          מזהה טופס / מזהה קמפיין: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="tiktzak_form_id"
          className={styles.input}
          value={settings.form_id || ''}
          onChange={(e) => onChange('form_id', e.target.value)}
          placeholder="לדוגמה: FORM-12345"
          required
        />
        <small className={styles.hint}>
          את המזהה ניתן למצוא בממשק הניהול של טיקצאק
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tiktzak_password" className={styles.label}>
          סיסמת גישה (אם נדרש):
        </label>
        <input
          type="password"
          id="tiktzak_password"
          className={styles.input}
          value={settings.password || ''}
          onChange={(e) => onChange('password', e.target.value)}
          placeholder="הזן סיסמה אם נדרשת"
        />
        <small className={styles.hint}>
          השאר ריק אם לא נדרשת סיסמה
        </small>
      </div>

      <div className={styles.infoBox}>
        <i className="fa fa-info-circle"></i>
        <div>
          <strong>שים לב:</strong> ודא שהקמפיין בטיקצאק מוגדר כפעיל ומקבל הגשות
        </div>
      </div>
    </div>
  );
};

export default TiktzakSettings;