import React, { useEffect, useState } from 'react';
import styles from './ConnectionWizard.module.css';
import Step1ConnectionType from './steps/Step1ConnectionType';
import Step2ConnectionDetails from './steps/Step2ConnectionDetails';
import Step3Settings from './steps/Step3Settings';
import Step4PaymentMethods from './steps/Step4PaymentMethods';
import Step5EmailAndItems from './steps/Step5EmailAndItems';
// import Step6TokenAndQA from './steps/Step6TokenAndQA';
import Step7Summary from './steps/Step7Summary';
import useWizardState from '../../../hooks/useWizardState';
import { apiConnectionsService } from '../../../services/apiConnectionsService';
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingSpinner from '../../shared/LoadingSpinner';

const ConnectionWizard = ({ onClose, onSuccess }) => {
  const {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    validateStep,
    submitConnection
  } = useWizardState();

  const { addNotification } = useNotification();
  
  // ✅ הוסף state לconnectionTypes
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // ✅ טען connectionTypes פעם אחת בלבד
  useEffect(() => {
    let isMounted = true;
    
    const loadConnectionTypes = async () => {
      try {
        setLoadingTypes(true);
        const result = await apiConnectionsService.getConnectionTypes();
        
        if (result.success && Array.isArray(result.data) && isMounted) {
          setConnectionTypes(result.data);
        } else if (isMounted) {
          addNotification('לא הצלחנו לטעון את סוגי החיבורים', 'error');
        }
      } catch (error) {
        console.error('Error loading connection types:', error);
        if (isMounted) {
          addNotification('שגיאה בטעינת סוגי חיבורים', 'error');
        }
      } finally {
        if (isMounted) {
          setLoadingTypes(false);
        }
      }
    };

    loadConnectionTypes();
    
    return () => {
      isMounted = false;
    };
  }, []); // ✅ ריק - ירוץ פעם אחת!

  const steps = [
    { component: Step1ConnectionType, title: 'סוג החיבור' },
    { component: Step2ConnectionDetails, title: 'פרטי חיבור' },
    { component: Step3Settings, title: 'הגדרות החיבור' },
    { component: Step4PaymentMethods, title: 'אמצעי תשלום' },
    { component: Step5EmailAndItems, title: 'מלל למייל ופריטים' },
    // { component: Step6TokenAndQA, title: 'Token ו-QA ID' },
    { component: Step7Summary, title: 'בדיקה וסיכום' }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async () => {
    if (await validateStep(currentStep)) {
      if (currentStep === steps.length - 1) {
        const result = await submitConnection();
        if (result.success) {
          onSuccess(result.data);
          onClose();
        } else {
          addNotification(result.message || 'שגיאה ביצירת החיבור', 'error');
        }
      } else {
        nextStep();
      }
    } else {
      addNotification('אנא מלא את כל השדות הנדרשים', 'warning');
    }
  };

  // ✅ הצג טעינה בזמן שטוען connectionTypes
  if (loadingTypes) {
    return (
      <div className={styles.wizard}>
        <div className={styles.wizardBody}>
          <LoadingSpinner message="טוען את אשף החיבור..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.wizardHeader}>
        <h3>אשף הוספת חיבור חדש</h3>
        <div className={styles.stepIndicator}>
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`${styles.step} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.wizardBody}>
        <CurrentStepComponent 
          data={formData}
          updateData={updateFormData}
          connectionTypes={connectionTypes} // ✅ העבר connectionTypes
          loadingTypes={loadingTypes} // ✅ העבר loadingTypes
        />
      </div>

      <div className={styles.wizardFooter}>
        {currentStep > 0 && (
          <button onClick={prevStep} className={styles.btnPrev}>
            <i className="fa fa-arrow-right"></i> חזרה
          </button>
        )}
        <button onClick={onClose} className={styles.btnCancel}>
          ביטול
        </button>
        <button onClick={handleNext} className={styles.btnNext}>
          {currentStep === steps.length - 1 ? 'שמור חיבור' : 'המשך'} 
          {currentStep < steps.length - 1 && <i className="fa fa-arrow-left"></i>}
        </button>
      </div>
    </div>
  );
};

export default ConnectionWizard;

