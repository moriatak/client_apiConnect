/**
 * בדיקות אבטחה לאפליקציה
 */

const ALLOWED_PARENT_ORIGIN = 'https://portal.tak.co.il';

// אפשרות לעקוף בדיקות אבטחה בפיתוח (VITE_SKIP_SECURITY_CHECK=true)
const SKIP_SECURITY_CHECK = import.meta.env.VITE_SKIP_SECURITY_CHECK === 'true';

/**
 * בודק אם האפליקציה רצה בתוך iframe
 */
export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    // אם יש שגיאה, כנראה שאנחנו ב-iframe עם origin שונה
    return true;
  }
}

/**
 * בודק אם ה-parent frame הוא מהמקור המורשה
 */
export function isParentOriginAllowed() {
  if (!isInIframe()) {
    console.log('🔍 לא ב-iframe');
    return false;
  }

  try {
    // ננסה לזהות את ה-parent origin מה-referrer
    const parentOrigin = document.referrer;

    console.log('🔍 Debug Info:', {
      'document.referrer': parentOrigin,
      'window.location.href': window.location.href,
      'window.location.ancestorOrigins': window.location.ancestorOrigins ?
        Array.from(window.location.ancestorOrigins) : 'לא זמין',
      'isInIframe': isInIframe(),
      'ALLOWED_PARENT_ORIGIN': ALLOWED_PARENT_ORIGIN
    });

    // אם אין referrer, ננסה ancestorOrigins (Chrome/Edge)
    if (!parentOrigin) {
      if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
        const ancestorOrigin = window.location.ancestorOrigins[0];
        console.log('🔍 משתמש ב-ancestorOrigins:', ancestorOrigin);

        const allowedUrl = new URL(ALLOWED_PARENT_ORIGIN);
        const isAllowed = ancestorOrigin === allowedUrl.origin;

        if (isAllowed) {
          console.log('✅ Parent origin מאושר (ancestorOrigins):', ancestorOrigin);
          return true;
        } else {
          console.error('❌ Parent origin לא מאושר (ancestorOrigins):', ancestorOrigin, 'ציפינו ל:', allowedUrl.origin);
          return false;
        }
      }

      console.warn('⚠️ לא ניתן לזהות את מקור ה-parent frame - אין referrer ואין ancestorOrigins');
      return false;
    }

    const parentUrl = new URL(parentOrigin);
    const allowedUrl = new URL(ALLOWED_PARENT_ORIGIN);

    const isAllowed = parentUrl.origin === allowedUrl.origin;

    if (isAllowed) {
      console.log('✅ Parent origin מאושר:', parentUrl.origin);
    } else {
      console.error('❌ Parent origin לא מאושר:', parentUrl.origin, 'ציפינו ל:', allowedUrl.origin);
    }

    return isAllowed;
  } catch (error) {
    console.error('❌ שגיאה בבדיקת parent origin:', error);
    return false;
  }
}

/**
 * בודק את כל תנאי האבטחה
 */
export function validateSecurityRequirements() {
  // אפשרות לדלג על בדיקות אבטחה (לפיתוח בלבד!)
  if (SKIP_SECURITY_CHECK) {
    console.warn('⚠️⚠️⚠️ בדיקות אבטחה מושבתות! (VITE_SKIP_SECURITY_CHECK=true)');
    return { valid: true, errors: [] };
  }

  const errors = [];

  // בדיקה 1: האפליקציה חייבת לרוץ בתוך iframe
  if (!isInIframe()) {
    errors.push('האפליקציה חייבת לרוץ בתוך iframe מהפורטל');
  }

  // בדיקה 2: ה-parent חייב להיות מהמקור המורשה
  if (!isParentOriginAllowed()) {
    errors.push('הגישה לאפליקציה מותרת רק דרך הפורטל המורשה');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * הגדר מאזין להודעות מה-parent (לשימוש עתידי)
 */
export function setupParentCommunication(onMessage) {
  window.addEventListener('message', (event) => {
    // ודא שההודעה מגיעה מהמקור המורשה
    if (event.origin !== ALLOWED_PARENT_ORIGIN) {
      console.warn('⚠️ התקבלה הודעה ממקור לא מורשה:', event.origin);
      return;
    }

    console.log('📨 התקבלה הודעה מה-parent:', event.data);

    if (onMessage) {
      onMessage(event.data);
    }
  });
}

/**
 * שלח הודעה ל-parent frame
 */
export function sendMessageToParent(message) {
  if (!isInIframe()) {
    console.warn('⚠️ לא ניתן לשלוח הודעה - האפליקציה לא רצה ב-iframe');
    return;
  }

  try {
    window.parent.postMessage(message, ALLOWED_PARENT_ORIGIN);
    console.log('📤 הודעה נשלחה ל-parent:', message);
  } catch (error) {
    console.error('❌ שגיאה בשליחת הודעה ל-parent:', error);
  }
}

// תאימות לאחור - שמור על הפונקציה הישנה
export function validateIframeContext() {
  const result = validateSecurityRequirements();

  if (!result.valid) {
    console.error('Access denied:', result.errors.join(', '));
    return false;
  }

  return true;
}
