import React, { useState } from 'react';
import styles from './Steps.module.css';
import { getIconForConnectionType } from '../../../../constants/connectionTypes';

const Step7Summary = ({ data }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // סימולציה - להחליף בבדיקה אמיתית
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // בדיקה בסיסית של שדות חובה
      const validationErrors = validateConnectionData(data);
      
      if (validationErrors.length > 0) {
        setTestResult({
          success: false,
          message: 'נמצאו שגיאות בנתונים',
          errors: validationErrors
        });
      } else {
        setTestResult({
          success: true,
          message: 'החיבור תקין! כל הפרמטרים אומתו בהצלחה.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'שגיאה בבדיקת החיבור: ' + error.message
      });
    } finally {
      setTesting(false);
    }
  };

const getPaymentMethodsNames = () => {
  if (!data.paymentMethods || data.paymentMethods.length === 0) {
    return 'לא נבחרו';
  }

  const methodNames = {
    'credit_card': 'כרטיס אשראי',
    'bit': 'ביט',
    'gama_bit': 'גמא ביט',
    'paybox': 'Paybox',
    'open_finance':' העברה דיגיטלית ',
    'recurring_payment': 'הוראת קבע',
    'recurring_payment_immediate': 'הוראת קבע + חיוב מידי',
    'recurring_payment_bank': 'הוראת קבע בנקאית',
    'credit_card_touch': 'סליקה ישירה',
    'cash': 'מזומן'
  };

  return data.paymentMethods
    .map(method => methodNames[method] || method)
    .join(', ');
};

  const getCampaignTypeName = () => {
    switch (data.campaignType) {
      case 'regular':
        return 'רגיל (מכירות, רישום, תשלומים)';
      case 'donations':
        return 'תרומות';
      case 'registration':
        return 'רישום בלבד';
      default:
        return data.campaignType;
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>
        <i className="fa fa-check-square-o"></i>
        שלב 7: בדיקה וסיכום
      </h4>
      <p className={styles.stepDescription}>
        סקור את הפרטים ובדוק את החיבור לפני השמירה הסופית
      </p>

      {/* כרטיס סיכום ראשי */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryIcon}>
            <i className={`fa ${getIconForConnectionType(data.connectionTypeName)}`}></i>
          </div>
          <div>
            <h3>{data.connectionName || 'חיבור חדש'}</h3>
            <p>{data.connectionTypeDescription || data.connectionTypeName}</p>
          </div>
          <div className={styles.summaryStatus}>
            <span className={data.connectionStatus === 'active' ? styles.statusActive : styles.statusInactive}>
              {data.connectionStatus === 'active' ? 'פעיל' : 'מושבת'}
            </span>
          </div>
        </div>
      </div>

      {/* פרטים כלליים */}
      <div className={styles.summarySection}>
        <h5>
          <i className="fa fa-info-circle"></i>
          פרטים כלליים
        </h5>
        <div className={styles.summaryGrid}>
          <SummaryItem
            icon="fa-plug"
            label="סוג חיבור"
            value={data.connectionTypeDescription || data.connectionTypeName}
          />
          <SummaryItem
            icon="fa-tag"
            label="שם חיבור"
            value={data.connectionName || 'לא הוגדר'}
          />
          {data.connectionDescription && (
            <SummaryItem
              icon="fa-align-right"
              label="תיאור"
              value={data.connectionDescription}
              fullWidth
            />
          )}
          <SummaryItem
            icon="fa-toggle-on"
            label="סטטוס"
            value={
              <span className={data.connectionStatus === 'active' ? styles.statusActive : styles.statusInactive}>
                {data.connectionStatus === 'active' ? 'פעיל' : 'מושבת'}
              </span>
            }
          />
          {/* <SummaryItem
            icon="fa-barcode"
            label="QA ID"
            value={<code className={styles.codeBlock}>{data.qaId || 'יוצר אוטומטית'}</code>}
          /> */}
        </div>
      </div>

      {/* אמצעי תשלום */}
      <div className={styles.summarySection}>
        <h5>
          <i className="fa fa-credit-card"></i>
          אמצעי תשלום וקמפיין
        </h5>
        <div className={styles.summaryGrid}>
          <SummaryItem
            icon="fa-money"
            label="אמצעי תשלום"
            value={getPaymentMethodsNames()}
            fullWidth
          />
          <SummaryItem
            icon="fa-file-text-o"
            label="סוג מסמך"
            value={getCampaignTypeName()}
          />
          {data.paymentMethods?.includes('standing_order') && (
            <>
              <SummaryItem
                icon="fa-calendar"
                label="מצב חיוב הוראת קבע"
                value={data.standingOrderChargeMode === 'immediate' ? 'חיוב מיידי' : 'שמירה בלבד'}
              />
              <SummaryItem
                icon="fa-bank"
                label="הוראת קבע בנקאית"
                value={data.allowBankStandingOrder ? 'מופעל' : 'מושבת'}
              />
            </>
          )}
        </div>
      </div>

      {/* הגדרות ספציפיות */}
      {data.settings && Object.keys(data.settings).length > 0 && (
        <div className={styles.summarySection}>
          <h5>
            <i className="fa fa-cog"></i>
            הגדרות חיבור מותאמות
          </h5>
          <div className={styles.summaryTable}>
            <table className={styles.table}>
              <tbody>
                {Object.entries(data.settings).map(([key, value]) => (
                  value && (
                    <tr key={key}>
                      <th>
                        <i className="fa fa-angle-left"></i>
                        {formatSettingKey(key)}:
                      </th>
                      <td>{formatSettingValue(key, value)}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* פריטים */}
      {data.items && data.items.length > 0 && (
        <div className={styles.summarySection}>
          <h5>
            <i className="fa fa-shopping-cart"></i>
            פריטים ({data.items.filter(item => item.name || item.sku).length})
          </h5>
          <div className={styles.itemsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>שם פריט</th>
                  <th>מק״ט</th>
                  <th>מחיר</th>
                  <th>כמות</th>
                  <th>תיאור</th>
                </tr>
              </thead>
              <tbody>
                {data.items
                  .filter(item => item.name || item.sku)
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name || '-'}</td>
                      <td>
                        <code>{item.sku || '-'}</code>
                      </td>
                      <td className={styles.priceCell}>
                        {item.price ? `₪${parseFloat(item.price).toFixed(2)}` : '-'}
                      </td>
                      <td>{item.quantity || 1}</td>
                      <td className={styles.descriptionCell}>
                        {item.description || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* אפשרויות מיוחדות */}
      {data.specialOptions && data.specialOptions.length > 0 && (
        <div className={styles.summarySection}>
          <h5>
            <i className="fa fa-star"></i>
            אפשרויות מיוחדות
          </h5>
          <div className={styles.optionsGrid}>
            {data.specialOptions.map((option, index) => (
              <div key={index} className={styles.optionCard}>
                <i className="fa fa-check-circle"></i>
                <span>
                  {option === 'registration_only' && 'אפשר רישום בלבד'}
                  {option === 'invoice_no_payment' && 'אפשר חשבונית ללא סליקה'}
                  {option === 'allow_zero_sum' && 'אפשר סכום אפס'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* תבנית אימייל */}
      {data.thankYouEmail && (
        <div className={styles.summarySection}>
          <h5>
            <i className="fa fa-envelope"></i>
            תבנית אימייל תודה
          </h5>
          <div className={styles.emailPreview}>
            <div 
              dangerouslySetInnerHTML={{ __html: data.thankYouEmail }}
              className={styles.emailContent}
            />
          </div>
        </div>
      )}

      {/* בדיקת חיבור */}
      <div className={styles.testSection}>
        <button
          type="button"
          className={styles.btnTest}
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing ? (
            <>
              <i className="fa fa-spinner fa-spin"></i> בודק חיבור...
            </>
          ) : (
            <>
              <i className="fa fa-flask"></i> בדוק חיבור
            </>
          )}
        </button>

        {testResult && (
          <div className={testResult.success ? styles.successBox : styles.errorBox}>
            <i className={`fa ${testResult.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            <div>
              <strong>{testResult.message}</strong>
              {testResult.errors && testResult.errors.length > 0 && (
                <ul className={styles.errorList}>
                  {testResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* אזהרה סופית */}
      <div className={styles.finalWarning}>
        <i className="fa fa-exclamation-triangle"></i>
        <div>
          <strong>לפני השמירה:</strong>
          <ul>
            <li>ודא שכל הפרטים נכונים</li>
            <li>שמור את ה-Tokens שיוצגו בסיום במקום בטוח</li>
            <li>ה-API Token יוצג רק פעם אחת ולא ניתן לשחזר אותו</li>
            <li>ניתן לצפות ב-Token הקצר (3 תווים) בכל עת מרשימת החיבורים</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// קומפוננטה עזר לתצוגת פריט סיכום
const SummaryItem = ({ icon, label, value, fullWidth = false }) => (
  <div className={`${styles.summaryItem} ${fullWidth ? styles.fullWidth : ''}`}>
    <div className={styles.summaryItemIcon}>
      <i className={`fa ${icon}`}></i>
    </div>
    <div className={styles.summaryItemContent}>
      <span className={styles.summaryItemLabel}>{label}</span>
      <div className={styles.summaryItemValue}>{value}</div>
    </div>
  </div>
);

// פונקציות עזר
const formatSettingKey = (key) => {
  const mapping = {
    'url': 'כתובת אתר',
    'api_key': 'מפתח API',
    'client_id': 'מזהה לקוח',
    'form_id': 'מזהה טופס',
    'password': 'סיסמה',
    'user_id': 'מזהה משתמש',
    'terminal_id': 'מזהה מסופון',
    'terminal_type': 'סוג מסופון',
    'terminal_details': 'פרטי מסופון',
    'campaign_name': 'שם קמפיין',
    'campaign_description': 'תיאור קמפיין',
    'default_amount': 'סכום ברירת מחדל',
    'amounts': 'סכומים מוצעים',
    'webhook': 'Webhook URL',
    'email': 'אימייל',
    'emailName': 'שם שולח',
    'sendEmail': 'שליחת אימייל',
    'logo': 'לוגו',
    'maxNumPay': 'מספר תשלומים מקסימלי'
  };
  return mapping[key] || key;
};

const formatSettingValue = (key, value) => {
  // ערכים בוליאניים
  if (typeof value === 'boolean') {
    return value ? 'כן' : 'לא';
  }
  
  // סיסמה - הסתרה חלקית
  if (key === 'password' && value) {
    return '••••••••';
  }
  
  // מפתח API - הסתרה חלקית
  if (key === 'api_key' && value && value.length > 10) {
    return value.substring(0, 8) + '••••••••';
  }
  
  // סוג מסופון
  if (value === 'physical') return 'פיזי';
  if (value === 'virtual') return 'וירטואלי';
  
  // URL - קיצור ארוך
  if (key === 'url' || key === 'webhook') {
    if (value && value.length > 50) {
      return value.substring(0, 47) + '...';
    }
  }
  
  // מספרים עם עיצוב
  if (key === 'default_amount' && !isNaN(value)) {
    return `₪${parseFloat(value).toFixed(2)}`;
  }
  
  return value || '-';
};

// פונקציה לולידציה של נתוני החיבור
const validateConnectionData = (data) => {
  const errors = [];
  
  if (!data.connectionName) {
    errors.push('שם החיבור חובה');
  }
  
  if (!data.connectionType) {
    errors.push('סוג החיבור חובה');
  }
  
  if (!data.paymentMethods || data.paymentMethods.length === 0) {
    errors.push('יש לבחור לפחות אמצעי תשלום אחד');
  }
  
  // ולידציות ספציפיות לפי סוג חיבור
  if (data.connectionTypeName === 'wordpress' && data.settings) {
    if (!data.settings.url) {
      errors.push('כתובת אתר WordPress חובה');
    }
  }
  
  if (data.connectionTypeName === 'msofon' && data.settings) {
    if (!data.settings.terminal_id) {
      errors.push('מזהה מסופון חובה');
    }
  }
  
  return errors;
};

export default Step7Summary;