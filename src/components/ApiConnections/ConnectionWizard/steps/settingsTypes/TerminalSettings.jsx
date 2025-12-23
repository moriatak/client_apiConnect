import React from 'react';
import styles from '../Steps.module.css';

const TerminalSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="terminal_id" className={styles.label}>
          מזהה מסופון: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="terminal_id"
          className={styles.input}
          value={settings.terminal_id || ''}
          onChange={(e) => onChange('terminal_id', e.target.value)}
          placeholder="הזן מזהה מסופון"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="terminal_type" className={styles.label}>
          סוג מסופון: <span className={styles.required}>*</span>
        </label>
        <select
          id="terminal_type"
          className={styles.select}
          value={settings.terminal_type || ''}
          onChange={(e) => onChange('terminal_type', e.target.value)}
          required
        >
          <option value="">-- בחר --</option>
          <option value="physical">פיזי</option>
          <option value="virtual">וירטואלי</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="terminal_details" className={styles.label}>
          פרטי סליקה:
        </label>
        <textarea
          id="terminal_details"
          className={styles.textarea}
          value={settings.terminal_details || ''}
          onChange={(e) => onChange('terminal_details', e.target.value)}
          placeholder="פרטים נוספים על הסליקה..."
          rows="3"
        />
      </div>
    </div>
  );
};

export default TerminalSettings;