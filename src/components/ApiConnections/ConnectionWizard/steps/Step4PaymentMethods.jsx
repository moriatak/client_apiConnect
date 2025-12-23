// import React from 'react';
// import styles from './Steps.module.css';
// import Checkbox from '../../../shared/Checkbox';
// import Radio from '../../../shared/Radio';
// import StandingOrderSettings from '../../../shared/StandingOrderSettings';
// import { usePaymentMethods } from '../../../../contexts/PaymentMethodsContext';
// import LoadingSpinner from '../../../shared/LoadingSpinner';

// const Step4PaymentMethods = ({ data, updateData }) => {
//   const { availableMethods, loading } = usePaymentMethods();

//   const handlePaymentMethodChange = (method, checked) => {
//     const currentMethods = data.paymentMethods || [];
//     const newMethods = checked
//       ? [...currentMethods, method]
//       : currentMethods.filter(m => m !== method);

//     updateData({ paymentMethods: newMethods });
//   };

//   const handleCampaignTypeChange = (type) => {
//     updateData({ campaignType: type });
//   };

//   const handleSpecialOptionChange = (option, checked) => {
//     const currentOptions = data.specialOptions || [];
//     const newOptions = checked
//       ? [...currentOptions, option]
//       : currentOptions.filter(o => o !== option);

//     updateData({ specialOptions: newOptions });
//   };

//   if (loading) {
//     return <LoadingSpinner message="טוען אמצעי תשלום..." />;
//   }
//   // ✅ עדכון המיפוי לפי השרת החדש
//   const paymentMethodsConfig = [
//     { value: 'credit_card', label: 'כרטיס אשראי', icon: 'fa-credit-card' },
//     { value: 'bit', label: 'ביט', icon: 'fa-mobile' },
//     { value: 'gama_bit', label: 'גמא ביט', icon: 'fa-mobile-phone' },
//     { value: 'paybox', label: 'Paybox', icon: 'fa-cube' },
//     { value: 'open_finance', label: 'העברה בנקאית', icon: 'fa-bank' },
//     { value: 'recurring_payment', label: 'הוראת קבע', icon: 'fa-repeat' },
//     { value: 'recurring_payment_immediate', label: 'הוראת קבע + חיוב מידי', icon: 'fa-bolt' },
//     { value: 'recurring_payment_bank', label: 'הוראת קבע בנקאית', icon: 'fa-university' },
//     { value: 'credit_card_touch', label: 'סליקה ישירה (Touch)', icon: 'fa-hand-pointer-o' },
//     { value: 'cash', label: 'מזומן', icon: 'fa-money' }
//   ];

//   return (
//     <div className={styles.stepContainer}>
//       <h4 className={styles.stepTitle}>שלב 4: אמצעי תשלום והגדרות מיוחדות</h4>

//       {/* אמצעי תשלום */}
//       <div className={styles.optionsGroup}>
//         <h5 className={styles.sectionTitle}>
//           <i className="fa fa-credit-card"></i> אמצעי תשלום:
//         </h5>
        
//         {/* ✅ DEBUG - הצג מה השרת החזיר */}
//         {availableMethods.length === 0 && (
//           <div className={styles.infoBox}>
//             <i className="fa fa-info-circle"></i>
//             <div>
//               <strong>לא נמצאו אמצעי תשלום זמינים</strong>
//               <p>אנא בדוק את החיבור לשרת</p>
//             </div>
//           </div>
//         )}
        
//         <div className={styles.paymentMethodsGrid}>
//           {paymentMethodsConfig.map((method) => {
//             // ✅ בדיקה אם השרת החזיר את אמצעי התשלום הזה
//             const isAvailable = availableMethods.includes(method.value);
            
//             return isAvailable ? (
//               <div key={method.value} className={styles.paymentMethodCard}>
//                 <Checkbox
//                   name="paymentMethods[]"
//                   value={method.value}
//                   label={
//                     <span>
//                       <i className={`fa ${method.icon}`}></i> {method.label}
//                     </span>
//                   }
//                   checked={data.paymentMethods?.includes(method.value)}
//                   onChange={(checked) => handlePaymentMethodChange(method.value, checked)}
//                 />
//               </div>
//             ) : null;
//           })}
//         </div>
//       </div>

