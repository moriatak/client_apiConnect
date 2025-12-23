import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiConnectionsService } from '../services/apiConnectionsService';

const ApiConnectionsContext = createContext(null);

export const useApiConnections = () => {
  const context = useContext(ApiConnectionsContext);
  if (!context) {
    throw new Error('useApiConnections must be used within ApiConnectionsProvider');
  }
  return context;
};

export const ApiConnectionsProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    connectionType: 'all'
  });

  // טעינת חיבורים
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiConnectionsService.getConnections();
      
      if (response.success) {
        setConnections(response.connections || []);
      } else {
        setError(response.message || 'שגיאה בטעינת חיבורים');
      }
    } catch (err) {
      setError('שגיאה בתקשורת עם השרת');
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // טעינה ראשונית
  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // יצירת חיבור חדש
  const createConnection = useCallback(async (connectionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiConnectionsService.createConnection(connectionData);
      
      if (response.success) {
        await loadConnections(); // רענון הרשימה
        return { success: true, data: response };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMsg = 'שגיאה ביצירת חיבור';
      setError(errorMsg);
      console.error('Error creating connection:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadConnections]);

  // עדכון חיבור
  const updateConnection = useCallback(async (connectionId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiConnectionsService.updateConnection(connectionId, updates);
      
      if (response.success) {
        await loadConnections();
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMsg = 'שגיאה בעדכון חיבור';
      setError(errorMsg);
      console.error('Error updating connection:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadConnections]);

  // מחיקת חיבור
  const deleteConnection = useCallback(async (connectionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiConnectionsService.deleteConnection(connectionId);
      
      if (response.success) {
        await loadConnections();
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMsg = 'שגיאה במחיקת חיבור';
      setError(errorMsg);
      console.error('Error deleting connection:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadConnections]);

  // בדיקת חיבור
  const testConnection = useCallback(async (connectionId) => {
    try {
      const response = await apiConnectionsService.testConnection(connectionId);
      return response;
    } catch (err) {
      console.error('Error testing connection:', err);
      return { success: false, message: 'שגיאה בבדיקת חיבור' };
    }
  }, []);
// ... קוד קיים ...

// פונקציית סינון מעודכנת
const getFilteredConnections = () => {
  return connections.filter(connection => {
    // סינון לפי חיפוש
    const matchesSearch = filters.searchTerm === '' || 
      connection.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      connection.qaId?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      connection.token?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      connection.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // סינון לפי סטטוס
    const matchesStatus = filters.status === 'all' || 
      connection.status === filters.status;

    // סינון לפי סוג חיבור (השוואה של מספרים)
    const matchesType = filters.connectionType === 'all' || 
      connection.connectionType === parseInt(filters.connectionType);

    return matchesSearch && matchesStatus && matchesType;
  });
};

// ... שאר הקוד ...
  // סינון חיבורים
  const filteredConnections = useCallback(() => {
    return connections.filter(conn => {
      const matchesSearch = filters.searchTerm === '' || 
        conn.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        conn.qaId.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || conn.status === filters.status;
      
      const matchesType = filters.connectionType === 'all' || 
        conn.connectionType === filters.connectionType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [connections, filters]);

  const value = {
    connections,
    filteredConnections: filteredConnections(),
    loading,
    error,
    filters,
    setFilters,
    loadConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    getFilteredConnections,
    testConnection
  };

  return (
    <ApiConnectionsContext.Provider value={value}>
      {children}
    </ApiConnectionsContext.Provider>
  );
};