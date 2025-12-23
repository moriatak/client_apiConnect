import { getPrefixForConnectionType } from '../constants/connectionTypes';

/**
 * יוצר QA ID ייחודי לפי שם סוג החיבור
 * @param {string} connectionTypeName - שם סוג החיבור (charidy, wordpress, msofon, Trumot)
 * @returns {string} QA ID בפורמט PREFIX-XXX
 */
export const generateQaId = (connectionTypeName) => {
  // קבלת הקידומת לפי שם סוג החיבור
  const prefix = getPrefixForConnectionType(connectionTypeName);
  
  // יצירת מספר רנדומלי בן 3 ספרות
  const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
  
  return `${prefix}-${randomNum}`;
};

/**
 * יוצר Token ייחודי לחיבור (לא בשימוש - השרת מייצר)
 * הפונקציה נשארת לצורך תאימות לאחור
 * @param {string} connectionTypeName - שם סוג החיבור
 * @param {number} length - אורך ה-Token (ברירת מחדל: 50)
 * @returns {string} Token רנדומלי
 */
export const generateToken = (connectionTypeName, length = 50) => {
  // השרת מייצר Token אוטומטית, אבל נשאיר פונקציה זו לשימוש עתידי
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return token;
};

/**
 * יוצר Token קצר (3 תווים) לקמפיינים - כמו שהשרת מייצר
 * @returns {string} Token בן 3 תווים
 */
export const generateShortToken = () => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  
  let token = '';
  for (let i = 0; i < 3; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return token;
};

/**
 * יוצר API Token ארוך (50 תווים) - כמו שהשרת מייצר
 * @returns {string} API Token בן 50 תווים
 */
export const generateApiToken = () => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  
  let token = '';
  for (let i = 0; i < 50; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return token;
};

/**
 * ולידציה של QA ID
 * @param {string} qaId - ה-QA ID לבדיקה
 * @returns {boolean} האם ה-QA ID תקין
 */
export const validateQaId = (qaId) => {
  if (!qaId || typeof qaId !== 'string') {
    return false;
  }
  
  // פורמט: PREFIX-XXX (כאשר PREFIX הוא 2-3 אותיות ו-XXX הוא 3 ספרות)
  const qaIdPattern = /^[A-Z]{2,3}-\d{3}$/;
  return qaIdPattern.test(qaId);
};

/**
 * ולידציה של Token קצר (3 תווים)
 * @param {string} token - ה-Token לבדיקה
 * @returns {boolean} האם ה-Token תקין
 */
export const validateShortToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Token קצר: 3 תווים (אותיות גדולות/קטנות ומספרים)
  const shortTokenPattern = /^[a-zA-Z0-9]{3}$/;
  return shortTokenPattern.test(token.trim());
};

/**
 * ולידציה של API Token ארוך (50 תווים)
 * @param {string} token - ה-API Token לבדיקה
 * @returns {boolean} האם ה-Token תקין
 */
export const validateApiToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // API Token: 50 תווים (אותיות ומספרים)
  const apiTokenPattern = /^[a-zA-Z0-9]{50}$/;
  return apiTokenPattern.test(token);
};

/**
 * ולידציה כללית של Token (מתאים לשני הסוגים)
 * @param {string} token - ה-Token לבדיקה
 * @returns {boolean} האם ה-Token תקין
 */
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const trimmedToken = token.trim();
  
  // בדיקה אם זה Token קצר (3 תווים) או API Token (50 תווים)
  return validateShortToken(trimmedToken) || validateApiToken(trimmedToken);
};

/**
 * מזהה את סוג ה-Token
 * @param {string} token - ה-Token
 * @returns {string} 'short' | 'api' | 'invalid'
 */
export const identifyTokenType = (token) => {
  if (!token) return 'invalid';
  
  const trimmedToken = token.trim();
  
  if (validateShortToken(trimmedToken)) return 'short';
  if (validateApiToken(trimmedToken)) return 'api';
  
  return 'invalid';
};

/**
 * יוצר מזהה ייחודי (UUID פשוט)
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * יוצר מספר אקראי מאובטח
 * @param {number} min - מינימום
 * @param {number} max - מקסימום
 * @returns {number} מספר אקראי
 */
