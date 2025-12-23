import React from 'react';
import styles from './Radio.module.css';

const Radio = ({ 
  name, 
  value, 
  label, 
  checked = false, 
  onChange,
  wrapperClass = ''
}) => {
  return (
    <div className={`${styles.radioWrapper} ${wrapperClass}`}>
      <label className={styles.radioLabel}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={styles.radioInput}
        />
        <span className={styles.radioText}>{label}</span>
      </label>
    </div>
  );
};

export default Radio; // ✅ ודא שיש export default