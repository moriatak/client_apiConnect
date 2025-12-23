import React, { useEffect } from 'react';
import styles from './Steps.module.css';
import { generateQaId } from '../../../../utils/tokenGenerator';

const Step6TokenAndQA = ({ data, updateData }) => {
  // יצירת QA ID אוטומטית
useEffect(() => {
  if (data.connectionTypeName && !data.qaId && !data.qaIdGenerated) {
    const autoQaId = generateQaId(data.connectionTypeName);
    updateData({ 
      qaId: autoQaId,
      qaIdGenerated: true // ✅ מונע לופ
    });
  }
}, [data.connectionTypeName]); // ✅ כבר נכון

  const handleQaIdChange = (e) => {
    updateData({ qaId: e.target.value.toUpperCase() });
  };

  const handleGenerateNewQaId = () => {
    const newQaId = generateQaId(data.connectionTypeName);
    updateData({ qaId: newQaId });
  };

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>
        <i className="fa fa-barcode"></i>
        שלב 6: QA ID
      </h4>
      <p className={styles.stepDescription}>
        QA ID מזהה ייחודי לחיבור. נוצר אוטומטית, ניתן לערוך.
      </p>

      <div className={styles.formGroup}>
        <label htmlFor="qaId" className={styles.label}>
          <i className="fa fa-tag"></i> QA ID:
        </label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            id="qaId"
            name="qaId"
            className={styles.input}
            value={data.qaId || ''}
            onChange={handleQaIdChange}
            placeholder="XX-123"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleGenerateNewQaId}
            title="צור QA ID חדש"
          >
            <i className="fa fa-refresh"></i> צור מזהה חדש
          </button>
        </div>
        <span className={styles.hint}>
          <i className="fa fa-lightbulb-o"></i>
          פורמט: XX-123 (2-3 אותיות, מקף, 3 ספרות)
        </span>
      </div>

      {data.qaId && (
        <div className={styles.previewBox}>
          <h5>
            <i className="fa fa-eye"></i> QA ID שנוצר
          </h5>
          <div className={styles.previewContent}>
            <div className={styles.qaIdDisplay}>
              <code>{data.qaId}</code>
              <span className={styles.qaIdBadge}>
                {data.connectionTypeDescription}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.warningBox}>
        <i className="fa fa-exclamation-triangle"></i>
        <div>
          <strong>חשוב לדעת:</strong>
          <ul>
            <li>QA ID משמש לזיהוי החיבור במערכת</li>
            <li>וודא ש-QA ID ייחודי ולא קיים במערכת</li>
            <li>ניתן לשנות את ה-QA ID בכל עת</li>
          </ul>
        </div>
      </div>

      <div className={styles.infoBox}>
        <i className="fa fa-info-circle"></i>
        <div>
          <strong>Token API:</strong>
          <p>
            Token ייחודי (3 תווים) ו-API Token (50 תווים) ייווצרו אוטומטית בשמירת החיבור
            ויוצגו לך בסיום התהליך.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step6TokenAndQA;