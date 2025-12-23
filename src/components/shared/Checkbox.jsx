import React from 'react';
import styles from './Checkbox.module.css';

const Checkbox = ({ 
  name, 
  value, 
  label, 
  checked = false, 
  onChange, 
  icon = false,
  dataMethod = '',
  wrapperClass = ''
}) => {
  return (
    <div 
      className={`${styles.checkboxWrapper} ${wrapperClass}`}
      data-method={dataMethod}
    >
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={styles.checkboxInput}
        />
        <span className={styles.checkboxText}>{label}</span>
        {icon && <i className={`fa fa-check-circle ${styles.checkboxIcon}`}></i>}
      </label>
    </div>
  );
};

export default Checkbox;