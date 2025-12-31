# מערכת אבטחה - API Connections Manager

## סקירה כללית

האפליקציה מאובטחת במספר שכבות אבטחה כדי להבטיח שהיא תפעל רק במסגרת הפורטל המורשה ועם אימות תקין.

## שכבות אבטחה

### 1. אבטחת iframe

האפליקציה חייבת לרוץ בתוך iframe מהכתובת המורשה בלבד:
- **כתובת מורשה**: `https://portal.tak.co.il`
- **בדיקה**: `src/utils/security.js`

```javascript
// האפליקציה בודקת שהיא רצה ב-iframe
isInIframe()

// בודקת שה-parent הוא מהמקור המורשה
isParentOriginAllowed()
```

### 2. אימות טוקן

הטוקן מועבר ב-URL כפרמטר `token` ומכיל:

**פורמט הטוכן**: `payload.signature`

**שדות ב-payload** (מקודד ב-base64url):
- `sub`: מזהה משתמש
- `company_id`: מזהה חברה
- `exp`: תאריך תפוגה (unix timestamp)
- `iss`: "portal.tak.co.il" (מנפיק הטוקן)
- `aud`: "tak.co.il" (קהל היעד)
- `nonce`: מספר אקראי למניעת replay attacks

**דוגמה ל-payload**:
```json
{
  "sub": "user123",
  "company_id": "62",
  "exp": 1735689600,
  "iss": "portal.tak.co.il",
  "aud": "tak.co.il",
  "nonce": "abc123xyz"
}
```

### 3. בדיקות אימות

**בדיקות שמתבצעות**:
1. ✅ הטוקן קיים ב-URL
2. ✅ הטוקן בפורמט תקין (payload.signature)
3. ✅ ה-payload ניתן לפענוח
4. ✅ כל השדות הנדרשים קיימים
5. ✅ הטוקן לא פג תוקף
6. ✅ ה-issuer תקין (`portal.tak.co.il`)
7. ✅ ה-audience תקין (`tak.co.il`)

## מבנה הקבצים

### קבצי אבטחה ואימות

```
src/
├── utils/
│   ├── security.js        # בדיקות אבטחת iframe ו-parent origin
│   └── tokenUtils.js      # פענוח ואימות טוקנים
├── contexts/
│   └── AuthContext.jsx    # ניהול מצב אימות גלובלי
└── services/
    └── api.js             # קריאות API מאובטחות
```

### `src/utils/security.js`

פונקציות לבדיקת אבטחה:
- `isInIframe()` - בודק אם רץ ב-iframe
- `isParentOriginAllowed()` - בודק את ה-parent origin
- `validateSecurityRequirements()` - מריץ את כל הבדיקות

### `src/utils/tokenUtils.js`

פונקציות לטיפול בטוקנים:
- `getTokenFromUrl()` - שולף טוקן מה-URL
- `parseToken(token)` - מפענח טוקן לפורמט object
- `validateTokenContent(payload)` - מאמת את תוכן הטוקן
- `getAndValidateToken()` - מריץ את כל התהליך
- `isTokenExpired(expiresAt)` - בודק אם פג תוקף

### `src/contexts/AuthContext.jsx`

Context Provider שמנהל:
- מצב אימות גלובלי
- בדיקות אבטחה בטעינה
- בדיקת תפוגת טוקן אוטומטית (כל דקה)
- ניהול שגיאות

**State שנשמר**:
```javascript
{
  isLoading: boolean,
  isAuthenticated: boolean,
  error: string | null,
  token: string,
  userId: string,
  companyId: string,
  expiresAt: number,
  payload: object
}
```

### `src/services/api.js`

פונקציות לקריאות API מאובטחות:
- כל קריאה כוללת `Authorization: Bearer {token}` header
- טיפול בשגיאות 401/403
- פונקציות עזר: `apiGet`, `apiPost`, `apiPut`, `apiDelete`

### `src/utils/auth.js`

ניהול נתוני אימות גלובליים:
- `setAuthData(data)` - שמירת נתוני אימות מהטוכן
- `getCompanyId()` - קבלת company_id מהטוכן (**משמש בכל קריאות ה-API**)
- `getUserId()` - קבלת user_id מהטוכן
- `getToken()` - קבלת הטוכן המלא
- `getPayload()` - קבלת ה-payload המלא
- `isAuthenticated()` - בדיקה אם משתמש מחובר
- `isTokenExpired()` - בדיקה אם הטוכן פג תוקף
- `logout()` - ניקוי נתוני אימות

**חשוב**: ה-`company_id` מהטוכן משמש **באופן אוטומטי** בכל קריאות ה-API דרך הפונקציה `getCompanyId()` ב-`apiConnectionsService.js`

## שימוש

### קבלת נתוני אימות בקומפוננטה

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const {
    isAuthenticated,
    userId,
    companyId,
    token
  } = useAuth();

  if (!isAuthenticated) {
    return <div>לא מאומת</div>;
  }

  return <div>שלום משתמש {userId} מחברה {companyId}</div>;
}
```

### ביצוע קריאת API

```javascript
import { apiGet, apiPost } from './services/api';

