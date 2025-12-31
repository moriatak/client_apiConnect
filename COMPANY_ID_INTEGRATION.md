# אינטגרציה של Company ID מהטוכן

## סיכום השינויים

עדכנו את המערכת כך ש-**`company_id` מהטוכן משמש אוטומטית בכל קריאות ה-API**.

## קבצים שעודכנו

### 1. `src/utils/auth.js`
**לפני**: ניסה לקבל company_id מ-localStorage/cookies (שלא קיים)
```javascript
getCompanyId() {
  let companyId = localStorage.getItem('admin_company');
  // ...
  return companyId;
}
```

**אחרי**: מחזיר את company_id מהטוכן שנשמר ב-memory
```javascript
let authData = null;

export const auth = {
  setAuthData(data) {
    authData = data;
  },

  getCompanyId() {
    return authData?.companyId || null;
  },

  getToken() {
    return authData?.token || null;
  }
}
```

### 2. `src/contexts/AuthContext.jsx`
**נוסף**: קריאה ל-`auth.setAuthData()` כשהטוכן מאומת
```javascript
// שמור נתוני אימות ב-auth utility
auth.setAuthData({
  token: tokenValidation.token,
  userId: tokenValidation.userId,
  companyId: tokenValidation.companyId,
  expiresAt: tokenValidation.expiresAt,
  payload: tokenValidation.payload
});
```

### 3. `src/services/apiConnectionsService.js`
**לפני**: ברירת מחדל `'62'`
```javascript
const getCompanyId = () => {
  return auth.getCompanyId() || '62'; // ברירת מחדל זמנית
};
```

**אחרי**: זורק שגיאה אם אין company_id
```javascript
const getCompanyId = () => {
  const companyId = auth.getCompanyId();
  if (!companyId) {
    throw new Error('לא נמצא Company ID בטוכן האימות');
  }
  return companyId;
};
```

### 4. `src/services/api.js`
**לפני**: ניסה לקבל טוכן מ-URL או localStorage
```javascript
function getAuthToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) return token;
  return localStorage.getItem('auth_token');
}
```

**אחרי**: משתמש ב-auth utility
```javascript
import { auth } from '../utils/auth';

function getAuthToken() {
  const token = auth.getToken();
  if (!token) {
    throw new Error('לא נמצא טוקן אימות');
  }
  return token;
}
```

## איך זה עובד?

### תהליך:
1. **משתמש נכנס עם URL**: `https://app.com?token=eyJ...`
2. **AuthContext מאמת את הטוכן** ומפענח:
   ```json
   {
     "sub": "user123",
     "company_id": "62",
     "exp": 1735689600,
     "iss": "portal.tak.co.il",
     "aud": "tak.co.il",
     "nonce": "abc123"
   }
   ```
3. **AuthContext שומר ב-auth utility**:
   ```javascript
   auth.setAuthData({
     token: "eyJ...",
     userId: "user123",
     companyId: "62",
     expiresAt: 1735689600,
     payload: { ... }
   })
   ```
4. **כל קריאת API משתמשת ב-companyId**:
   ```javascript
   // ב-apiConnectionsService.js:
   const companyId = getCompanyId(); // מחזיר "62" מהטוכן
   const url = `${API_BASE_URL}/createConnect/${companyId}`;
   // → https://qa.tak.co.il/campaignServer/connetToApi/createConnect/62
   ```

### דוגמת קריאה מלאה:
```http
POST https://qa.tak.co.il/campaignServer/connetToApi/createConnect/62
Headers:
  Authorization: Bearer eyJzdWIiOiJ1c2VyMTIzIiwiY29tcGFueV9pZCI6IjYyIi...
  Content-Type: application/json
Body:
  {
    "connectionName": "My API",
    "connectionType": 1,
    ...
  }
```

## יתרונות

✅ **אבטחה**: company_id תמיד מגיע מטוכן מאומת
✅ **עקביות**: אותו company_id בכל הבקשות
✅ **פשטות**: לא צריך להעביר company_id באופן ידני
✅ **בדיקות**: אם אין company_id בטוכן, המערכת זורקת שגיאה מיד

## בדיקה

כדי לבדוק שזה עובד:

1. **בדוק בקונסול** שאחרי אימות מופיע:
   ```
   ✅ אימות טוכן עבר בהצלחה
   👤 משתמש: user123
   🏢 חברה: 62
   ```

2. **בדוק ב-Network** שהבקשות כוללות:
   - URL: `.../createConnect/62` (עם ה-company_id הנכון)
   - Header: `Authorization: Bearer eyJ...`

3. **אם אין company_id בטוכן**, תקבל שגיאה:
   ```
   Error: לא נמצא Company ID בטוכן האימות
   ```
