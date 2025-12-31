import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiConnectionsProvider } from './contexts/ApiConnectionsContext';
import { PaymentMethodsProvider } from './contexts/PaymentMethodsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ApiConnectionsManager from './components/ApiConnections/ApiConnectionsManager';
import NotificationContainer from './components/shared/NotificationContainer';

import './App.css';

// מסך טעינה
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{
      fontSize: '48px',
      marginBottom: '20px'
    }}>
      <i className="fa fa-spinner fa-spin"></i>
    </div>
    <h2 style={{ margin: '10px 0' }}>טוען...</h2>
    <p style={{ opacity: 0.8 }}>מאמת הרשאות ואימות</p>
  </div>
);

// מסך שגיאה
const ErrorScreen = ({ error }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{
      fontSize: '72px',
      marginBottom: '20px'
    }}>
      <i className="fa fa-exclamation-triangle"></i>
    </div>
    <h2 style={{ margin: '10px 0', fontSize: '32px' }}>שגיאת אימות</h2>
    <div style={{
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '20px',
      borderRadius: '12px',
      maxWidth: '600px',
      marginTop: '20px',
      whiteSpace: 'pre-line'
    }}>
      <p style={{ fontSize: '18px', lineHeight: 1.6 }}>{error}</p>
    </div>
    <div style={{
      marginTop: '30px',
      opacity: 0.8,
      fontSize: '14px'
    }}>
      <p>אנא פנה למנהל המערכת או נסה להתחבר מחדש דרך הפורטל</p>
    </div>
  </div>
);

// הקומפוננטה הראשית שמשתמשת ב-Auth
function AppContent() {
  const { isLoading, isAuthenticated, error, userId, companyId } = useAuth();

  // מסך טעינה
  if (isLoading) {
    return <LoadingScreen />;
  }

  // מסך שגיאה
  if (!isAuthenticated || error) {
    return <ErrorScreen error={error || 'שגיאה לא ידועה באימות'} />;
  }

  // כל הבדיקות עברו - הצג את האפליקציה
  console.log('✅ משתמש מאומת:', { userId, companyId });

  return (
    <Router basename="/add_connect">
      <NotificationProvider>
        <PaymentMethodsProvider>
          <ApiConnectionsProvider>
            <div className="app" dir="rtl">
              <NotificationContainer />

              <Routes>
                <Route path="/" element={<ApiConnectionsManager />} />
                <Route path="/api-connections" element={<ApiConnectionsManager />} />
              </Routes>
            </div>
          </ApiConnectionsProvider>
        </PaymentMethodsProvider>
      </NotificationProvider>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
