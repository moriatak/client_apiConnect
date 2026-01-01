// ניהול פרטי התחברות וזיהוי חברה
// משתמש בטוקן מה-URL ומנהל את פרטי האימות

let authData = null;

export const auth = {
  // שמירת נתוני אימות מהטוקן
  setAuthData(data) {
    authData = data;
  },

  // קבלת Company ID מהטוקן
  getCompanyId() {
    return authData?.companyId || null;
  },

  // קבלת User ID מהטוקן
  getUserId() {
    return authData?.userId || null;
  },

  // קבלת הטוקן המלא
  getToken() {
    return authData?.token || null;
  },

  // קבלת payload מהטוכן
  getPayload() {
    return authData?.payload || null;
  },

  // קבלת expiresAt
  getExpiresAt() {
    return authData?.expiresAt || null;
  },

  // בדיקה אם מחובר
  isAuthenticated() {
    return !!authData && !!authData.token && !!authData.companyId;
  },

  // בדיקה אם הטוכן פג תוקף
  isTokenExpired() {
    if (!authData?.expiresAt) return true;
    const now = Math.floor(Date.now() / 1000);
    return authData.expiresAt < now;
  },

  // ניקוי נתונים
  logout() {
    authData = null;
  }
};