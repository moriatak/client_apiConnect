import React, { useState, useEffect } from 'react';
import styles from './ConnectionFormModal.module.css';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { usePaymentMethods } from '../../../contexts/PaymentMethodsContext';
import ItemsManager from '../../shared/ItemsManager';

const ConnectionFormModal = ({
    isOpen,
    onClose,
    onSave,
      onSuccess, // ✅ הוסף

    connection = null, // null = חדש, object = עריכה
    connectionTypes = []
}) => {
    const [formData, setFormData] = useState({
        connectionType: '',
        connectionTypeName: '',
        connectionName: '',
        connectionDescription: '',
        connectionStatus: 'active',
        paymentMethods: [],
        paymentButtonTexts: {}, // ✅ הוסף את זה

        campaignType: 'regular',
        settings: {}
    });

    const [loading, setLoading] = useState(false);
    const [currentSection, setCurrentSection] = useState('basic'); // basic, payment, advanced
    const [showSummary, setShowSummary] = useState(false);
    const isEditMode = !!connection;

useEffect(() => {
  if (connection) {
    
    // ✅ מצב עריכה — טוען את כל הנתונים מהחיבור הקיים
    setFormData({
      connectionType: connection.connectionType || connection.IdConnectType || '',
      connectionTypeName: connection.connectionTypeName || connection.Name || '',
      connectionName: connection.name || connection.connectionName || connection.Name || '',
      connectionDescription: connection.description || connection.connectionDescription || connection.Description || '',
      connectionStatus: connection.status === 'active' ? 'active' : (connection.connectionStatus || 'active'),
      paymentMethods: connection.paymentMethods || [],
      paymentButtonTexts: connection.paymentButtonTexts || {},
      campaignType: connection.campaignType || 'regular',
      settings: connection.settings || {},
      emailSubject: connection.emailSubject || '',
      thankYouEmail: connection.thankYouEmail || '',
      items: connection.items || [],
      
      // ✅ הוסף שדות נוספים שחוזרים מהשרת
     
      // ✅ 4 שדות מייל
      email: connection.email || connection.Email || '',  // ⬅️ הוסף גם Email עם E גדולה
      emailName: connection.emailName || connection.EmailName || '',
      emailSubject: connection.emailSubject || connection.paySuccessMailTitle || '',
      thankYouEmail: connection.thankYouEmail || connection.emailNote || connection.EmailNote || '',
      maxNumPay: connection.maxNumPay || 1,
      specialOptions: connection.specialOptions || [],
      rules: connection.rules || '',
      rulesTitle: connection.rulesTitle || '',
      rulesShow: connection.rulesShow || false,
      discount: connection.discount || {},
      webhook: connection.webhook || '',
      paymentMethodsDetails: connection.paymentMethodsDetails || []
    });
    
    setCurrentSection('basic'); // ✅ התחל מהטב הראשון
    setShowSummary(false); // ✅ אל תהיה בסיכום
  } else {
    // ✅ מצב חדש - איפוס
    setFormData({
      connectionType: '',
      connectionTypeName: '',
      connectionName: '',
      connectionDescription: '',
      connectionStatus: 'active',
      paymentMethods: [],
      paymentButtonTexts: {},
      campaignType: 'regular',
      settings: {},
      emailSubject: '',
      thankYouEmail: '',
      items: [],
      email: '',
      emailName: '',
      sendEmail: false,
      maxNumPay: 1,
      specialOptions: [],
      rules: '',
      rulesTitle: '',
      rulesShow: false,
      discount: {},
      webhook: '',
      paymentMethodsDetails: []
    });
  }
}, [connection, isOpen]); // ✅ תלויות חשובות!

  // עדכון אוטומטי של שם כאשר בוחרים סוג חיבור (במצב חדש בלבד)
  useEffect(() => {
    if (!connection && connectionTypes.length > 0 && formData.connectionType && !formData.connectionName) {
      const selectedType = connectionTypes.find(t => t.IdConnectType === formData.connectionType);
      if (selectedType) {
        const defaultName = `${selectedType.Name}`;
        setFormData(prev => ({
          ...prev,
          connectionName: defaultName,
          connectionTypeName: selectedType.Name,
          connectionDescription: selectedType.Description
        }));
      }
    }
  }, [formData.connectionType, connectionTypes, connection]);
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        // ✅ קודם - הצג סיכום
        if (!showSummary) {
            setShowSummary(true);
            return;
        }
 // 🔍 DEBUG: בדיקה לפני שליחה
  console.log('📤 formData before save:', {
    email: formData.email,
    emailName: formData.emailName,
    emailSubject: formData.emailSubject,
    thankYouEmail: formData.thankYouEmail
  });
        // ✅ אחרי אישור - שמור
        setLoading(true);
      try {
    const result = await onSave(formData);
    
    if (result && result.success) {
      // ✅ קריאה ל-onSuccess עם התוצאה
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    }
  } catch (error) {
    console.error('Error saving connection:', error);
  } finally {
    setLoading(false);
  }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h3>
                        <i className={`fa ${isEditMode ? 'fa-edit' : 'fa-plus'}`}></i>
                        {isEditMode ? 'עריכת חיבור' : 'חיבור חדש'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${currentSection === 'basic' ? styles.active : ''}`}
                        onClick={() => setCurrentSection('basic')}
                    >
                        <i className="fa fa-info-circle"></i>
                        פרטים בסיסיים
                    </button>
                    <button
                        className={`${styles.tab} ${currentSection === 'payment' ? styles.active : ''}`}
                        onClick={() => setCurrentSection('payment')}
                    >
                        <i className="fa fa-credit-card"></i>
                        תשלומים
                    </button>
                    <button
                        className={`${styles.tab} ${currentSection === 'advanced' ? styles.active : ''}`}
                        onClick={() => setCurrentSection('advanced')}
                    >
                        <i className="fa fa-cog"></i>
                        מתקדם
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {!showSummary ? (
                        <>
                            {currentSection === 'basic' && (
                                <BasicSection
                                    formData={formData}
                                    onChange={handleChange}
                                    connectionTypes={connectionTypes}
                                    isEditMode={isEditMode}
                                />
                            )}

                            {currentSection === 'payment' && (
                                <PaymentSection
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            )}

                            {currentSection === 'advanced' && (
                                <AdvancedSection
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            )}
                        </>
                    ) : (
                        <SummarySection formData={formData} /> // ✅ סיכום
                    )}
                </div>
                {/* Footer */}
                <div className={styles.modalFooter}>
                    {showSummary ? (
                        <>
                            <button className={styles.btnCancel} onClick={() => setShowSummary(false)}>
                                <i className="fa fa-arrow-right"></i>
                                חזור לעריכה
                            </button>
                            <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin"></i>
                                        שומר...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-check"></i>
                                        אשר ושמור
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.btnCancel} onClick={onClose}>
                                <i className="fa fa-times"></i>
                                ביטול
                            </button>
                            <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={!formData.connectionName}
                            >
                                <i className="fa fa-arrow-left"></i>
                                המשך לסיכום
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ✅ קומפוננטות עזר פנימיות
// const BasicSection = ({ formData, onChange, connectionTypes, isEditMode }) => (
//     <div className={styles.section}>
//         <h4><i className="fa fa-info-circle"></i> מידע כללי</h4>

//         {/* סוג חיבור */}
//         {!isEditMode && (
//             <div className={styles.formGroup}>
//                 <label>סוג חיבור: <span className={styles.required}>*</span></label>

//                 <select
//                     value={formData.connectionType}
//                     onChange={(e) => {
//                         const selectedId = parseInt(e.target.value);
//                         const selectedType = connectionTypes.find(t => t.IdConnectType === selectedId);

//                         if (selectedType) {
//                             // ✅ מילוי מיידי של שם ברירת מחדל
//                             const defaultName = `${selectedType.Name}`;

//                             onChange('connectionType', selectedId);
//                             onChange('connectionTypeName', selectedType.Name);
//                             onChange('connectionName', defaultName); // ✅ הוסף את זה
//                             onChange('connectionDescription', selectedType.Description);
//                         }
//                     }}
//                 >
//                     <option value="">-- בחר סוג חיבור --</option>
//                     {connectionTypes.map(type => (
//                         <option key={type.IdConnectType} value={type.IdConnectType}>
//                             {type.Description}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//         )}

//         {/* שם */}
//         <div className={styles.formGroup}>
//             <label>שם החיבור: <span className={styles.required}>*</span></label>
//             <input
//                 type="text"
//                 value={formData.connectionName}
//                 onChange={(e) => onChange('connectionName', e.target.value)}
//                 placeholder="למשל: קמפיין תרומות 2024"
//             />
//         </div>

//         {/* תיאור */}
//         <div className={styles.formGroup}>
//             <label>תיאור:</label>
//             <textarea
//                 value={formData.connectionDescription}
//                 onChange={(e) => onChange('connectionDescription', e.target.value)}
//                 placeholder="תאר את מטרת החיבור..."
//                 rows="3"
//             />
//         </div>

//         {/* סטטוס */}
//         <div className={styles.formGroup}>
//             <label>סטטוס:</label>
//             <select
//                 value={formData.connectionStatus}
//                 onChange={(e) => onChange('connectionStatus', e.target.value)}
//             >
//                 <option value="active">פעיל</option>
//                 <option value="inactive">מושבת</option>
//             </select>
//         </div>
//     </div>
// );
const BasicSection = ({ formData, onChange, connectionTypes, isEditMode }) => {


  return (
    <div className={styles.section}>
      <h4><i className="fa fa-info-circle"></i> מידע כללי</h4>


      {/* סוג חיבור */}
      {!isEditMode && (
        <div className={styles.formGroup}>
          <label>סוג חיבור: <span className={styles.required}>*</span></label>
          <select
            value={formData.connectionType || ''}
            onChange={(e) => {
              const selectedId = parseInt(e.target.value);
              const selectedType = connectionTypes.find(t => t.IdConnectType === selectedId);

              if (selectedType) {
                const defaultName = `${selectedType.Name}`;

                onChange('connectionType', selectedId);
                onChange('connectionTypeName', selectedType.Name);
                onChange('connectionName', defaultName);
                onChange('connectionDescription', selectedType.Description);
              }
            }}
          >
            <option value="">-- בחר סוג חיבור --</option>
            {connectionTypes.map(type => (
              <option key={type.IdConnectType} value={type.IdConnectType}>
                {type.Description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* שם */}
      <div className={styles.formGroup}>
        <label>שם החיבור: <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={formData.connectionName || ''}  // ✅ הוסף fallback
          onChange={(e) => {
            onChange('connectionName', e.target.value);
          }}
          placeholder="למשל: קמפיין תרומות 2024"
        />
      </div>

      {/* תיאור */}
      <div className={styles.formGroup}>
        <label>תיאור:</label>
        <textarea
          value={formData.connectionDescription || ''}  // ✅ הוסף fallback
          onChange={(e) => {
            onChange('connectionDescription', e.target.value);
          }}
          placeholder="תאר את מטרת החיבור..."
          rows="3"
        />
      </div>

      {/* סטטוס */}
      <div className={styles.formGroup}>
        <label>סטטוס:</label>
        <select
          value={formData.connectionStatus || 'active'}
          onChange={(e) => onChange('connectionStatus', e.target.value)}
        >
          <option value="active">פעיל</option>
          <option value="inactive">מושבת</option>
        </select>
      </div>
    </div>
  );
};
const PaymentSection = ({ formData, onChange }) => {
    const { availableMethods, loading } = usePaymentMethods();
    const needsButtonCustomization = [3, 4].includes(formData.connectionType);

    const handlePaymentMethodChange = (method, checked) => {
        const currentMethods = formData.paymentMethods || [];
        const newMethods = checked
            ? [...currentMethods, method]
            : currentMethods.filter(m => m !== method);

        onChange('paymentMethods', newMethods);
    };

    const handleButtonTextChange = (method, field, value) => {
        const currentButtonTexts = formData.paymentButtonTexts || {};
        onChange('paymentButtonTexts', {
            ...currentButtonTexts,
            [method]: {
                ...currentButtonTexts[method],
                [field]: value
            }
        });
    };

    if (loading) {
        return <LoadingSpinner message="טוען אמצעי תשלום..." />;
    }
    // ✅ עדכון Title/Description לכפתור תשלום
    // ✅ אמצעי תשלום רגילים
    const regularPaymentMethods = [
        { value: 'credit_card', label: 'כרטיס אשראי', icon: 'fa-credit-card' },
        { value: 'bit', label: 'ביט', icon: 'fa-mobile' },
        { value: 'gama_bit', label: 'גמא ביט', icon: 'fa-mobile-phone' },
        { value: 'paybox', label: 'Paybox', icon: 'fa-cube' },
        { value: 'open_finance', label: 'העברה בנקאית', icon: 'fa-bank' },
        { value: 'credit_card_touch', label: 'סליקה ישירה', icon: 'fa-hand-pointer-o' },
        { value: 'cash', label: 'מזומן', icon: 'fa-money' }
    ];

    return (
        <div className={styles.section}>
            <h4><i className="fa fa-credit-card"></i> אמצעי תשלום</h4>

            {/* אמצעי תשלום רגילים */}
            <div className={styles.paymentGrid}>
                {regularPaymentMethods.map((method) => {
                    const isAvailable = availableMethods.includes(method.value);
                    const isSelected = formData.paymentMethods?.includes(method.value);

                    return isAvailable ? (
                        <div key={method.value} className={styles.paymentMethodWrapper}>
                            <label className={styles.paymentOption}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handlePaymentMethodChange(method.value, e.target.checked)}
                                />
                                <i className={`fa ${method.icon}`}></i>
                                <span>{method.label}</span>
                            </label>

                            {/* ✅ התאמה אישית לכפתור - רק אם נבחר ורלוונטי */}
                            {isSelected && needsButtonCustomization && (
                                <div className={styles.buttonCustomization}>
                                    <div className={styles.customField}>
                                        <label>כיתוב כפתור:</label>
                                        <input
                                            type="text"
                                            placeholder={`לדוגמה: תשלום ב${method.label}`}
                                            value={formData.paymentButtonTexts?.[method.value]?.title || ''}
                                            onChange={(e) => handleButtonTextChange(method.value, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.customField}>
                                        <label>תיאור:</label>
                                        <input
                                            type="text"
                                            placeholder="תיאור קצר לאמצעי התשלום"
                                            value={formData.paymentButtonTexts?.[method.value]?.description || ''}
                                            onChange={(e) => handleButtonTextChange(method.value, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null;
                })}
            </div>

            {/* הוראת קבע - קטע נפרד */}
            <div className={styles.recurringSection}>
                <div className={styles.recurringToggle}>
                    <label className={styles.mainCheckbox}>
                        <input
                            type="checkbox"
                            checked={formData.enableRecurring || false}
                            onChange={(e) => onChange('enableRecurring', e.target.checked)}
                        />
                        <i className="fa fa-refresh"></i>
                        <span>אפשר הוראת קבע</span>
                    </label>
                </div>

                {formData.enableRecurring && (
                    <div className={styles.recurringOptions}>
                        {/* בחירת סוג הוראת קבע */}
                        <div className={styles.recurringTypeSection}>
                            <h5>סוג הוראת קבע:</h5>
                            <div className={styles.radioGroup}>
                                <label>
                                    <input
                                        type="radio"
                                        name="recurringType"
                                        value="immediate"
                                        checked={formData.recurringType === 'immediate'}
                                        onChange={(e) => onChange('recurringType', e.target.value)}
                                    />
                                    הוראת קבע מיידית
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="recurringType"
                                        value="regular"
                                        checked={formData.recurringType === 'regular'}
                                        onChange={(e) => onChange('recurringType', e.target.value)}
                                    />
                                    הוראת קבע רגילה
                                </label>
                            </div>

                            {/* ✅ התאמה אישית לכפתור הוראת קבע */}
                            {needsButtonCustomization && formData.recurringType && (
                                <div className={styles.buttonCustomization}>
                                    <div className={styles.customField}>
                                        <label>כיתוב כפתור:</label>
                                        <input
                                            type="text"
                                            placeholder={`לדוגמה: ${formData.recurringType === 'immediate' ? 'הוראת קבע מיידית' : 'הוראת קבע רגילה'}`}
                                            value={formData.paymentButtonTexts?.[`recurring_${formData.recurringType}`]?.title || ''}
                                            onChange={(e) => handleButtonTextChange(`recurring_${formData.recurringType}`, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.customField}>
                                        <label>תיאור:</label>
                                        <input
                                            type="text"
                                            placeholder="תיאור קצר להוראת הקבע"
                                            value={formData.paymentButtonTexts?.[`recurring_${formData.recurringType}`]?.description || ''}
                                            onChange={(e) => handleButtonTextChange(`recurring_${formData.recurringType}`, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* אופציה להוראת קבע בנקאית */}
                        <div className={styles.bankRecurringSection}>
                            <label className={styles.subCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.enableBankRecurring || false}
                                    onChange={(e) => onChange('enableBankRecurring', e.target.checked)}
                                />
                                <i className="fa fa-bank"></i>
                                <span>אפשר הוראת קבע בנקאית</span>
                            </label>

                            {/* ✅ התאמה אישית לכפתור הוראת קבע בנקאית */}
                            {formData.enableBankRecurring && needsButtonCustomization && (
                                <div className={styles.buttonCustomization}>
                                    <div className={styles.customField}>
                                        <label>כיתוב כפתור:</label>
                                        <input
                                            type="text"
                                            placeholder="לדוגמה: הוראת קבע בנקאית"
                                            value={formData.paymentButtonTexts?.['recurring_payment_bank']?.title || ''}
                                            onChange={(e) => handleButtonTextChange('recurring_payment_bank', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.customField}>
                                        <label>תיאור:</label>
                                        <input
                                            type="text"
                                            placeholder="תיאור קצר"
                                            value={formData.paymentButtonTexts?.['recurring_payment_bank']?.description || ''}
                                            onChange={(e) => handleButtonTextChange('recurring_payment_bank', 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* מטרת המסמך */}
            <div className={styles.campaignTypeSection}>
                <h5>מטרת המסמך:</h5>
                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            name="campaignType"
                            value="regular"
                            checked={formData.campaignType === 'regular'}
                            onChange={(e) => onChange('campaignType', e.target.value)}
                        />
                        רגיל (מכירות, רישום, תשלומים)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="campaignType"
                            value="donations"
                            checked={formData.campaignType === 'donations'}
                            onChange={(e) => onChange('campaignType', e.target.value)}
                        />
                        תרומות
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="campaignType"
                            value="registration"
                            checked={formData.campaignType === 'registration'}
                            onChange={(e) => onChange('campaignType', e.target.value)}
                        />
                        רישום בלבד
                    </label>
                </div>
            </div>
        </div>
    );
};
// const PaymentSection = ({ formData, onChange }) => {
//     const { availableMethods, loading } = usePaymentMethods();

//     const handlePaymentMethodChange = (method, checked) => {
//         const currentMethods = formData.paymentMethods || [];
//         const newMethods = checked
//             ? [...currentMethods, method]
//             : currentMethods.filter(m => m !== method);

//         onChange('paymentMethods', newMethods);
//     };

//     if (loading) {
//         return <LoadingSpinner message="טוען אמצעי תשלום..." />;
//     }

//     // ✅ אמצעי תשלום רגילים
//     const regularPaymentMethods = [
//         { value: 'credit_card', label: 'כרטיס אשראי', icon: 'fa-credit-card' },
//         { value: 'bit', label: 'ביט', icon: 'fa-mobile' },
//         { value: 'gama_bit', label: 'גמא ביט', icon: 'fa-mobile-phone' },
//         { value: 'paybox', label: 'Paybox', icon: 'fa-cube' },
//         { value: 'open_finance', label: 'פתיחות פיננסית', icon: 'fa-bank' },
//         { value: 'credit_card_touch', label: 'סליקה ישירה', icon: 'fa-hand-pointer-o' },
//         { value: 'cash', label: 'מזומן', icon: 'fa-money' }
//     ];

//     return (
//         <div className={styles.section}>
//             <h4><i className="fa fa-credit-card"></i> אמצעי תשלום</h4>

//             {/* אמצעי תשלום רגילים */}
//             <div className={styles.paymentGrid}>
//                 {regularPaymentMethods.map((method) => {
//                     const isAvailable = availableMethods.includes(method.value);
//                     return isAvailable ? (
//                         <label key={method.value} className={styles.paymentOption}>
//                             <input
//                                 type="checkbox"
//                                 checked={formData.paymentMethods?.includes(method.value)}
//                                 onChange={(e) => handlePaymentMethodChange(method.value, e.target.checked)}
//                             />
//                             <i className={`fa ${method.icon}`}></i>
//                             <span>{method.label}</span>
//                         </label>
//                     ) : null;
//                 })}
//             </div>

//             {/* הוראת קבע - קטע נפרד */}
//             <RecurringPaymentSection
//                 formData={formData}
//                 onChange={onChange}
//                 availableMethods={availableMethods}
//                 onPaymentMethodChange={handlePaymentMethodChange}
//             />

//             {/* מטרת המסמך */}
//             <div className={styles.campaignTypeSection}>
//                 <h5>מטרת המסמך:</h5>
//                 <div className={styles.radioGroup}>
//                     <label>
//                         <input
//                             type="radio"
//                             name="campaignType"
//                             value="regular"
//                             checked={formData.campaignType === 'regular'}
//                             onChange={(e) => onChange('campaignType', e.target.value)}
//                         />
//                         רגיל (מכירות, רישום, תשלומים)
//                     </label>
//                     <label>
//                         <input
//                             type="radio"
//                             name="campaignType"
//                             value="donations"
//                             checked={formData.campaignType === 'donations'}
//                             onChange={(e) => onChange('campaignType', e.target.value)}
//                         />
//                         תרומות
//                     </label>
//                     <label>
//                         <input
//                             type="radio"
//                             name="campaignType"
//                             value="registration"
//                             checked={formData.campaignType === 'registration'}
//                             onChange={(e) => onChange('campaignType', e.target.value)}
//                         />
//                         רישום בלבד
//                     </label>
//                 </div>
//             </div>
//         </div>
//     );
// };

// ✅ קומפוננטת הוראות קבע נפרדת
const RecurringPaymentSection = ({ formData, onChange, availableMethods, onPaymentMethodChange }) => {
    const recurringMethods = [
        { value: 'recurring_payment', label: 'הוראת קבע רגילה' },
        { value: 'recurring_payment_immediate', label: 'הוראת קבע מיידית' }
    ];

    const hasRecurring = recurringMethods.some(m => availableMethods.includes(m.value));
    const hasRecurringBank = availableMethods.includes('recurring_payment_bank');

    if (!hasRecurring && !hasRecurringBank) return null;

    const hasSelectedRecurring = formData.paymentMethods?.some(m =>
        recurringMethods.some(rm => rm.value === m)
    );

    const hasSelectedRecurringBank = formData.paymentMethods?.includes('recurring_payment_bank');

    return (
        <div className={styles.recurringSection}>
            <h5><i className="fa fa-repeat"></i> הוראות קבע</h5>

            {/* הוראת קבע רגילה/מיידית */}
            {hasRecurring && (
                <div className={styles.recurringGroup}>
                    <label className={styles.mainCheckbox}>
                        <input
                            type="checkbox"
                            checked={hasSelectedRecurring}
                            onChange={(e) => {
                                if (!e.target.checked) {
                                    // מסיר את כל הוראות הקבע הרגילות
                                    recurringMethods.forEach(m => {
                                        if (formData.paymentMethods?.includes(m.value)) {
                                            onPaymentMethodChange(m.value, false);
                                        }
                                    });
                                }
                            }}
                        />
                        <strong>אפשר הוראת קבע</strong>
                    </label>

                    {hasSelectedRecurring && (
                        <div className={styles.subOptions}>
                            {recurringMethods.map(method =>
                                availableMethods.includes(method.value) && (
                                    <label key={method.value}>
                                        <input
                                            type="radio"
                                            name="recurringType"
                                            checked={formData.paymentMethods?.includes(method.value)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // מסיר את האחר ומוסיף את הנבחר
                                                    recurringMethods.forEach(m => {
                                                        if (m.value !== method.value && formData.paymentMethods?.includes(m.value)) {
                                                            onPaymentMethodChange(m.value, false);
                                                        }
                                                    });
                                                    onPaymentMethodChange(method.value, true);
                                                }
                                            }}
                                        />
                                        {method.label}
                                    </label>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* הוראת קבע בנקאית - נפרד */}
            {hasRecurringBank && (
                <div className={styles.recurringGroup}>
                    <label className={styles.mainCheckbox}>
                        <input
                            type="checkbox"
                            checked={hasSelectedRecurringBank}
                            onChange={(e) => onPaymentMethodChange('recurring_payment_bank', e.target.checked)}
                        />
                        <strong>אפשר הוראת קבע בנקאית</strong>
                    </label>
                    <span className={styles.hint}>
                        <i className="fa fa-info-circle"></i>
                        מאפשר ללקוחות למלא פרטי הוראת קבע ישירות לבנק
                    </span>
                </div>
            )}
        </div>
    );
};

const AdvancedSection = ({ formData, onChange }) => {
  const [showEmail, setShowEmail] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ בעריכה - הצג את הסקציות אוטומטית אם יש תוכן
  useEffect(() => {
    if (formData.emailSubject || formData.thankYouEmail) {
      setShowEmail(true);
    }
    if (formData.items && formData.items.length > 0) {
      setShowItems(true);
    }
  }, [formData.emailSubject, formData.thankYouEmail, formData.items]);

  return (
    <div className={styles.section}>
      <h4><i className="fa fa-cog"></i> הגדרות מתקדמות</h4>
      <p className={styles.sectionDescription}>
        {formData.emailSubject || formData.thankYouEmail ? '✅ מייל תודה קיים' : ''}
        {formData.items && formData.items.length > 0 ? '✅ ' + formData.items.length + ' פריטים' : ''}
      </p>

      {/* כפתורי פתיחה */}
      <div className={styles.optionalButtons}>
        <button
          type="button"
          className={`${styles.optionalBtn} ${showEmail ? styles.active : ''}`}
          onClick={() => setShowEmail(!showEmail)}
        >
          <i className="fa fa-envelope"></i>
          {showEmail ? 'הסתר' : 'הוסף'} תבנית מייל תודה
          {formData.emailSubject && <span className={styles.badge}>✅</span>}
        </button>

        <button
          type="button"
          className={`${styles.optionalBtn} ${showItems ? styles.active : ''}`}
          onClick={() => setShowItems(!showItems)}
        >
          <i className="fa fa-list"></i>
          {showItems ? 'הסתר' : 'הוסף'} ניהול פריטים
          {formData.items && formData.items.length > 0 && <span className={styles.badge}>{formData.items.length}</span>}
        </button>

        <button
          type="button"
          className={`${styles.optionalBtn} ${showSettings ? styles.active : ''}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <i className="fa fa-sliders"></i>
          {showSettings ? 'הסתר' : 'הוסף'} הגדרות נוספות
        </button>
      </div>

      {/* מייל תודה */}
      {/* {showEmail && (
        <div className={styles.optionalSection}>
          <h5><i className="fa fa-envelope"></i> תבנית מייל תודה</h5>
          <div className={styles.formGroup}>
            <label>נושא המייל:</label>
            <input
              type="text"
              placeholder="תודה על תרומתך!"
              value={formData.emailSubject || ''}
              onChange={(e) => onChange('emailSubject', e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>תוכן המייל:</label>
            <textarea
              rows="6"
              placeholder="שלום {שם_לקוח},&#10;&#10;תודה רבה על תרומתך בסך {סכום}..."
              value={formData.thankYouEmail || ''}
              onChange={(e) => onChange('thankYouEmail', e.target.value)}
            />
            <span className={styles.hint}>
              <i className="fa fa-lightbulb-o"></i>
              משתנים זמינים: {'{שם_לקוח}'}, {'{סכום}'}, {'{תאריך}'}
            </span>
          </div>
        </div>
      )} */}
{showEmail && (
  <div className={styles.optionalSection}>
    <h5><i className="fa fa-envelope"></i> תבנית מייל תודה</h5>
    
    {/* 🆕 1️⃣ מייל לעדכון */}
    <div className={styles.formGroup}>
      <label>כתובת מייל לקבלת עדכונים:</label>
      <input
        type="email"
        placeholder="example@company.com"
        value={formData.email || ''}
        onChange={(e) => onChange('email', e.target.value)}
      />
      <span className={styles.hint}>
        <i className="fa fa-info-circle"></i>
        כתובת המייל שתקבל התראות על תשלומים
      </span>
    </div>

    {/* 🆕 2️⃣ שם המייל לעדכון */}
    <div className={styles.formGroup}>
      <label>שם השולח במייל עדכונים:</label>
      <input
        type="text"
        placeholder="שם החברה"
        value={formData.emailName || ''}
        onChange={(e) => onChange('emailName', e.target.value)}
      />
    </div>

    {/* ✅ 3️⃣ נושא המייל לקונה (כבר קיים) */}
    <div className={styles.formGroup}>
      <label>נושא המייל לקונה:</label>
      <input
        type="text"
        placeholder="תודה על תרומתך!"
        value={formData.emailSubject || ''}
        onChange={(e) => onChange('emailSubject', e.target.value)}
      />
    </div>

    {/* ✅ 4️⃣ תוכן המייל לקונה (כבר קיים) */}
    <div className={styles.formGroup}>
      <label>תוכן המייל לקונה:</label>
      <textarea
        rows="6"
        placeholder="שלום ,&#10;&#10;תודה רבה על תרומתך בסך ..."
        value={formData.thankYouEmail || ''}
        onChange={(e) => onChange('thankYouEmail', e.target.value)}
      />
      {/* <span className={styles.hint}>
        <i className="fa fa-lightbulb-o"></i>
        משתנים זמינים: {'{שם_לקוח}'}, {'{סכום}'}, {'{תאריך}'}
      </span> */}
    </div>
  </div>
)}
      {/* פריטים */}
      {showItems && (
        <div className={styles.optionalSection}>
          <h5><i className="fa fa-list"></i> ניהול פריטים ({formData.items?.length || 0})</h5>
          <ItemsManager
            items={formData.items || []}
            onChange={(items) => onChange('items', items)}
          />
        </div>
      )}

      {/* הגדרות נוספות */}
      {showSettings && (
        <div className={styles.optionalSection}>
          <h5><i className="fa fa-sliders"></i> הגדרות נוספות</h5>
          
          {/* Webhook */}
          <div className={styles.formGroup}>
            <label>Webhook URL:</label>
            <input
              type="url"
              placeholder="https://example.com/webhook"
              value={formData.webhook || ''}
              onChange={(e) => onChange('webhook', e.target.value)}
            />
          </div>

          {/* Max Payments */}
          <div className={styles.formGroup}>
            <label>מספר תשלומים מקסימלי:</label>
            <input
              type="number"
              min="1"
              value={formData.maxNumPay || 1}
              onChange={(e) => onChange('maxNumPay', parseInt(e.target.value))}
            />
          </div>

          {/* Rules */}
          <div className={styles.formGroup}>
            <label>תנאי שימוש:</label>
            <textarea
              rows="3"
              placeholder="הוסף תנאים..."
              value={formData.rules || ''}
              onChange={(e) => onChange('rules', e.target.value)}
            />
          </div>

          {/* Rules Title */}
          <div className={styles.formGroup}>
            <label>כותרת תנאים:</label>
            <input
              type="text"
              placeholder="אני מסכים לתנאים"
              value={formData.rulesTitle || ''}
              onChange={(e) => onChange('rulesTitle', e.target.value)}
            />
          </div>

          {/* Show Rules Checkbox */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.rulesShow || false}
                onChange={(e) => onChange('rulesShow', e.target.checked)}
              />
              הצג תנאים בטופס
            </label>
          </div>

          {/* Discount Settings */}
          {formData.discount && (
            <fieldset className={styles.fieldset}>
              <legend>הנחות</legend>
              <div className={styles.formGroup}>
                <label>מספר קשרים למינימום:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount.minContacts || 0}
                  onChange={(e) => onChange('discount', {
                    ...formData.discount,
                    minContacts: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>סכום הנחה (שקל):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount.valueNis || 0}
                  onChange={(e) => onChange('discount', {
                    ...formData.discount,
                    valueNis: parseFloat(e.target.value)
                  })}
                />
              </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
};
const SummarySection = ({ formData }) => {
  const getPaymentMethodsNames = () => {
    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      return 'לא נבחרו';
    }

    const methodNames = {
      'credit_card': 'כרטיס אשראי',
      'bit': 'ביט',
      'gama_bit': 'גמא ביט',
      'paybox': 'Paybox',
      'open_finance': 'פתיחות פיננסית',
      'recurring_payment': 'הוראת קבע',
      'recurring_payment_immediate': 'הוראת קבע מיידית',
      'recurring_payment_bank': 'הוראת קבע בנקאית',
      'credit_card_touch': 'סליקה ישירה',
      'cash': 'מזומן'
    };

    return formData.paymentMethods
      .map(method => methodNames[method] || method)
      .join(', ');
  };

  return (
    <div className={styles.summaryView}>
      <h4><i className="fa fa-check-square-o"></i> סיכום החיבור</h4>
      
      {/* פרטים כלליים */}
      <div className={styles.summaryCard}>
        <h5><i className="fa fa-info-circle"></i> פרטים כלליים</h5>
        <div className={styles.summaryRow}>
          <strong>סוג חיבור:</strong>
          <span>{formData.connectionTypeDescription || formData.connectionTypeName}</span>
        </div>
        <div className={styles.summaryRow}>
          <strong>שם החיבור:</strong>
          <span>{formData.connectionName}</span>
        </div>
        {formData.connectionDescription && (
          <div className={styles.summaryRow}>
            <strong>תיאור:</strong>
            <span>{formData.connectionDescription}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <strong>סטטוס:</strong>
          <span className={formData.connectionStatus === 'active' ? styles.statusActive : styles.statusInactive}>
            {formData.connectionStatus === 'active' ? 'פעיל' : 'מושבת'}
          </span>
        </div>
      </div>

      {/* אמצעי תשלום */}
      <div className={styles.summaryCard}>
        <h5><i className="fa fa-credit-card"></i> אמצעי תשלום</h5>
        <div className={styles.summaryRow}>
          <strong>אמצעי תשלום נבחרו:</strong>
          <span>{getPaymentMethodsNames()}</span>
        </div>
        <div className={styles.summaryRow}>
          <strong>מטרת המסמך:</strong>
          <span>
            {formData.campaignType === 'regular' && 'רגיל (מכירות, רישום, תשלומים)'}
            {formData.campaignType === 'donations' && 'תרומות'}
            {formData.campaignType === 'registration' && 'רישום בלבד'}
          </span>
        </div>
        
        {/* כפתורי תשלום מותאמים אישית */}
        {formData.paymentButtonTexts && Object.keys(formData.paymentButtonTexts).length > 0 && (
          <div className={styles.customButtonsPreview}>
            <strong>התאמות אישיות לכפתורים:</strong>
            {Object.entries(formData.paymentButtonTexts).map(([method, texts]) => (
              texts.title || texts.description ? (
                <div key={method} className={styles.buttonPreview}>
                  <span className={styles.methodName}>
                    {getPaymentMethodsNames().split(', ').find(m => 
                      m.includes(method.replace('_', ' '))
                    ) || method}:
                  </span>
                  {texts.title && <div><strong>כיתוב:</strong> {texts.title}</div>}
                  {texts.description && <div><strong>תיאור:</strong> {texts.description}</div>}
                </div>
              ) : null
            ))}
          </div>
        )}
      </div>

      {/* מייל תודה - עדכון ל-4 שדות */}
{(formData.email || formData.emailName || formData.emailSubject || formData.thankYouEmail) && (
  <div className={styles.summaryCard}>
    <h5><i className="fa fa-envelope"></i> הגדרות מייל</h5>
    
    {/* 1️⃣ מייל לעדכון */}
    {formData.email && (
      <div className={styles.summaryRow}>
        <strong>כתובת מייל לעדכונים:</strong>
        <span>{formData.email}</span>
      </div>
    )}
    
    {/* 2️⃣ שם המייל לעדכון */}
    {formData.emailName && (
      <div className={styles.summaryRow}>
        <strong>שם השולח:</strong>
        <span>{formData.emailName}</span>
      </div>
    )}
    
    {/* קו מפריד אם יש שדות עדכונים */}
    {(formData.email || formData.emailName) && (formData.emailSubject || formData.thankYouEmail) && (
      <hr className={styles.divider} />
    )}
    
    {/* 3️⃣ נושא המייל לקונה */}
    {formData.emailSubject && (
      <div className={styles.summaryRow}>
        <strong>נושא המייל ללקוח:</strong>
        <span>{formData.emailSubject}</span>
      </div>
    )}
    
    {/* 4️⃣ תוכן המייל לקונה */}
    {formData.thankYouEmail && (
      <div className={styles.emailPreviewBox}>
        <strong>תוכן המייל ללקוח:</strong>
        <div className={styles.emailContent}>
          {formData.thankYouEmail}
        </div>
      </div>
    )}
  </div>
)}

      {/* פריטים */}
      {formData.items && formData.items.length > 0 && (
        <div className={styles.summaryCard}>
          <h5><i className="fa fa-list"></i> פריטים ({formData.items.length})</h5>
          <div className={styles.itemsPreview}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>שם פריט</th>
                  <th>מק״ט</th>
                  <th>מחיר</th>
                  <th>כמות</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td><code>{item.sku || '-'}</code></td>
                    <td className={styles.priceCell}>
                      {item.price ? `₪${parseFloat(item.price).toFixed(2)}` : '-'}
                    </td>
                    <td>{item.quantity || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* הגדרות מתקדמות */}
      {formData.settings && Object.keys(formData.settings).length > 0 && (
        <div className={styles.summaryCard}>
          <h5><i className="fa fa-cog"></i> הגדרות נוספות</h5>
          {Object.entries(formData.settings).map(([key, value]) => 
            value && (
              <div key={key} className={styles.summaryRow}>
                <strong>{key}:</strong>
                <span>{value}</span>
              </div>
            )
          )}
        </div>
      )}

      {/* אזהרה */}
      <div className={styles.summaryWarning}>
        <i className="fa fa-exclamation-triangle"></i>
        <div>
          <strong>לפני השמירה:</strong>
          <ul>
            <li>ודא שכל הפרטים נכונים</li>
            <li>Tokens ייווצרו אוטומטית ויוצגו בסיום</li>
            <li>ניתן לערוך את החיבור בכל עת</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default ConnectionFormModal;