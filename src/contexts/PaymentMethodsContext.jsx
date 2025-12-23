import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiConnectionsService } from '../services/apiConnectionsService';

const PaymentMethodsContext = createContext(null);

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within PaymentMethodsProvider');
  }
  return context;
};

export const PaymentMethodsProvider = ({ children }) => {
  const [availableMethods, setAvailableMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailablePaymentMethods();
  }, []);

  const loadAvailablePaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiConnectionsService.getAvailablePaymentMethods();

      if (response.success) {
        const methods = [...response.availableMethods];
        // תמיד כולל הוראת קבע
        if (!methods.includes('recurring_payment')) {
          methods.push('recurring_payment');
          methods.push('recurring_payment_bank');
          methods.push('recurring_payment_immediate');


        }
        setAvailableMethods(methods);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('שגיאה בטעינת אמצעי תשלום');
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    availableMethods,
    loading,
    error,
    reload: loadAvailablePaymentMethods
  };

  return (
    <PaymentMethodsContext.Provider value={value}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};