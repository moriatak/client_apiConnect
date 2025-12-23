import { useState, useEffect } from 'react';
import { apiConnectionsService } from '../services/apiConnectionsService';

const usePaymentMethods = () => {
  const [availableMethods, setAvailableMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailablePaymentMethods();
  }, []);

  const loadAvailablePaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await apiConnectionsService.getAvailablePaymentMethods();
      
      if (response.success) {
        // תמיד כולל הוראת קבע
        const methods = [...response.availableMethods];
        if (!methods.includes('standing_order')) {
          methods.push('standing_order');
        }
        setAvailableMethods(methods);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('שגיאה בטעינת אמצעי תשלום');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { availableMethods, loading, error };
};

export default usePaymentMethods;