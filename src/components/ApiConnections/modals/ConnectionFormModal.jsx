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
        recurringContractId: null, // ✅ ID של החוזה להוראת קבע רגילה/מיידית
        recurringBankContractId: null, // ✅ ID של החוזה להוראת קבע בנקאית
        campaignType: 'regular',
        settings: {}
    });

    const [loading, setLoading] = useState(false);
    const [currentSection, setCurrentSection] = useState('basic'); // basic, payment, advanced
    const [showSummary, setShowSummary] = useState(false);
    const isEditMode = !!connection;

    useEffect(() => {
        if (connection) {
            // ✅ טעון את הנתונים הקיימים
            let paymentMethods = connection.paymentMethods || [];

            // ✅ נקה כפילויות של הוראת קבע - רק אחד יכול להיות!
            const hasImmediate = paymentMethods.includes('recurring_payment_immediate');
            const hasRegular = paymentMethods.includes('recurring_payment');

            // אם יש שני סוגים, תן עדיפות למיידית (או בחר לפי לוגיקה אחרת)
            if (hasImmediate && hasRegular) {
                console.warn('⚠️ Found both recurring types! Removing regular, keeping immediate.');
                paymentMethods = paymentMethods.filter(m => m !== 'recurring_payment');
            }

            // ✅ בדוק אם יש הוראות קבע
            const hasRecurring = paymentMethods.some(m =>
                m === 'recurring_payment' || m === 'recurring_payment_immediate'
            );

            const hasRecurringBank = paymentMethods.includes('recurring_payment_bank');

            // ✅ קבע את סוג הוראת הקבע
            let recurringType = null;
            if (paymentMethods.includes('recurring_payment')) {
                recurringType = 'regular';
            } else if (paymentMethods.includes('recurring_payment_immediate')) {
                recurringType = 'immediate';
            }

            // ✅ חלץ contractId מתוך paymentMethodsDetails
            const paymentMethodsDetails = connection.paymentMethodsDetails || [];
            let extractedRecurringContractId = connection.recurringContractId || null;
            let extractedBankContractId = connection.recurringBankContractId || null;

            // אם אין ערכים ישירים, נסה לחלץ מ-paymentMethodsDetails
            if (!extractedRecurringContractId || !extractedBankContractId) {
                paymentMethodsDetails.forEach(detail => {
                    // הוראת קבע רגילה (paymentOption: 5)
                    if (detail.paymentOption === 5 && detail.contractId && !extractedRecurringContractId) {
                        extractedRecurringContractId = detail.contractId;
                    }
                    // הוראת קבע מיידית (paymentOption: 8)
                    if (detail.paymentOption === 8 && detail.contractId && !extractedRecurringContractId) {
                        extractedRecurringContractId = detail.contractId;
                    }
                    // הוראת קבע בנקאית (paymentOption: 16)
                    if (detail.paymentOption === 16 && detail.contractId && !extractedBankContractId) {
                        extractedBankContractId = detail.contractId;
                    }
                });
            }

            console.log('🔍 Detected recurring settings:', {
                hasRecurring,
                recurringType,
                hasRecurringBank,
                cleanedPaymentMethods: paymentMethods,
                extractedRecurringContractId,
                extractedBankContractId
            });

            // ✅ טעון את כל הנתונים עם הוראות הקבע
            setFormData({
                connectionType: connection.connectionType || connection.IdConnectType || '',
                connectionTypeName: connection.connectionTypeName || connection.Name || '',
                connectionName: connection.name || connection.connectionName || connection.Name || '',
                connectionDescription: connection.description || connection.connectionDescription || connection.Description || '',
                connectionStatus: connection.status === 'active' ? 'active' : (connection.connectionStatus || 'active'),
                paymentMethods: paymentMethods,
                paymentButtonTexts: connection.paymentButtonTexts || {},
                campaignType: connection.campaignType || 'regular',
                settings: connection.settings || {},
                emailSubject: connection.emailSubject || '',
                thankYouEmail: connection.thankYouEmail || '',
                items: connection.items || [],
                email: connection.email || connection.Email || '',
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
                paymentMethodsDetails: paymentMethodsDetails,

                // ✅ הוסף את זה!
                enableRecurring: hasRecurring,              // סומן "אפשר הוראת קבע"?
                recurringType: recurringType,               // אילו סוג (regular/immediate)?
                enableBankRecurring: hasRecurringBank,      // סומן "אפשר הוראת קבע בנקאית"?
                recurringContractId: extractedRecurringContractId,  // ID של החוזה רגיל/מיידי
                recurringBankContractId: extractedBankContractId  // ID של החוזה בנקאי
            });

            setCurrentSection('basic');
            setShowSummary(false);
        } else {
            // ✅ מצב חדש - איפוס מלא של כל השדות
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
                maxNumPay: 1,
                specialOptions: [],
                rules: '',
                rulesTitle: '',
                rulesShow: false,
                discount: {},
                webhook: '',
                paymentMethodsDetails: [],
                enableRecurring: false,
                recurringType: null,
                enableBankRecurring: false,
                recurringContractId: null,
                recurringBankContractId: null
            });
        }
    }, [connection, isOpen]);
    // useEffect(() => {
    //     if (connection) {

    //         // ✅ מצב עריכה — טוען את כל הנתונים מהחיבור הקיים
    //         setFormData({
    //             connectionType: connection.connectionType || connection.IdConnectType || '',
    //             connectionTypeName: connection.connectionTypeName || connection.Name || '',
    //             connectionName: connection.name || connection.connectionName || connection.Name || '',
    //             connectionDescription: connection.description || connection.connectionDescription || connection.Description || '',
    //             connectionStatus: connection.status === 'active' ? 'active' : (connection.connectionStatus || 'active'),
    //             paymentMethods: connection.paymentMethods || [],
    //             paymentButtonTexts: connection.paymentButtonTexts || {},
    //             campaignType: connection.campaignType || 'regular',
    //             settings: connection.settings || {},
    //             emailSubject: connection.emailSubject || '',
    //             thankYouEmail: connection.thankYouEmail || '',
    //             items: connection.items || [],

    //             // ✅ הוסף שדות נוספים שחוזרים מהשרת

    //             // ✅ 4 שדות מייל
    //             email: connection.email || connection.Email || '',  // ⬅️ הוסף גם Email עם E גדולה
    //             emailName: connection.emailName || connection.EmailName || '',
    //             emailSubject: connection.emailSubject || connection.paySuccessMailTitle || '',
    //             thankYouEmail: connection.thankYouEmail || connection.emailNote || connection.EmailNote || '',
    //             maxNumPay: connection.maxNumPay || 1,
    //             specialOptions: connection.specialOptions || [],
    //             rules: connection.rules || '',
    //             rulesTitle: connection.rulesTitle || '',
    //             rulesShow: connection.rulesShow || false,
    //             discount: connection.discount || {},
    //             webhook: connection.webhook || '',
    //             paymentMethodsDetails: connection.paymentMethodsDetails || []
    //         });

    //         setCurrentSection('basic'); // ✅ התחל מהטב הראשון
    //         setShowSummary(false); // ✅ אל תהיה בסיכום
    //     } else {
    //         // ✅ מצב חדש - איפוס
    //         setFormData({
    //             connectionType: '',
    //             connectionTypeName: '',
    //             connectionName: '',
    //             connectionDescription: '',
    //             connectionStatus: 'active',
    //             paymentMethods: [],
    //             paymentButtonTexts: {},
    //             campaignType: 'regular',
    //             settings: {},
    //             emailSubject: '',
    //             thankYouEmail: '',
    //             items: [],
    //             email: '',
    //             emailName: '',
    //             sendEmail: false,
    //             maxNumPay: 1,
    //             specialOptions: [],
    //             rules: '',
    //             rulesTitle: '',
    //             rulesShow: false,
    //             discount: {},
    //             webhook: '',
    //             paymentMethodsDetails: []
    //         });
    //     }
    // }, [connection, isOpen]); // ✅ תלויות חשובות!

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
        // ✅ אם משנים את paymentMethods, נקה כפילויות
        if (field === 'paymentMethods' && Array.isArray(value)) {
            // הסר כפילויות כלליות
            value = [...new Set(value)];

            // ✅ ודא שיש רק סוג אחד של הוראת קבע (לא בנקאית)
            const hasImmediate = value.includes('recurring_payment_immediate');
            const hasRegular = value.includes('recurring_payment');

            if (hasImmediate && hasRegular) {
                // תן עדיפות למיידית
                value = value.filter(m => m !== 'recurring_payment');
                console.warn('⚠️ Removed duplicate recurring type, keeping immediate');
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        // מעבר לשלב הבא
        if (currentSection === 'basic') {
            setCurrentSection('payment');
        } else if (currentSection === 'payment') {
            setCurrentSection('advanced');
        } else if (currentSection === 'advanced') {
            setShowSummary(true);
        }
    };

    const handleSave = async () => {
        // ✅ ניקוי אחרון לפני שליחה - הסר כפילויות
        let cleanedPaymentMethods = [...new Set(formData.paymentMethods || [])];

        // ✅ ודא שיש רק סוג אחד של הוראת קבע
        const hasImmediate = cleanedPaymentMethods.includes('recurring_payment_immediate');
        const hasRegular = cleanedPaymentMethods.includes('recurring_payment');

        if (hasImmediate && hasRegular) {
            console.warn('⚠️ Final cleanup: removing duplicate recurring type');
            cleanedPaymentMethods = cleanedPaymentMethods.filter(m => m !== 'recurring_payment');
        }

        // 🔍 DEBUG: בדיקה לפני שליחה
        console.log('📤 formData before save:', {
            paymentMethods: cleanedPaymentMethods,
            email: formData.email,
            emailName: formData.emailName,
            emailSubject: formData.emailSubject,
            thankYouEmail: formData.thankYouEmail
        });

        // ✅ עדכן את formData עם המערך המנוקה
        const cleanedFormData = {
            ...formData,
            paymentMethods: cleanedPaymentMethods
        };

        // ✅ אחרי אישור - שמור
        setLoading(true);
        try {
            const result = await onSave(cleanedFormData);

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
                        className={`${styles.tab} ${currentSection === 'basic' && !showSummary ? styles.active : ''}`}
                        onClick={() => {
                            setCurrentSection('basic');
                            setShowSummary(false);
                        }}
                    >
                        <i className="fa fa-info-circle"></i>
                        פרטים בסיסיים
                    </button>
                    <button
                        className={`${styles.tab} ${currentSection === 'payment' && !showSummary ? styles.active : ''}`}
                        onClick={() => {
                            setCurrentSection('payment');
                            setShowSummary(false);
                        }}
                    >
                        <i className="fa fa-credit-card"></i>
                        תשלומים
                    </button>
                    <button
                        className={`${styles.tab} ${currentSection === 'advanced' && !showSummary ? styles.active : ''}`}
                        onClick={() => {
                            setCurrentSection('advanced');
                            setShowSummary(false);
                        }}
                    >
                        <i className="fa fa-cog"></i>
                        מתקדם
                    </button>
                    <button
                        className={`${styles.tab} ${showSummary ? styles.active : ''}`}
                        onClick={() => setShowSummary(true)}
                    >
                        <i className="fa fa-check-square-o"></i>
                        סיכום
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
                        <SummarySection formData={formData} key={JSON.stringify(formData)} /> // ✅ סיכום
                    )}
                </div>
                {/* Footer */}
                <div className={styles.modalFooter}>
                    {showSummary ? (
                        <>
                            <button className={styles.btnCancel} onClick={() => {
                                setShowSummary(false);
                                setCurrentSection('advanced');
                            }}>
                                <i className="fa fa-arrow-right"></i>
                                חזור
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
                                        אשר ושלח
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
                                onClick={handleNext}
                                disabled={!formData.connectionName}
                            >
                                <i className="fa fa-arrow-left"></i>
                                {currentSection === 'advanced' ? 'המשך לסיכום' : 'לשלב הבא'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

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
    const [contracts, setContracts] = useState([]);
    const [loadingContracts, setLoadingContracts] = useState(false);

    // ✅ טעינת חוזים
    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setLoadingContracts(true);
            const { apiConnectionsService } = await import('../../../services/apiConnectionsService');
            const result = await apiConnectionsService.getAllContracts();
            if (result.success) {
                setContracts(result.contracts || []);
            }
        } catch (error) {
            console.error('Error loading contracts:', error);
        } finally {
            setLoadingContracts(false);
        }
    };

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
            {/* מטרת המסמך */}
            <div className={styles.campaignTypeSection}>
                <h5><i className="fa fa-bullseye"></i> מטרת המסמך:</h5>
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
                            onChange={(e) => {
                                onChange('campaignType', e.target.value);
                                // איפוס אמצעי תשלום במצב רישום
                                onChange('paymentMethods', []);
                                onChange('maxNumPay', 1);
                            }}
                        />
                        רישום בלבד
                    </label>
                </div>
            </div>

            {/* אמצעי תשלום - רק אם לא רישום בלבד */}
            {formData.campaignType !== 'registration' && (
                <>
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

                                    {/* ✅ מספר תשלומים לכרטיס אשראי */}
                                    {isSelected && method.value === 'credit_card' && (
                                        <div className={styles.paymentOptionsConfig}>
                                            <label>
                                                <i className="fa fa-calculator"></i>
                                                מספר תשלומים מקסימלי:
                                            </label>
                                            <div className={styles.inputWithHint}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="36"
                                                    value={formData.maxNumPay || 1}
                                                    onChange={(e) => onChange('maxNumPay', parseInt(e.target.value) || 1)}
                                                />
                                                <span className={styles.hint}>
                                                    <i className="fa fa-info-circle"></i>
                                                    בין 1 ל-36 תשלומים
                                                </span>
                                            </div>
                                        </div>
                                    )}

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
                                    onChange={(e) => {
                                        onChange('enableRecurring', e.target.checked);
                                        // ✅ אם מכבים, הסר את כל סוגי הוראת הקבע (לא בנקאית)
                                        if (!e.target.checked) {
                                            const currentMethods = formData.paymentMethods || [];
                                            const filteredMethods = currentMethods.filter(m =>
                                                m !== 'recurring_payment' && m !== 'recurring_payment_immediate'
                                            );
                                            onChange('paymentMethods', filteredMethods);
                                            onChange('recurringType', null);
                                            onChange('recurringContractId', null);
                                        }
                                    }}
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
                                                value="regular"
                                                checked={formData.recurringType === 'regular'}
                                                onChange={(e) => {
                                                    // ✅ הסר את כל סוגי הוראת הקבע הקיימים והוסף רק את הרגילה
                                                    const currentMethods = formData.paymentMethods || [];
                                                    const filteredMethods = currentMethods.filter(m =>
                                                        m !== 'recurring_payment' && m !== 'recurring_payment_immediate'
                                                    );
                                                    onChange('paymentMethods', [...filteredMethods, 'recurring_payment']);
                                                    onChange('recurringType', e.target.value);
                                                }}
                                            />
                                            רישום להוראת קבע בלבד
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="recurringType"
                                                value="immediate"
                                                checked={formData.recurringType === 'immediate'}
                                                onChange={(e) => {
                                                    // ✅ הסר את כל סוגי הוראת הקבע הקיימים והוסף רק את המיידית
                                                    const currentMethods = formData.paymentMethods || [];
                                                    const filteredMethods = currentMethods.filter(m =>
                                                        m !== 'recurring_payment' && m !== 'recurring_payment_immediate'
                                                    );
                                                    onChange('paymentMethods', [...filteredMethods, 'recurring_payment_immediate']);
                                                    onChange('recurringType', e.target.value);
                                                }}
                                            />
                                            רישום להוראת קבע פלוס חיוב מידי

                                        </label>
                                    </div>

                                    {/* ✅ בחירת חוזה להוראת קבע */}
                                    {formData.recurringType && (
                                        <div className={styles.contractSelection}>
                                            <label>
                                                <i className="fa fa-file-text-o"></i>
                                                בחר חוזה להוראת קבע: <span className={styles.required}>*</span>
                                            </label>
                                            <div className={styles.inputWithHint}>
                                                {loadingContracts ? (
                                                    <p>טוען חוזים...</p>
                                                ) : (
                                                    <select
                                                        value={formData.recurringContractId || ''}
                                                        onChange={(e) => onChange('recurringContractId', e.target.value ? parseInt(e.target.value) : null)}
                                                    >
                                                        <option value="">-- בחר חוזה --</option>
                                                        {contracts.map(contract => (
                                                            <option key={contract.id} value={contract.id}>
                                                                {contract.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <span className={styles.hint}>
                                                    <i className="fa fa-info-circle"></i>
                                                    החוזה שישויך להוראת הקבע
                                                </span>
                                            </div>
                                        </div>
                                    )}

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
                                            onChange={(e) => {
                                                onChange('enableBankRecurring', e.target.checked);
                                                // ✅ הוסף/הסר מהסיכום!
                                                const currentMethods = formData.paymentMethods || [];
                                                if (e.target.checked) {
                                                    if (!currentMethods.includes('recurring_payment_bank')) {
                                                        onChange('paymentMethods', [...currentMethods, 'recurring_payment_bank']);
                                                    }
                                                } else {
                                                    onChange('paymentMethods',
                                                        currentMethods.filter(m => m !== 'recurring_payment_bank')
                                                    );
                                                    onChange('recurringBankContractId', null); // ✅ איפוס החוזה
                                                }
                                            }}
                                        />
                                        <i className="fa fa-bank"></i>
                                        <span>אפשר הוראת קבע בנקאית</span>
                                    </label>

                                    {/* ✅ בחירת חוזה להוראת קבע בנקאית */}
                                    {formData.enableBankRecurring && (
                                        <div className={styles.contractSelection}>
                                            <label>
                                                <i className="fa fa-file-text-o"></i>
                                                בחר חוזה להוראת קבע בנקאית: <span className={styles.required}>*</span>
                                            </label>
                                            <div className={styles.inputWithHint}>
                                                {loadingContracts ? (
                                                    <p>טוען חוזים...</p>
                                                ) : (
                                                    <select
                                                        value={formData.recurringBankContractId || ''}
                                                        onChange={(e) => onChange('recurringBankContractId', e.target.value ? parseInt(e.target.value) : null)}
                                                    >
                                                        <option value="">-- בחר חוזה --</option>
                                                        {contracts.map(contract => (
                                                            <option key={contract.id} value={contract.id}>
                                                                {contract.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <span className={styles.hint}>
                                                    <i className="fa fa-info-circle"></i>
                                                    החוזה שישויך להוראת הקבע הבנקאית
                                                </span>
                                            </div>
                                        </div>
                                    )}

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
                </>
            )}
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
                    <i className="fa fa-link"></i>
                    {showSettings ? 'הסתר' : 'הוסף'} Webhook
                    {formData.webhook && <span className={styles.badge}>✅</span>}
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

            {/* Webhook */}
            {showSettings && (
                <div className={styles.optionalSection}>
                    <h5><i className="fa fa-link"></i> Webhook</h5>

                    <div className={styles.formGroup}>
                        <label>Webhook URL:</label>
                        <input
                            type="url"
                            placeholder="https://example.com/webhook"
                            value={formData.webhook || ''}
                            onChange={(e) => onChange('webhook', e.target.value)}
                        />
                        <span className={styles.hint}>
                            <i className="fa fa-info-circle"></i>
                            כתובת URL שתקבל התראות על אירועים במערכת
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
const SummarySection = ({ formData }) => {
    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        const loadContracts = async () => {
            try {
                const { apiConnectionsService } = await import('../../../services/apiConnectionsService');
                const result = await apiConnectionsService.getAllContracts();
                if (result.success) {
                    setContracts(result.contracts || []);
                }
            } catch (error) {
                console.error('Error loading contracts:', error);
            }
        };
        loadContracts();
    }, []);

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

    const getContractName = (contractId) => {
        const contract = contracts.find(c => c.id === contractId);
        return contract ? contract.name : `חוזה #${contractId}`;
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

                {/* חוזה להוראת קבע רגילה/מיידית */}
                {formData.recurringContractId && (
                    <div className={styles.summaryRow}>
                        <strong>חוזה להוראת קבע {formData.recurringType === 'immediate' ? 'מיידית' : 'רגילה'}:</strong>
                        <span>{getContractName(formData.recurringContractId)}</span>
                    </div>
                )}

                {/* חוזה להוראת קבע בנקאית */}
                {formData.recurringBankContractId && (
                    <div className={styles.summaryRow}>
                        <strong>חוזה להוראת קבע בנקאית:</strong>
                        <span>{getContractName(formData.recurringBankContractId)}</span>
                    </div>
                )}

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

            {/* הגדרות נוספות */}
            {(formData.webhook || formData.maxNumPay > 1 || formData.rules || formData.rulesTitle || formData.discount?.minContacts > 0) && (
                <div className={styles.summaryCard}>
                    <h5><i className="fa fa-cog"></i> הגדרות נוספות</h5>

                    {formData.webhook && (
                        <div className={styles.summaryRow}>
                            <strong>Webhook:</strong>
                            <span>{formData.webhook}</span>
                        </div>
                    )}

                    {formData.maxNumPay > 1 && (
                        <div className={styles.summaryRow}>
                            <strong>מספר תשלומים מקסימלי:</strong>
                            <span>{formData.maxNumPay}</span>
                        </div>
                    )}

                    {formData.rulesTitle && (
                        <div className={styles.summaryRow}>
                            <strong>כותרת תנאים:</strong>
                            <span>{formData.rulesTitle}</span>
                        </div>
                    )}

                    {formData.rules && (
                        <div className={styles.summaryRow}>
                            <strong>תנאי שימוש:</strong>
                            <span>{formData.rules}</span>
                        </div>
                    )}

                    {formData.discount?.minContacts > 0 && (
                        <div className={styles.summaryRow}>
                            <strong>הנחות:</strong>
                            <span>מינימום {formData.discount.minContacts} קשרים, הנחה ₪{formData.discount.valueNis || 0}</span>
                        </div>
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