// GET request
const connections = await apiGet(`get_connections/${companyId}`);

// POST request
const result = await apiPost(`createConnect/${companyId}`, {
  connectionName: 'My Connection',
  connectionType: 1
});
```

## תהליך האימות

1. **טעינת האפליקציה** → `AuthProvider` מתחיל
2. **בדיקת iframe** → האם רץ ב-iframe? האם parent מורשה?
3. **שליפת טוקן** → מחפש `?token=...` ב-URL
4. **פענוח טוקן** → מפענח base64url payload
5. **אימות תוכן** → בודק שדות, תפוגה, issuer, audience
6. **שמירת נתונים** → `auth.setAuthData()` שומר את ה-token, userId, companyId
7. **הצלחה** ✅ → `isAuthenticated = true`, האפליקציה נטענת
8. **כישלון** ❌ → מסך שגיאה אדום עם הסבר

### איך ה-company_id משמש בקריאות API?

כאשר האפליקציה מבצעת קריאה לשרת (למשל `createConnection`), הקוד:

1. קורא ל-`getCompanyId()` ב-`apiConnectionsService.js`
2. הפונקציה מפנה ל-`auth.getCompanyId()` שמחזיר את ה-`company_id` **מהטוכן**
3. ה-URL נבנה עם ה-company_id: `${API_BASE_URL}/createConnect/${companyId}`
4. הבקשה נשלחת עם Header: `Authorization: Bearer {token}`

**דוגמה**:
```javascript
// אם הטוכן מכיל: { "company_id": "62", ... }
// הקריאה תהיה:
// POST https://qa.tak.co.il/campaignServer/connetToApi/createConnect/62
// Headers: { "Authorization": "Bearer eyJ..." }
```

זה מבטיח ש**כל** קריאה לשרת משתמשת ב-company_id הנכון מהטוכן, ולא בערך קבוע או שגוי.

## מסכים

### מסך טעינה
מוצג בזמן בדיקות האימות (1-2 שניות)

### מסך שגיאה
מוצג כאשר:
- האפליקציה לא רצה ב-iframe
- ה-parent לא מורשה
- אין טוקן ב-URL
- הטוקן לא תקין
- הטוקן פג תוקף
- שדות חובה חסרים

## דוגמת URL תקינה

```
https://your-app.com/add_connect?token=eyJzdWIiOiJ1c2VyMTIzIiwiY29tcGFueV9pZCI6IjYyIiwiZXhwIjoxNzM1Njg5NjAwLCJpc3MiOiJwb3J0YWwudGFrLmNvLmlsIiwiYXVkIjoidGFrLmNvLmlsIiwibm9uY2UiOiJhYmMxMjN4eXoifQ.signature123
```

## אבטחה נוספת

### הגנה מפני Replay Attacks
- כל טוקן מכיל `nonce` ייחודי
- תאריך תפוגה (`exp`) מוגבל בזמן

### הגנה מפני XSS
- הטוקן לא נשמר ב-localStorage (רק ב-memory)
- כל ה-payload מאומת לפני שימוש

### הגנה מפני CSRF
- האפליקציה רצה רק ב-iframe מורשה
- בדיקת parent origin

## טיפול בשגיאות

```javascript
try {
  const data = await apiGet('some-endpoint');
} catch (error) {
  if (error.message.includes('טוקן לא תקין')) {
    // הטוקן פג תוקף - נתק משתמש
  } else if (error.message.includes('אין הרשאה')) {
    // 403 - אין הרשאה
  } else {
    // שגיאה כללית
  }
}
```

## משתנה סביבה

ב-`.env`:
```env
VITE_API_URL=https://qa.tak.co.il/campaignServer/connetToApi
```

## בדיקת תפוגת טוכן

האפליקציה בודקת אוטומטית כל דקה אם הטוקן פג תוקף.
כשהטוכן פג תוקף:
- `isAuthenticated` משתנה ל-`false`
- מוצג מסך שגיאה: "הטוכן פג תוקף. אנא התחבר מחדש"

## תמיכה ופתרון בעיות

### שגיאה: "האפליקציה חייבת לרוץ בתוך iframe"
**פתרון**: טען את האפליקציה דרך הפורטל בכתובת `https://portal.tak.co.il`

### שגיאה: "הגישה מותרת רק דרך הפורטל המורשה"
**פתרון**: וודא שה-parent origin הוא `https://portal.tak.co.il`

### שגיאה: "לא נמצא טוקן ב-URL"
**פתרון**: הוסף `?token=...` ל-URL

### שגיאה: "הטוכן פג תוקף"
**פתרון**: קבל טוכן חדש מהשרת והתחבר מחדש

---

**גרסה**: 1.0
**תאריך עדכון אחרון**: 2025-01-01
