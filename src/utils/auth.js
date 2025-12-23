// ניהול פרטי התחברות וזיהוי חברה

export const auth = {
  // קבלת Company ID
  getCompanyId() {
    // נסה מ-localStorage
    let companyId = localStorage.getItem('admin_company');
    
    // נסה מ-sessionStorage
    if (!companyId) {
      companyId = sessionStorage.getItem('admin_company');
    }
    
    // נסה מ-cookies
    if (!companyId) {
      companyId = this.getCookie('admin_company');
    }
    
    return companyId;
  },

  // שמירת Company ID
  setCompanyId(companyId) {
    localStorage.setItem('admin_company', companyId);
    sessionStorage.setItem('admin_company', companyId);
  },

  // קבלת Cookie
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },

  // בדיקה אם מחובר
  isAuthenticated() {
    return !!this.getCompanyId();
  },

  // ניקוי נתונים
  logout() {
    localStorage.removeItem('admin_company');
    sessionStorage.removeItem('admin_company');
  }
};