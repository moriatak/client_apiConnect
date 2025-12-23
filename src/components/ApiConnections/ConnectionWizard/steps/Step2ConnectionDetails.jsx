import React, { useEffect } from 'react';
import styles from './Steps.module.css';

const Step2ConnectionDetails = ({ data, updateData, connectionTypes = [] }) => {
  // מילוי אוטומטי כשבוחרים סוג חיבור
useEffect(() => {
  if (data.connectionType && connectionTypes.length > 0 && !data.autoFilled) {
    const selectedType = connectionTypes.find(
      t => t.IdConnectType === data.connectionType
    );
    
    if (selectedType && !data.connectionName) {
      const defaultName = `${selectedType.Description} - ${new Date().toLocaleDateString('he-IL')}`;
      
      updateData({
        connectionName: defaultName,
        autoFilled: true // ✅ מונע לופ
      });
    }
  }
}, [data.connectionType]); // ✅ הסר connectionTypes מה-dependencies

  const handleNameChange = (e) => {
    updateData({ connectionName: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    updateData({ connectionDescription: e.target.value });
  };

  const handleStatusChange = (e) => {
    updateData({ connectionStatus: e.target.value });
  };

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>
        <i className="fa fa-pencil"></i>
        שלב 2: פרטי החיבור
      </h4>
      <p className={styles.stepDescription}>
        מלא את פרטי החיבור. שם החיבור מולא אוטומטית, ניתן לערוך.
      </p>

      {/* שם חיבור */}
      <div className={styles.formGroup}>
        <label htmlFor="connectionName" className={styles.label}>
          <i className="fa fa-tag"></i> שם החיבור: <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="connectionName"
          name="connectionName"
          className={styles.input}
          value={data.connectionName || ''}
          onChange={handleNameChange}
          placeholder="לדוגמה: חיבור WordPress לאתר ראשי"
          required
        />
        <span className={styles.hint}>
          <i className="fa fa-lightbulb-o"></i>
          מולא אוטומטית על פי סוג החיבור, ניתן לערוך
        </span>
      </div>

      {/* תיאור */}
      <div className={styles.formGroup}>
        <label htmlFor="connectionDescription" className={styles.label}>
          <i className="fa fa-align-right"></i> תיאור (אופציונלי):
        </label>
        <textarea
          id="connectionDescription"
          name="connectionDescription"
          className={styles.textarea}
          value={data.connectionDescription || ''}
          onChange={handleDescriptionChange}
          placeholder="תאר את מטרת החיבור, לדוגמה: חיבור לטופס תרומות באתר הראשי"
          rows="4"
        />
        <span className={styles.hint}>
          <i className="fa fa-info-circle"></i>
          הוסף תיאור מפורט כדי לזהות בקלות את החיבור בעתיד
        </span>
      </div>

      {/* סטטוס */}
      <div className={styles.formGroup}>
        <label htmlFor="connectionStatus" className={styles.label}>
          <i className="fa fa-toggle-on"></i> סטטוס:
        </label>
        <select
          id="connectionStatus"
          name="connectionStatus"
          className={styles.select}
          value={data.connectionStatus || 'active'}
          onChange={handleStatusChange}
        >
          <option value="active">פעיל</option>
          <option value="inactive">מושבת</option>
        </select>
        <span className={styles.hint}>
          <i className="fa fa-info-circle"></i>
          ברירת מחדל: פעיל
        </span>
      </div>

      {/* תצוגה מקדימה */}
      {data.connectionName && (
        <div className={styles.previewBox}>
          <h5>
            <i className="fa fa-eye"></i> תצוגה מקדימה
          </h5>
          <div className={styles.previewContent}>
            <div className={styles.previewRow}>
              <strong>סוג החיבור:</strong>
              <span>{data.connectionTypeDescription || data.connectionTypeName}</span>
            </div>
            <div className={styles.previewRow}>
              <strong>שם החיבור:</strong>
              <span>{data.connectionName}</span>
            </div>
            {data.connectionDescription && (
              <div className={styles.previewRow}>
                <strong>תיאור:</strong>
                <span>{data.connectionDescription}</span>
              </div>
            )}
            <div className={styles.previewRow}>
              <strong>סטטוס:</strong>
              <span className={data.connectionStatus === 'active' ? styles.statusActive : styles.statusInactive}>
                {data.connectionStatus === 'active' ? 'פעיל' : 'מושבת'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.infoBox}>
        <i className="fa fa-lightbulb-o"></i>
        <div>
          <strong>טיפ:</strong>
          <p>
            בחר שם ותיאור ברורים שיעזרו לך לזהות את החיבור בעתיד. 
            למשל: "תרומות - אתר ראשי 2024" או "רישום לאירוע - צרידי".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2ConnectionDetails;