//       {/* סוג מסמך */}
//       <div className={styles.optionsGroup}>
//         <h5 className={styles.sectionTitle}>
//           <i className="fa fa-file-text-o"></i> מטרה:
//         </h5>
//         <Radio
//           name="campaignType"
//           value="regular"
//           label="רגיל (מכירות, רישום, תשלומים)"
//           checked={data.campaignType === 'regular'}
//           onChange={() => handleCampaignTypeChange('regular')}
//         />
//         <Radio
//           name="campaignType"
//           value="donations"
//           label="תרומות"
//           checked={data.campaignType === 'donations'}
//           onChange={() => handleCampaignTypeChange('donations')}
//         />
//         <Radio
//           name="campaignType"
//           value="registration"
//           label="רישום בלבד"
//           checked={data.campaignType === 'registration'}
//           onChange={() => handleCampaignTypeChange('registration')}
//         />
//       </div>

//       {/* אפשרויות נוספות */}
//       <div className={styles.optionsGroup}>
//         <h5 className={styles.sectionTitle}>
//           <i className="fa fa-cog"></i> אפשרויות נוספות:
//         </h5>
//         <Checkbox
//           name="specialOptions[]"
//           value="registration_only"
//           label="אפשר רישום בלבד"
//           icon={true}
//           checked={data.specialOptions?.includes('registration_only')}
//           onChange={(checked) => handleSpecialOptionChange('registration_only', checked)}
//         />
//         <Checkbox
//           name="specialOptions[]"
//           value="invoice_no_payment"
//           label="אפשר חשבונית ללא סליקה"
//           icon={true}
//           checked={data.specialOptions?.includes('invoice_no_payment')}
//           onChange={(checked) => handleSpecialOptionChange('invoice_no_payment', checked)}
//         />
//       </div>

//       {/* הוראת קבע */}
//       {data.paymentMethods?.some(m => 
//         m === 'recurring_payment' || 
//         m === 'recurring_payment_immediate' || 
//         m === 'recurring_payment_bank'
//       ) && (
//         <StandingOrderSettings
//           data={data}
//           updateData={updateData}
//           onPaymentMethodChange={handlePaymentMethodChange}
//         />
//       )}

//       {/* תצוגה מקדימה */}
//       {data.paymentMethods && data.paymentMethods.length > 0 && (
//         <div className={styles.previewBox}>
//           <h5>סיכום בחירה:</h5>
//           <div className={styles.previewContent}>
//             <div className={styles.previewRow}>
//               <strong>אמצעי תשלום נבחרו:</strong>
//               <div className={styles.selectedMethods}>
//                 {data.paymentMethods.map(method => {
//                   const config = paymentMethodsConfig.find(m => m.value === method);
//                   return config ? (
//                     <span key={method} className={styles.methodBadge}>
//                       <i className={`fa ${config.icon}`}></i> {config.label}
//                     </span>
//                   ) : null;
//                 })}
//               </div>
//             </div>
//             <div className={styles.previewRow}>
//               <strong>סוג מסמך:</strong>
//               {data.campaignType === 'regular' && 'רגיל'}
//               {data.campaignType === 'donations' && 'תרומות'}
//               {data.campaignType === 'registration' && 'רישום בלבד'}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


