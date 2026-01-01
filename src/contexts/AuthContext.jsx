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

        console.log('✅ משתמש מאומת - מפעיל מערכת רענון טוכן אוטומטית');

        // פונקציה לרענון טוכן
        const refreshToken = async () => {
          try {
            console.log('🔄 מנסה לרענן טוכן...');

            const response = await fetch('https://portal.tak.co.il/pages/admin_page/manage_api_apps/refresh_token.php', {
              method: 'POST',
              credentials: 'include', // שולח cookies (admin_company, admin_id)
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (!response.ok) {
              throw new Error('Refresh token failed');
            }

            const result = await response.json();

            if (result.success && result.token) {
              console.log('✅ טוכן רוענן בהצלחה');
              console.log('🆕 טוכן חדש פג תוקף ב:', new Date(result.expiresAt * 1000).toLocaleString('he-IL'));

              // עדכן את authData ב-auth utility
              auth.setAuthData({
                token: result.token,
                userId: tokenValidation.userId,
                companyId: tokenValidation.companyId,
                expiresAt: result.expiresAt,
                payload: tokenValidation.payload
              });

              // עדכן את ה-state
              setAuthState(prev => ({
                ...prev,
                token: result.token,
                expiresAt: result.expiresAt
              }));

              return true;
            } else {
              throw new Error(result.message || 'Token refresh failed');
            }
          } catch (error) {
            console.error('❌ רענון טוכן נכשל:', error);

            // אם זה 401 - הסשן פג תוקף בפורטל
            if (error.message.includes('401') || error.message.includes('Session expired')) {
              console.error('❌ הסשן בפורטל פג תוקף - מנתק משתמש');
              setAuthState({
                isLoading: false,
                isAuthenticated: false,
                error: 'הסשן פג תוקף. אנא התחבר מחדש דרך הפורטל',
                token: null,
                userId: null,
                companyId: null,
                expiresAt: null,
                payload: null
              });
              auth.logout();
            }

            return false;
          }
        };

        // בדיקה והרענון אוטומטי
        const checkAndRefreshToken = () => {
          // קבל את expiresAt מ-auth utility (תמיד מעודכן)
          const currentExpiresAt = auth.getExpiresAt();
          if (!currentExpiresAt) {
            console.warn('⚠️ לא נמצא expiresAt - מדלג על בדיקה');
            return;
          }

          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = currentExpiresAt - now;

          console.log(`⏰ זמן עד תפוגת טוכן: ${timeUntilExpiry} שניות (${Math.floor(timeUntilExpiry / 60)} דקות)`);

          // אם נשאר פחות מדקה - רענן עכשיו
          if (timeUntilExpiry < 60) {
            console.log('⚠️ טוכן קרוב לפוג תוקף - מרענן עכשיו');
            refreshToken();
          }
        };

        // בדוק כל 30 שניות אם הטוכן קרוב לפוג
        const refreshInterval = setInterval(() => {
          checkAndRefreshToken();
        }, 30000); // כל 30 שניות

        // בדיקה ראשונית
        checkAndRefreshToken();

        return () => {
          console.log('🛑 מנקה מערכת רענון טוכן');
          clearInterval(refreshInterval);
        };
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