export const getSecureRandomNumber = (min, max) => {
  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBuffer);
    return min + (randomBuffer[0] % range);
  }
  
  // fallback
  return Math.floor(Math.random() * range) + min;
};

/**
 * בודק אם Token כבר קיים (דורש קריאה לשרת)
 * @param {string} token - ה-Token לבדיקה
 * @returns {Promise<boolean>} האם ה-Token קיים
 */
export const checkTokenExists = async (token) => {
  try {
    // כאן תהיה קריאה לשרת
    // const response = await fetch(`/api/check-token?token=${token}`);
    // const data = await response.json();
    // return data.exists;
    
    // בינתיים - סימולציה
    return false;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

/**
 * יוצר Token ייחודי שלא קיים במערכת
 * @param {string} connectionTypeName - שם סוג החיבור
 * @param {number} maxAttempts - מספר ניסיונות מקסימלי
 * @returns {Promise<string>} Token ייחודי
 */
export const generateUniqueToken = async (connectionTypeName, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const token = generateShortToken();
    const exists = await checkTokenExists(token);
    
    if (!exists) {
      return token;
    }
  }
  
  // אם לא הצלחנו למצוא Token ייחודי, ננסה שוב עם timestamp
  const timestamp = Date.now().toString(36).substring(0, 3);
  return timestamp;
};

/**
 * פורמט Token קצר לתצוגה (3 תווים - מציג הכל)
 * @param {string} token - ה-Token המלא
 * @returns {string} Token מפורמט
 */
export const formatShortTokenForDisplay = (token) => {
  if (!token) return '';
  return token.trim();
};

/**
 * פורמט API Token לתצוגה (מסתיר חלק מה-Token)
 * @param {string} token - ה-API Token המלא
 * @param {number} visibleChars - כמה תווים להציג בתחילה ובסוף
 * @returns {string} Token מפורמט
 */
export const formatApiTokenForDisplay = (token, visibleChars = 8) => {
  if (!token || token.length <= visibleChars * 2) {
    return token;
  }
  
  const start = token.substring(0, visibleChars);
  const end = token.substring(token.length - visibleChars);
  const middle = '•'.repeat(10);
  
  return `${start}${middle}${end}`;
};

/**
 * פורמט Token לתצוגה (אוטומטי לפי סוג)
 * @param {string} token - ה-Token
 * @param {number} visibleChars - כמה תווים להציג (רלוונטי רק ל-API Token)
 * @returns {string} Token מפורמט
 */
export const formatTokenForDisplay = (token, visibleChars = 8) => {
  if (!token) return '';
  
  const tokenType = identifyTokenType(token);
  
  if (tokenType === 'short') {
    return formatShortTokenForDisplay(token);
  }
  
  if (tokenType === 'api') {
    return formatApiTokenForDisplay(token, visibleChars);
  }
  
  return token;
};

/**
 * מעתיק טקסט ללוח (clipboard)
 * @param {string} text - הטקסט להעתקה
 * @returns {Promise<boolean>} האם ההעתקה הצליחה
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // fallback לדפדפנים ישנים
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * מנקה Token מרווחים מיותרים
 * @param {string} token - ה-Token
 * @returns {string} Token מנוקה
 */
export const cleanToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  return token.trim();
};

/**
 * משווה שני Tokens (מתעלם מרווחים)
 * @param {string} token1 - Token ראשון
 * @param {string} token2 - Token שני
 * @returns {boolean} האם הם זהים
 */
export const compareTokens = (token1, token2) => {
  return cleanToken(token1) === cleanToken(token2);
};

/**
 * בודק אם Token ריק או לא תקין
 * @param {string} token - ה-Token
 * @returns {boolean} האם ה-Token ריק
 */
export const isTokenEmpty = (token) => {
  return !token || cleanToken(token) === '';
};

/**
 * מחזיר אורך Token אמיתי (ללא רווחים)
 * @param {string} token - ה-Token
 * @returns {number} אורך ה-Token
 */
export const getTokenLength = (token) => {
  return cleanToken(token).length;
};