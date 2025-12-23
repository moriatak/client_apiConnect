import { useState } from 'react';
import { apiConnectionsService } from '../services/apiConnectionsService';
import { generateQaId, generateToken } from '../utils/tokenGenerator';
// import { getConnectionTypeId } from '../constants/connectionTypes';

const useWizardState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    connectionType: '', // זה יהיה IdConnectType (מספר)
    connectionTypeName: '',
    connectionName: '',
    connectionDescription: '',
    connectionStatus: 'active',
    paymentMethods: [],
    campaignType: 'regular',
    specialOptions: [],
    standingOrderChargeMode: 'immediate',
    allowBankStandingOrder: false,
    thankYouEmail: '',
    items: [],
    // qaId: '',
    settings: {}
  });

 const updateFormData = (updates) => {
  setFormData(prev => {
    // ✅ בדיקה אם יש שינוי אמיתי
    const hasChanges = Object.keys(updates).some(key => prev[key] !== updates[key]);
    
    if (!hasChanges) {
      return prev; // ✅ מחזיר את אותו אובייקט - לא גורם לרינדור
    }
    
    return { ...prev, ...updates };
  });
};

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = async (step) => {
    switch(step) {
      case 0: // סוג חיבור
        return !!formData.connectionType;
      case 1: // פרטי חיבור
        return !!formData.connectionName;
      // case 5: // QA ID
      //   if (!formData.qaId) {
      //     const generatedQaId = generateQaId(formData.connectionTypeName || 'API');
      //     updateFormData({ qaId: generatedQaId });
      //   }
      //   return true;
      default:
        return true;
    }
  };

  const submitConnection = async () => {
    try {
      // הכנת הנתונים לשליחה
      const connectionData = {
        connectionType: formData.connectionType, // IdConnectType
        connectionName: formData.connectionName,
        connectionDescription: formData.connectionDescription,
        connectionStatus: formData.connectionStatus,
        paymentMethods: formData.paymentMethods,
        campaignType: formData.campaignType,
        specialOptions: formData.specialOptions,
        standingOrderChargeMode: formData.standingOrderChargeMode,
        allowBankStandingOrder: formData.allowBankStandingOrder,
        thankYouEmail: formData.thankYouEmail,
        items: formData.items,
        settings: formData.settings,
        // qaId: formData.qaId
      };

      const result = await apiConnectionsService.createConnection(connectionData);
      return result;
    } catch (error) {
      console.error('Error submitting connection:', error);
      return { success: false, message: error.message };
    }
  };

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    validateStep,
    submitConnection
  };
};

export default useWizardState;