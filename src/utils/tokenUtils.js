/**
 * פונקציות לטיפול בטוקנים
 */

/**
 * פענוח base64url לטקסט רגיל
 */
function base64UrlDecode(str) {
  // המר base64url ל-base64 רגיל
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // הוסף padding אם צריך
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  try {
    // פענח base64
    const decoded = atob(base64);
    // המר ל-UTF-8
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error('❌ שגיאה בפענוח base64url:', error);
    throw new Error('שגיאה בפענוח הטוקן');
  }
}

/**
 * קבל את הטוקן מה-URL
 */
export function getTokenFromUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      console.warn('⚠️ לא נמצא טוקן ב-URL');
      return null;
    }

    console.log('✅ טוקן נמצא ב-URL');
    return token;
  } catch (error) {
    console.error('❌ שגיאה בקבלת הטוקן מה-URL:', error);
    return null;
  }
}

/**
 * פענוח הטוקן ללא אימות חתימה
 * @param {string} token - הטוקן המלא (payload.signature)
 * @returns {object} - אובייקט עם payload ו-signature
 */
export function parseToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('טוקן לא תקין');
  }

  // פצל את הטוקן לשני חלקים
  const parts = token.split('.');

  if (parts.length !== 2) {
    throw new Error('פורמט הטוקן לא תקין - חייב להיות בפורמט payload.signature');
  }

  const [payloadEncoded, signature] = parts;

  try {
    // פענח את ה-payload
    const payloadJson = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(payloadJson);

    console.log('✅ טוקן פוענח בהצלחה:', {
      userId: payload.sub,
      companyId: payload.company_id,
      issuer: payload.iss,
      audience: payload.aud,
      expiresAt: new Date(payload.exp * 1000).toLocaleString('he-IL')
    });

    return {
      payload,
      signature,
      raw: token
    };
  } catch (error) {
    console.error('❌ שגיאה בפענוח הטוקן:', error);
    throw new Error('שגיאה בפענוח הטוקן');
  }
}

/**
 * אמת את תוכן הטוקן (בדיקות לוגיות)
 */
export function validateTokenContent(payload) {
  const errors = [];

  // בדיקה 1: בדוק שיש sub (user id)
  if (!payload.sub) {
    errors.push('הטוקן לא מכיל מזהה משתמש');
  }

  // בדיקה 2: בדוק שיש company_id
  if (!payload.company_id) {
    errors.push('הטוקן לא מכיל מזהה חברה');
  }

  // בדיקה 3: בדוק שיש exp (תאריך תפוגה)
  if (!payload.exp) {
    errors.push('הטוקן לא מכיל תאריך תפוגה');
  } else {
    // בדוק שהטוקן לא פג תוקף
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      errors.push('הטוקן פג תוקף');
    }
  }

  // בדיקה 4: בדוק את ה-issuer
  if (payload.iss !== 'portal.tak.co.il') {
    errors.push(`Issuer לא תקין: ${payload.iss}`);
  }

  // בדיקה 5: בדוק את ה-audience
  if (payload.aud !== 'tak.co.il') {
    errors.push(`Audience לא תקין: ${payload.aud}`);
  }

  // בדיקה 6: בדוק שיש nonce
  if (!payload.nonce) {
    errors.push('הטוקן לא מכיל nonce');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * קבל וא מת את הטוקן
 */
export function getAndValidateToken() {
  // קבל את הטוקן מה-URL
  const token = getTokenFromUrl();

  if (!token) {
    return {
      valid: false,
      error: 'לא נמצא טוקן ב-URL',
      token: null,
      payload: null
    };
  }

  try {
    // פענח את הטוקן
    const { payload, signature, raw } = parseToken(token);

    // אמת את תוכן הטוקן
    const validation = validateTokenContent(payload);

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.errors.join(', '),
        token: raw,
        payload
      };
    }

    return {
      valid: true,
      token: raw,
      payload,
      signature,
      userId: payload.sub,
      companyId: payload.company_id,
      expiresAt: payload.exp
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      token,
      payload: null
    };
  }
}

/**
 * בדוק אם הטוקן פג תוקף
 */
export function isTokenExpired(expiresAt) {
  if (!expiresAt) return true;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt < now;
}

/**
 * קבל את הזמן שנותר עד לתפוגת הטוקן (בשניות)
 */
export function getTimeUntilExpiry(expiresAt) {
  if (!expiresAt) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}
