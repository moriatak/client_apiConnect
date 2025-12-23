import React, { useState } from 'react';
import styles from './Modal.module.css';
import { 
  copyToClipboard, 
  formatShortTokenForDisplay,
  formatApiTokenForDisplay,
  identifyTokenType 
} from '../../../utils/tokenGenerator';

const TokenModal = ({ connection, onClose }) => {
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);

  const handleCopyToken = async (token, isShort = true) => {
    const success = await copyToClipboard(token);
    
    if (success) {
      if (isShort) {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopiedApi(true);
        setTimeout(() => setCopiedApi(false), 2000);
      }
    }
  };

  const shortToken = connection.token?.trim() || '';
  const apiToken = connection.apiToken || '';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <i className="fa fa-key"></i> פרטי חיבור - Tokens
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.warningBox}>
            <i className="fa fa-exclamation-triangle"></i>
            <div>
              <strong>חשוב מאוד!</strong>
              <p>שמור את ה-Tokens במקום מאובטח. אל תשתף אותם באופן פומבי.</p>
            </div>
          </div>

          {/* Connection Info */}
          <div className={styles.connectionInfo}>
            <h4>
              <i className="fa fa-info-circle"></i> פרטי החיבור
            </h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>שם החיבור:</strong>
                <span>{connection.name}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>סוג:</strong>
                <span>{connection.connectionTypeDescription}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>ID קמפיין:</strong>
                <span>{connection.campaignId}</span>
              </div>
            </div>
          </div>

          {/* Short Token (3 chars) */}
          <div className={styles.tokenDisplay}>
            <label>
              <i className="fa fa-tag"></i> Token קצר (3 תווים):
              <span className={styles.tokenBadge}>קמפיין</span>
            </label>
            <div className={styles.tokenInput}>
              <input
                type="text"
                value={shortToken}
                readOnly
                className={styles.input}
                onClick={(e) => e.target.select()}
              />
              <button
                className={`${styles.copyBtn} ${copiedShort ? styles.copied : ''}`}
                onClick={() => handleCopyToken(shortToken, true)}
              >
                <i className={`fa ${copiedShort ? 'fa-check' : 'fa-copy'}`}></i>
                {copiedShort ? 'הועתק!' : 'העתק'}
              </button>
            </div>
            <span className={styles.tokenHint}>
              <i className="fa fa-lightbulb-o"></i>
              משמש לזיהוי הקמפיין במערכת הפנימית
            </span>
          </div>

          {/* API Token (50 chars) */}
          <div className={styles.tokenDisplay}>
            <label>
              <i className="fa fa-key"></i> API Token (50 תווים):
              <span className={`${styles.tokenBadge} ${styles.apiBadge}`}>API</span>
            </label>
            <div className={styles.tokenInput}>
              <input
                type="text"
                value={apiToken}
                readOnly
                className={`${styles.input} ${styles.apiTokenInput}`}
                onClick={(e) => e.target.select()}
              />
              <button
                className={`${styles.copyBtn} ${copiedApi ? styles.copied : ''}`}
                onClick={() => handleCopyToken(apiToken, false)}
              >
                <i className={`fa ${copiedApi ? 'fa-check' : 'fa-copy'}`}></i>
                {copiedApi ? 'הועתק!' : 'העתק'}
              </button>
            </div>
            <span className={styles.tokenHint}>
              <i className="fa fa-lightbulb-o"></i>
              משמש לאימות חיצוני דרך API - שמור אותו במקום מאובטח!
            </span>
          </div>

          {/* QR Code for API Token */}
          <div className={styles.qrCode}>
            <p>
              <i className="fa fa-qrcode"></i> קוד QR ל-API Token
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(apiToken)}`}
              alt="QR Code"
              loading="lazy"
            />
            <span className={styles.qrHint}>סרוק עם המכשיר הנייד</span>
          </div>

          {/* Usage Instructions */}
          <div className={styles.usageInstructions}>
            <h4>
              <i className="fa fa-book"></i> הוראות שימוש
            </h4>
            <div className={styles.instructionsGrid}>
              <div className={styles.instructionCard}>
                <div className={styles.instructionIcon}>
                  <i className="fa fa-tag"></i>
                </div>
                <div>
                  <strong>Token קצר</strong>
                  <p>משמש לזיהוי הקמפיין בממשק הניהול ובקישורים פנימיים</p>
                </div>
              </div>
              <div className={styles.instructionCard}>
                <div className={styles.instructionIcon}>
                  <i className="fa fa-key"></i>
                </div>
                <div>
                  <strong>API Token</strong>
                  <p>משמש לאימות בקריאות API חיצוניות. העבר ב-Header: Authorization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Example API Call */}
          <div className={styles.codeExample}>
            <h5>
              <i className="fa fa-code"></i> דוגמה לשימוש ב-API
            </h5>
            <pre>
              <code>
{`curl -X POST https://qa.tak.co.il/api/payment \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 100, "currency": "ILS"}'`}
              </code>
            </pre>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            <i className="fa fa-times"></i> סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenModal;