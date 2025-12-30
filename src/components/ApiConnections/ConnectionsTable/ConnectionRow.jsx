import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';  // ✅ תיקון: השתמש ב-named import
import styles from './ConnectionsTable.module.css';
import { getIconForConnectionType } from '../../../constants/connectionTypes';

const ConnectionRow = ({ connection, onEdit, onTest, onDelete, onViewToken }) => {
  const [showQR, setShowQR] = useState(false); // ✅ הוסף state
    const [copied, setCopied] = useState(false);
  

    
  // ✅ פונקציה להעתקת הטוקן
  const handleCopyToken = () => {
    navigator.clipboard.writeText(connection.apiToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // אחרי 2 שניות, תחזיר למצב רגיל
    }).catch(err => {
      console.error('שגיאה בהעתקת הטוקן:', err);
    });
  };
  const formatLastUsed = (date) => {
    if (!date) return 'מעולם לא נעשה בו שימוש';
    
    const lastUsed = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - lastUsed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'היום';
    if (diffDays === 2) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
    return `לפני ${Math.floor(diffDays / 365)} שנים`;
  };

  const formatPaymentMethods = (methods) => {
    if (!methods || methods.length === 0) return 'לא הוגדרו';
    console.log(methods);
    
    const methodNames = {
      'credit_card': 'כרטיס אשראי',
      'bit': 'ביט',
      'gama_bit': 'גמא ביט',
      'paybox': 'Paybox',
      'open_finance': 'עברה דיגיטלית',
      'recurring_payment': 'הוראת קבע',
      'recurring_payment_immediate': 'הוראת קבע + חיוב מידי',
      'recurring_payment_bank': 'הוראת קבע בנקאית',
      'credit_card_touch': 'סליקה ישירה',
      'cash': 'מזומן'
    };
    
    return methods.map(m => methodNames[m] || m).join(', ');
  };

  return (
    <tr className={styles.tableRow}>
      {/* סוג החיבור */}
      <td>
        <div className={styles.typeCell}>
          <div className={styles.typeIcon}>
            <i className={`fa ${getIconForConnectionType(connection.connectionTypeName)}`}></i>
          </div>
          <div>
            <div className={styles.typeLabel}>{connection.connectionTypeDescription}</div>
            <div className={styles.typeSubLabel}>{connection.connectionTypeName}</div>
          </div>
        </div>
      </td>

      {/* שם ותיאור */}
      <td>
        <div className={styles.nameCell}>
          <strong>{connection.name}</strong>
          {connection.description && (
            <span className={styles.description} title={connection.description}>
              {connection.description}
            </span>
          )}
        </div>
      </td>

      {/* אמצעי תשלום */}
      <td>
        <div className={styles.paymentMethodsCell}>
          {console.log(connection)}
          {formatPaymentMethods(connection.paymentMethods)}
        </div>
      </td>

      {/* Token */}
      {/* <td>
        <button
          className={styles.tokenBtn}
          onClick={() => onViewToken(connection)}
          title="הצג Token מלא"
        >
          <i className="fa fa-key"></i>
          {connection.token ? `${connection.apiToken.substring(0, 3)}...` : 'לא זמין'}
        </button>
      </td> */}

      {/* QA ID / QR Code */}
      <td>
        <div className={styles.qaIdCell}>
          {/* ✅ QR Code Button */}
          <button
            className={styles.qrBtn}
            onClick={() => setShowQR(!showQR)}
            title="סרוק QR Code של ה-API Token"
          >
            <i className="fa fa-qrcode"></i>
          </button>
          
          {/* ✅ QR Code Modal */}
     {showQR && (
        <div className={styles.qrModal}>
          <div className={styles.qrContent}>
            <button 
              className={styles.closeBtn}
              onClick={() => setShowQR(false)}
            >
              ✕
            </button>
            
            <h4>QR Code - API Token</h4>
            <p className={styles.qrLabel}>{connection.name}</p>
            
            {/* ✅ תיקון: השתמש ב-QRCodeSVG */}
            <QRCodeSVG
              value={connection.apiToken || 'No Token'}
              size={250}
              level="H"
              includeMargin={true}
            />
                        {/* ✅ לחיצה להעתקה */}
                <h6 
                  className={styles.tokenClickable}
                  onClick={handleCopyToken}
                  title="לחץ להעתקה"
                >
                  {connection.apiToken}
                  <i className={`fa ${copied ? 'fa-check' : 'fa-copy'}`} style={{ marginRight: '8px' }}></i>
                </h6>
                
                {/* ✅ הודעת הצלחה */}
                {copied && (
                  <p className={styles.copiedMsg}>
                    ✓ הועתק ללוח!
                  </p>
                )}

            <p className={styles.qrHint}>
              <i className="fa fa-mobile"></i>
              סרוק עם המכשיר שלך
            </p>
          </div>
        </div>
      )}
          
          {/* ✅ Fallback - QA ID Text */}
          {/* <code className={styles.qaId}>
            {connection.qaId || connection.token || 'N/A'}
          </code> */}
        </div>
      </td>

      {/* שימוש אחרון */}
      <td>
        <span className={styles.lastUsed}>
          {formatLastUsed(connection.lastUsed)}
        </span>
      </td>

      {/* סטטוס */}
      <td>
        <span className={`${styles.statusBadge} ${connection.status === 'active' ? styles.active : styles.inactive}`}>
          {connection.status === 'active' ? 'פעיל' : 'לא פעיל'}
        </span>
      </td>

      {/* פעולות */}
      <td>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => onEdit(connection)}
            title="ערוך"
          >
            <i className="fa fa-edit"></i>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.testBtn}`}
            onClick={() => onTest(connection)}
            title="בדוק חיבור"
          >
            <i className="fa fa-flask"></i>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(connection)}
            title="מחק"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ConnectionRow;