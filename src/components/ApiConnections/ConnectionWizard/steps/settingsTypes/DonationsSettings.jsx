import React from 'react';
import styles from '../Steps.module.css';

const DonationsSettings = ({ settings, onChange }) => {
  const handleAmountsChange = (e) => {
    onChange('amounts', e.target.value);
  };

  return (
    <div className={styles.settingsContainer}>
      {/* <div className={styles.formGroup}>
        <label htmlFor="campaign_name" className={styles.label}>
          שם הקמפיין: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="campaign_name"
          className={styles.input}
          value={settings.campaign_name || ''}
          onChange={(e) => onChange('campaign_name', e.target.value)}
          placeholder="לדוגמה: קמפיין תרומות חורף 2024"
          required
        />
      </div> */}

      <div className={styles.formGroup}>
        <label htmlFor="campaign_description" className={styles.label}>
          תיאור קמפיין:
        </label>
        <textarea
          id="campaign_description"
          className={styles.textarea}
          value={settings.campaign_description || ''}
          onChange={(e) => onChange('campaign_description', e.target.value)}
          placeholder="תיאור מפורט של מטרת הקמפיין..."
          rows="4"
        />
      </div>

      {/* <div className={styles.formGroup}>
        <label htmlFor="default_amount" className={styles.label}>
          סכום ברירת מחדל:
        </label>
        <input
          type="number"
          id="default_amount"
          className={styles.input}
          value={settings.default_amount || 100}
          onChange={(e) => onChange('default_amount', parseInt(e.target.value))}
          min="1"
        />
        <small className={styles.hint}>
          הסכום שיופיע כברירת מחדל בטופס התרומה
        </small>
      </div> */}

      <div className={styles.formGroup}>
        {/* <label htmlFor="amounts" className={styles.label}>
          סכומים מוצעים (מופרדים בפסיקים):
        </label>
        <input
          type="text"
          id="amounts"
          className={styles.input}
          value={settings.amounts || '50, 100, 180, 360, 500'}
          onChange={handleAmountsChange}
          placeholder="50, 100, 180, 360, 500"
        />
        <small className={styles.hint}>
          סכומים אלו יופיעו ככפתורים מהירים בטופס
        </small> */}
      </div>

      {/* <div className={styles.infoBox}>
        <i className="fa fa-heart"></i>
        <div>
          <strong>טיפ:</strong> בחר סכומים שמתאימים לקהל היעד שלך
        </div>
      </div> */}
    </div>
  );
};

export default DonationsSettings;