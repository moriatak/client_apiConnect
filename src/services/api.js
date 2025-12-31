/**
 * פונקציות לקריאות API מאובטחות
 */

import { auth } from '../utils/auth';

// כתובת בסיס ל-API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qa.tak.co.il/campaignServer/connetToApi';

/**
 * קבל את הטוקן הנוכחי מה-auth utility
 */
function getAuthToken() {
  const token = auth.getToken();
  if (!token) {
    throw new Error('לא נמצא טוקן אימות');
  }
  return token;
}

/**
 * יצירת headers עם אימות
 */
function createHeaders(token, additionalHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * פונקציה כללית לקריאת API
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('לא נמצא טוקן אימות');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/${endpoint}`;

  const config = {
    ...options,
    headers: createHeaders(token, options.headers)
  };

  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);

    // בדוק שגיאות HTTP
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('טוקן לא תקין או פג תוקף');
      }
      if (response.status === 403) {
        throw new Error('אין הרשאה לבצע פעולה זו');
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Response: ${url}`, data);

    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
}

/**
 * GET request
 */
export async function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiRequest(url, {
    method: 'GET'
  });
}

/**
 * POST request
 */
export async function apiPost(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE'
  });
}

/**
 * דוגמאות לקריאות ספציפיות
 */

// קבלת כל החיבורים
export async function getConnections(companyId) {
  return apiGet(`get_connections/${companyId}`);
}

// יצירת חיבור חדש
export async function createConnection(companyId, connectionData) {
  return apiPost(`createConnect/${companyId}`, connectionData);
}

// עדכון חיבור
export async function updateConnection(companyId, connectionId, updates) {
  return apiPut(`updateConnect/${companyId}`, {
    cId: connectionId,
    ...updates
  });
}

// מחיקת חיבור
export async function deleteConnection(companyId, connectionId) {
  return apiDelete(`deleteConnect/${companyId}`, {
    cId: connectionId
  });
}

// קבלת סוגי חיבורים
export async function getConnectionTypes() {
  return apiGet('getAllTypeConnect');
}

// קבלת אמצעי תשלום
export async function getPaymentOptions(companyId) {
  return apiGet(`getPaymentOptions/${companyId}`);
}

// Export default object with all methods
export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  getConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  getConnectionTypes,
  getPaymentOptions
};