// export default Step4PaymentMethods;


  import React from 'react';
  import styles from './Steps.module.css';
  import Checkbox from '../../../shared/Checkbox';
  import Radio from '../../../shared/Radio';
  import { usePaymentMethods } from '../../../../contexts/PaymentMethodsContext';
  import LoadingSpinner from '../../../shared/LoadingSpinner';

  const Step4PaymentMethods = ({ data, updateData }) => {
    const { availableMethods, loading } = usePaymentMethods();

    const handlePaymentMethodChange = (method, checked) => {
      const currentMethods = data.paymentMethods || [];
      const newMethods = checked
        ? [...currentMethods, method]
        : currentMethods.filter(m => m !== method);

      updateData({ paymentMethods: newMethods });
    };

    const handleCampaignTypeChange = (type) => {
      updateData({ campaignType: type });
    };

    const handleSpecialOptionChange = (option, checked) => {
      const currentOptions = data.specialOptions || [];
      const newOptions = checked
        ? [...currentOptions, option]
        : currentOptions.filter(o => o !== option);

      updateData({ specialOptions: newOptions });
    };

    const handleStandingOrderChange = (method, checked) => {
      handlePaymentMethodChange(method, checked);
    };

    const handleStandingOrderModeChange = (mode) => {
      updateData({ standingOrderChargeMode: mode });
    };

    const handleBankStandingOrderChange = (checked) => {
      updateData({ allowBankStandingOrder: checked });
    };

    if (loading) {
      return <LoadingSpinner message="טוען אמצעי תשלום..." />;
    }

    // ✅ אמצעי תשלום רגילים (ללא הוראות קבע)
    const regularPaymentMethods = [
      { value: 'credit_card', label: 'כרטיס אשראי', icon: 'fa-credit-card' },
      { value: 'bit', label: 'ביט', icon: 'fa-mobile' },
      { value: 'gama_bit', label: 'גמא ביט', icon: 'fa-mobile-phone' },
      { value: 'paybox', label: 'Paybox', icon: 'fa-cube' },
      { value: 'open_finance', label: 'פתיחות פיננסית', icon: 'fa-bank' },
      { value: 'credit_card_touch', label: 'סליקה ישירה (Touch)', icon: 'fa-hand-pointer-o' },
      { value: 'cash', label: 'מזומן', icon: 'fa-money' }
    ];

    // ✅ הוראות קבע בנפרד
    const recurringPaymentMethods = [
      { value: 'recurring_payment', label: 'הוראת קבע רגילה', icon: 'fa-repeat' },
      { value: 'recurring_payment_immediate', label: 'הוראת קבע + חיוב מידי', icon: 'fa-bolt' },
      { value: 'recurring_payment_bank', label: 'הוראת קבע בנקאית', icon: 'fa-university' }
    ];

    // ✅ בדיקה אם יש הוראת קבע זמינה
    const hasRecurringPayments = recurringPaymentMethods.some(method => 
      availableMethods.includes(method.value)
    );

    // ✅ בדיקה אם נבחרה הוראת קבע
    const hasSelectedRecurring = data.paymentMethods?.some(m => 
      recurringPaymentMethods.some(rp => rp.value === m)
    );

    return (
      <div className={styles.stepContainer}>
        <h4 className={styles.stepTitle}>
          <i className="fa fa-credit-card"></i>
          שלב 4: אמצעי תשלום והגדרות
        </h4>
        <p className={styles.stepDescription}>
          בחר את אמצעי התשלום הזמינים והגדר את סוג המסמך
        </p>

        {/* אמצעי תשלום רגילים */}
        <div className={styles.optionsGroup}>
          <h5 className={styles.sectionTitle}>
            <i className="fa fa-credit-card"></i> אמצעי תשלום:
          </h5>
          
          {availableMethods.length === 0 && (
            <div className={styles.warningBox}>
              <i className="fa fa-exclamation-triangle"></i>
              <div>
                <strong>לא נמצאו אמצעי תשלום זמינים</strong>
                <p>אנא בדוק את החיבור לשרת או פנה למנהל המערכת</p>
              </div>
            </div>
          )}
          
          <div className={styles.paymentMethodsGrid}>
            {regularPaymentMethods.map((method) => {
              const isAvailable = availableMethods.includes(method.value);
              
              return isAvailable ? (
                <div key={method.value} className={styles.paymentMethodCard}>
                  <Checkbox
                    name="paymentMethods[]"
                    value={method.value}
                    label={
                      <span>
                        <i className={`fa ${method.icon}`}></i> {method.label}
                      </span>
                    }
                    checked={data.paymentMethods?.includes(method.value)}
                    onChange={(checked) => handlePaymentMethodChange(method.value, checked)}
                  />
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* הוראות קבע - קטע נפרד */}
        {hasRecurringPayments && (
          <div className={styles.optionsGroup}>
            <h5 className={styles.sectionTitle}>
              <i className="fa fa-repeat"></i> הוראות קבע:
            </h5>
            
            <div className={styles.recurringPaymentsSection}>
              {recurringPaymentMethods.map((method) => {
                const isAvailable = availableMethods.includes(method.value);
                
                return isAvailable ? (
                  <div key={method.value} className={styles.recurringMethodCard}>
                    <Checkbox
                      name="paymentMethods[]"
                      value={method.value}
                      label={
                        <span>
                          <i className={`fa ${method.icon}`}></i> {method.label}
                        </span>
                      }
                      checked={data.paymentMethods?.includes(method.value)}
                      onChange={(checked) => handleStandingOrderChange(method.value, checked)}
                    />
                  </div>
                ) : null;
              })}
            </div>

            {/* הגדרות הוראת קבע */}
            {hasSelectedRecurring && (
              <div className={styles.standingOrderSettings}>
                <h6 className={styles.subSectionTitle}>
                  <i className="fa fa-cog"></i> הגדרות הוראת קבע:
                </h6>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>
                    <i className="fa fa-calendar"></i> מצב חיוב:
                  </label>
                  <div className={styles.radioGroup}>
                    <Radio
                      name="standingOrderChargeMode"
                      value="immediate"
                      label="חיוב מיידי"
                      checked={data.standingOrderChargeMode === 'immediate'}
                      onChange={() => handleStandingOrderModeChange('immediate')}
                    />
                    <Radio
                      name="standingOrderChargeMode"
                      value="store_only"
                      label="שמירה בלבד (ללא חיוב מיידי)"
                      checked={data.standingOrderChargeMode === 'store_only'}
                      onChange={() => handleStandingOrderModeChange('store_only')}
                    />
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <Checkbox
                    name="allowBankStandingOrder"
                    value="allowBankStandingOrder"
                    label="אפשר הוראת קבע בנקאית (ללא חיוב)"
                    checked={data.allowBankStandingOrder || false}
                    onChange={handleBankStandingOrderChange}
                  />
                  <span className={styles.hint}>
                    <i className="fa fa-info-circle"></i>
                    אפשרות זו מאפשרת ללקוחות למלא פרטי הוראת קבע ישירות לבנק
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* סוג מסמך */}
        <div className={styles.optionsGroup}>
          <h5 className={styles.sectionTitle}>
            <i className="fa fa-file-text-o"></i> מטרת המסמך:
          </h5>
          <div className={styles.radioGroup}>
            <Radio
              name="campaignType"
              value="regular"
              label="רגיל (מכירות, רישום, תשלומים)"
              checked={data.campaignType === 'regular'}
              onChange={() => handleCampaignTypeChange('regular')}
            />
            <Radio
              name="campaignType"
              value="donations"
              label="תרומות"
              checked={data.campaignType === 'donations'}
              onChange={() => handleCampaignTypeChange('donations')}
            />
            <Radio
              name="campaignType"
              value="registration"
              label="רישום בלבד"
              checked={data.campaignType === 'registration'}
              onChange={() => handleCampaignTypeChange('registration')}
            />
          </div>
        </div>

        {/* אפשרויות נוספות */}
        <div className={styles.optionsGroup}>
          <h5 className={styles.sectionTitle}>
            <i className="fa fa-cog"></i> אפשרויות מיוחדות:
          </h5>
          <Checkbox
            name="specialOptions[]"
            value="registration_only"
            label="אפשר רישום בלבד (ללא תשלום)"
            icon={true}
            checked={data.specialOptions?.includes('registration_only')}
            onChange={(checked) => handleSpecialOptionChange('registration_only', checked)}
          />
          <Checkbox
            name="specialOptions[]"
            value="invoice_no_payment"
            label="אפשר חשבונית ללא סליקה"
            icon={true}
            checked={data.specialOptions?.includes('invoice_no_payment')}
            onChange={(checked) => handleSpecialOptionChange('invoice_no_payment', checked)}
          />
        </div>

        {/* תצוגה מקדימה */}
        {data.paymentMethods && data.paymentMethods.length > 0 && (
          <div className={styles.previewBox}>
            <h5>
              <i className="fa fa-eye"></i> סיכום בחירה
            </h5>
            <div className={styles.previewContent}>
              <div className={styles.previewRow}>
                <strong>אמצעי תשלום נבחרו:</strong>
                <div className={styles.selectedMethods}>
                  {data.paymentMethods.map(method => {
                    const config = [...regularPaymentMethods, ...recurringPaymentMethods]
                      .find(m => m.value === method);
                    return config ? (
                      <span key={method} className={styles.methodBadge}>
                        <i className={`fa ${config.icon}`}></i> {config.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className={styles.previewRow}>
                <strong>מטרת המסמך:</strong>
                <span>
                  {data.campaignType === 'regular' && 'רגיל (מכירות, רישום, תשלומים)'}
                  {data.campaignType === 'donations' && 'תרומות'}
                  {data.campaignType === 'registration' && 'רישום בלבד'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Step4PaymentMethods;