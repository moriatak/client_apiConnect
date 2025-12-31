# תיקון בעיית 403 Forbidden

## 🐛 הבעיה שהייתה

כשניסית להתחבר מהפורטל, קיבלת:
```
GET /getAllTypeConnect 403 (Forbidden)
POST /getPaymentOptions/62 403 (Forbidden)
GET /get_connections/62 403 (Forbidden)
```

**הסיבה**: הקוד **לא שלח** את ה-`Authorization` header עם הטוכן לשרת!

## ✅ מה תיקנו

### 1. הוספנו Authorization Header לכל הבקשות

**קודם** (לא עבד):
```javascript
const response = await fetch(`${API_BASE_URL}/getAllTypeConnect`);
// ❌ אין Authorization header
```

**עכשיו** (עובד):
```javascript
const response = await fetch(`${API_BASE_URL}/getAllTypeConnect`, {
  headers: getAuthHeaders()  // ✅ כולל Authorization: Bearer {token}
});
```

### 2. יצרנו פונקציה מרכזית `getAuthHeaders()`

```javascript
const getAuthHeaders = () => {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
```

זה מוסיף **אוטומטית** את הטוכן לכל בקשה!

### 3. עדכנו את כל קריאות ה-API

עדכנו 12 מקומות ב-`apiConnectionsService.js`:
- ✅ `getConnectionTypes()`
- ✅ `getAvailablePaymentMethods()`
- ✅ `createConnection()`
- ✅ `getConnections()`
- ✅ `getConnectionDetails()`
- ✅ `updateConnection()`
- ✅ `deleteConnection()`
- ✅ `testConnection()`
- ✅ `regenerateApiToken()`
- ✅ `getItems()`
- ✅ `getAllContracts()`

כל אחד מהפונקציות האלה **עכשיו שולח** את ה-`Authorization: Bearer {token}` header!

### 4. הסרנו בדיקת תפוגה אוטומטית

**בעיה שביקשת לתקן**:
> "אני צריכה שלמרות שהתוקן קצר האתר ישאר פתוח להרבה זמן"

**קודם**:
```javascript
// בדיקה כל דקה - מנתק אוטומטית כשהטוכן פג
const expiryCheck = setInterval(() => {
  if (isTokenExpired(tokenValidation.expiresAt)) {
    setAuthState({ isAuthenticated: false, error: 'הטוכן פג תוקף' });
  }
}, 60000);
```

**עכשיו**:
```javascript
// המשתמש נשאר מחובר עד לסגירת הדף - אין ניתוק אוטומטי!
console.log('✅ משתמש יישאר מחובר עד לסגירת הדף');
```

## 🎯 מה זה אומר?

### בדיקת אימות ראשונית (עדיין קיימת ✅)
כשהמשתמש נכנס לראשונה:
1. ✅ בודק שרץ ב-iframe מ-`https://portal.tak.co.il`
2. ✅ בודק שיש טוכן ב-URL
3. ✅ בודק שהטוכן **תקין ולא פג תוקף**

אם אחד מאלה נכשל → מסך שגיאה אדום ❌

### לאחר התחברות מוצלחת (החידוש 🆕)
- ✅ המשתמש נשאר מחובר **כל עוד הדף פתוח**
- ✅ **אין** ניתוק אוטומטי אחרי שהטוכן פג
- ✅ כל הבקשות לשרת כוללות את ה-`Authorization: Bearer {token}`

## 📋 מה צריך לעשות עכשיו?

### 1. בנה את האפליקציה מחדש
```bash
npm run build
```

### 2. פרוס לדוקר
העלי את ה-`dist/` folder לדוקר.

### 3. בדקי שזה עובד
1. פתחי את הקונסול (F12)
2. גשי דרך הפורטל עם iframe
3. בדקי בקונסול:
   ```
   ✅ Parent origin מאושר
   ✅ אימות טוכן עבר בהצלחה
   👤 משתמש: 1203
   🏢 חברה: 62
   ✅ משתמש יישאר מחובר עד לסגירת הדף
   ```
4. בדקי ב-**Network** tab שהבקשות מצליחות (200 OK במקום 403)
5. **חשוב**: בדקי שיש `Authorization: Bearer ...` בכל בקשה!

### 4. וודאי שהשרת מקבל את הטוכן
אם עדיין מקבלת 403, זה יכול להיות:
- ❓ השרת לא מכיר את הטוכן (בעיית חתימה/signature)
- ❓ השרת דורש פורמט אחר של header
- ❓ בעיית CORS

בדקי עם מפתח הצד-שרת איך השרת מצפה לקבל את הטוכן.

## 🔍 איך לוודא שה-Authorization Header נשלח?

### בדף האפליקציה (F12 → Network):
1. רענן את הדף
2. לחץ על אחת הבקשות (למשל `/getAllTypeConnect`)
3. לחץ על **Headers** tab
4. גלול ל-**Request Headers**
5. **חפש**: `Authorization: Bearer eyJpc3MiOiJw...`

**אם זה שם** → הקוד עובד נכון! ✅
**אם זה לא שם** → יש בעיה בקוד, עדכן אותי! ❌

## 📚 קבצים ששונו

1. **src/services/apiConnectionsService.js**
   - הוספנו `getAuthHeaders()` function
   - עדכנו 12 fetch calls להשתמש בפונקציה

2. **src/contexts/AuthContext.jsx**
   - הסרנו את ה-`setInterval` שבדק תפוגה כל דקה
   - עכשיו המשתמש נשאר מחובר עד סגירת הדף

## 💡 טיפים

- **בפיתוח**: אם רוצה לדלג על בדיקות אבטחה, השתמשי ב-`VITE_SKIP_SECURITY_CHECK=true`
- **בייצור**: **לעולם** אל תשתמשי ב-skip security check!
- **דיבאג**: עקבי אחרי הלוגים בקונסול - הם מראים בדיוק מה קורה

---

**צריכה עזרה?** תראי לי את ה-Network tab עם ה-Request Headers ואני אוכל לעזור יותר! 🚀
