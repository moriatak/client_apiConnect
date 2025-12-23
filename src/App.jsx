import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiConnectionsProvider } from './contexts/ApiConnectionsContext';
import { PaymentMethodsProvider } from './contexts/PaymentMethodsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ApiConnectionsManager from './components/ApiConnections/ApiConnectionsManager';
import NotificationContainer from './components/shared/NotificationContainer';
import './App.css';

function App() {
  return (
    <Router  basename="/add_connect">
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

export default App;