import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSecurityRequirements } from '../utils/security';
import { getAndValidateToken, isTokenExpired } from '../utils/tokenUtils';
import { auth } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    error: null,
    token: null,
    userId: null,
    companyId: null,
    expiresAt: null,
    payload: null
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔒 מתחיל אימות...');

        // שלב 1: בדיקת אבטחה - iframe ו-parent origin
        console.log('🔍 שלב 1: בדיקת אבטחת iframe...');
        const securityValidation = validateSecurityRequirements();

        if (!securityValidation.valid) {
          console.error('❌ בדיקת אבטחה נכשלה:', securityValidation.errors);
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: securityValidation.errors.join('\n'),
            token: null,
            userId: null,
            companyId: null,
            expiresAt: null,
            payload: null
          });
          return;
        }

        console.log('✅ בדיקת אבטחה עברה בהצלחה');

        // שלב 2: קבלה ואימות טוקן
        console.log('🔍 שלב 2: אימות טוקן...');
        const tokenValidation = getAndValidateToken();

        if (!tokenValidation.valid) {
          console.error('❌ אימות טוקן נכשל:', tokenValidation.error);
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: tokenValidation.error,
            token: tokenValidation.token,
            userId: null,
            companyId: null,
            expiresAt: null,
            payload: tokenValidation.payload
          });
          return;
        }

        console.log('✅ אימות טוקן עבר בהצלחה');
        console.log('👤 משתמש:', tokenValidation.userId);
        console.log('🏢 חברה:', tokenValidation.companyId);

        // שמור נתוני אימות ב-auth utility
        auth.setAuthData({
          token: tokenValidation.token,
          userId: tokenValidation.userId,
          companyId: tokenValidation.companyId,
          expiresAt: tokenValidation.expiresAt,
          payload: tokenValidation.payload
        });

        // כל הבדיקות עברו - משתמש מאומת
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          error: null,
          token: tokenValidation.token,
          userId: tokenValidation.userId,
          companyId: tokenValidation.companyId,
          expiresAt: tokenValidation.expiresAt,
          payload: tokenValidation.payload
        });

        // הגדר טיימר לבדיקת תפוגה
        const expiryCheck = setInterval(() => {
          if (isTokenExpired(tokenValidation.expiresAt)) {
            console.warn('⚠️ הטוקן פג תוקף');
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              error: 'הטוקן פג תוקף. אנא התחבר מחדש'
            }));
            clearInterval(expiryCheck);
          }
        }, 60000); // בדוק כל דקה

        return () => clearInterval(expiryCheck);
      } catch (error) {
        console.error('❌ שגיאה באימות:', error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          error: 'שגיאה באימות: ' + error.message,
          token: null,
          userId: null,
          companyId: null,
          expiresAt: null,
          payload: null
        });
      }
    };

    initAuth();
  }, []);

  const value = {
    ...authState,
    // פונקציה ליציאה (logout)
    logout: () => {
      auth.logout();
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        error: 'התנתקת מהמערכת',
        token: null,
        userId: null,
        companyId: null,
        expiresAt: null,
        payload: null
      });
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
