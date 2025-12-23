/**
 * ולידציה של URL
 * @param {string} url - כתובת URL
 * @returns {boolean} האם תקין
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * ולידציה של אימייל
 * @param {string} email - כתובת אימייל
 * @returns {boolean} האם תקין
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * ולידציה של מספר טלפון ישראלי
 * @param {string} phone - מספר טלפון
 * @returns {boolean} האם תקין
 */
export const isValidIsraeliPhone = (phone) => {
  if (!phone) return false;
  
  // הסרת רווחים ומקפים
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // בדיקת פורמט ישראלי: 05X-XXXXXXX או 0X-XXXXXXX
  const phonePattern = /^0(5[0-9]|[2-4]|[8-9])\d{7}$/;
  return phonePattern.test(cleanPhone);
};

/**
 * ולידציה של שדה טקסט (לא ריק)
 * @param {string} text - טקסט
 * @param {number} minLength - אורך מינימלי
 * @returns {boolean} האם תקין
 */
export const isValidText = (text, minLength = 1) => {
  if (!text || typeof text !== 'string') return false;
  return text.trim().length >= minLength;
};

/**
 * ולידציה של מספר
 * @param {any} value - ערך
 * @param {number} min - מינימום
 * @param {number} max - מקסימום
 * @returns {boolean} האם תקין
 */
export const isValidNumber = (value, min = null, max = null) => {
  const num = Number(value);
  
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
};

/**
 * ולידציה של שדות חובה בטופס
 * @param {object} data - אובייקט הנתונים
 * @param {array} requiredFields - מערך שמות השדות הנדרשים
 * @returns {object} { isValid, errors }
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = 'שדה חובה';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * ניקוי ערך מתווים מיוחדים
 * @param {string} value - ערך
 * @returns {string} ערך מנוקה
 */
export const sanitizeInput = (value) => {
  if (!value || typeof value !== 'string') return '';
  
  // הסרת תגי HTML
  return value
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * בדיקה אם JSON תקין
 * @param {string} jsonString - מחרוזת JSON
 * @returns {boolean} האם תקין
 */
export const isValidJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};
