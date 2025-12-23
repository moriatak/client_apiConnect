import React, { useState } from 'react';
import styles from '../Steps.module.css';
import { apiConnectionsService } from '../../../../../services/apiConnectionsService';

const ZridiSettings = ({ settings, onChange }) => {
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const checkZridiStatus = async () => {
    if (!settings.api_key || !settings.user_id) {
      alert('יש להזין מפתח API ומזהה משתמש');
      return;
    }

    setChecking(true);
    setStatusResult(null);

    try {
      // סימולציה - להחליף בקריאה אמיתית
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatusResult({ success: true, message: 'החיבור תקין' });
    } catch (error) {
      setStatusResult({ success: false, message: 'שגיאה בבדיקת החיבור' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="zridi_api_key" className={styles.label}>
          מפתח API (Token): <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="zridi_api_key"
          className={styles.input}
          value={settings.api_key || ''}
          onChange={(e) => onChange('api_key', e.target.value)}
          placeholder="הזן את מפתח ה-API מצרידי"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="zridi_user_id" className={styles.label}>
          מזהה משתמש / מזהה קמפיין: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="zridi_user_id"
          className={styles.input}
          value={settings.user_id || ''}
          onChange={(e) => onChange('user_id', e.target.value)}
          placeholder="לדוגמה: USER-67890"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>סטטוס:</label>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={checkZridiStatus}
          disabled={checking}
        >
          {checking ? (
            <>
              <i className="fa fa-spinner fa-spin"></i> בודק...
            </>
          ) : (
            <>
              <i className="fa fa-refresh"></i> בדוק סטטוס
            </>
          )}
        </button>
        {statusResult && (
          <div className={statusResult.success ? styles.successBox : styles.errorBox}>
            <i className={`fa ${statusResult.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            {statusResult.message}
          </div>
        )}
      </div>

      <div className={styles.warningBox}>
        <i className="fa fa-exclamation-triangle"></i>
        <div>
          <strong>חשוב:</strong> ודא שיש לך הרשאות מתאימות במערכת צרידי
        </div>
      </div>
    </div>
  );
};

export default ZridiSettings;