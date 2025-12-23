import React, { useState } from 'react';
import styles from './Steps.module.css';
import RichTextEditor from '../../../shared/RichTextEditor';
import ItemsManager from '../../../shared/ItemsManager';

const Step5EmailAndItems = ({ data, updateData }) => {
  const handleEmailChange = (content) => {
    updateData({ thankYouEmail: content });
  };

  const handleItemsChange = (items) => {
    updateData({ items });
  };

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>שלב 5: מלל למייל תודה ופריטים</h4>

      {/* מלל מייל תודה */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <i className="fa fa-envelope"></i> מלל למייל תודה:
        </label>
        <div className={styles.variablesInfo}>
          <strong>משתנים זמינים:</strong>
          <div className={styles.variablesList}>
            <code>{'{שם_לקוח}'}</code>
            <code>{'{סכום}'}</code>
            <code>{'{תאריך}'}</code>
            <code>{'{שם_פרויקט}'}</code>
            <code>{'{מספר_תרומה}'}</code>
            <code>{'{מק״ט}'}</code>
          </div>
        </div>
        <RichTextEditor
          value={data.thankYouEmail || ''}
          onChange={handleEmailChange}
          placeholder="הזן כאן את תוכן מייל התודה..."
        />
        <small className={styles.hint}>
          ניתן להשתמש במשתנים לעיל לאישיות המייל
        </small>
      </div>

      {/* ניהול פריטים */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <i className="fa fa-list"></i> פריטים ומק״ט:
        </label>
        <ItemsManager
          items={data.items || []}
          onChange={handleItemsChange}
        />
      </div>

      {/* תצוגה מקדימה */}
      {data.thankYouEmail && (
        <div className={styles.previewBox}>
          <h5>תצוגה מקדימה של המייל:</h5>
          <div 
            className={styles.emailPreview}
            dangerouslySetInnerHTML={{ __html: data.thankYouEmail }}
          />
        </div>
      )}
    </div>
  );
};

export default Step5EmailAndItems;