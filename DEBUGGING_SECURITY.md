# איתור באגים במערכת האבטחה

## השגיאה שקיבלת

```
⚠️ לא ניתן לזהות את מקור ה-parent frame
❌ בדיקת אבטחה נכשלה: ['הגישה לאפליקציה מותרת רק דרך הפורטל המורשה']
```

זה אומר שהאפליקציה **לא מצליחה לזהות** שהיא רצה מתוך iframe של `https://portal.tak.co.il`.

## איך לזהות את הבעיה המדויקת?

### שלב 1: בדוק את הקונסול

פתחי את ה-**Developer Console** (F12) ותחפשי את השורה:

```javascript
🔍 Debug Info: { ... }
```

זה יראה לך:
- **document.referrer**: האם הוא מכיל `https://portal.tak.co.il` או ריק?
- **window.location.ancestorOrigins**: רשימת origins של parent frames
- **isInIframe**: האם זה באמת iframe?

### שלב 2: פענחי את התוצאות

#### תרחיש 1: `document.referrer` ריק
```javascript
{
  "document.referrer": "",
  "window.location.ancestorOrigins": ["https://portal.tak.co.il"],
  "isInIframe": true
}
```
**פתרון**: הקוד אמור להשתמש ב-`ancestorOrigins` אוטומטית (עדכנו את הקוד)

#### תרחיש 2: `ancestorOrigins` לא זמין (Firefox)
```javascript
{
  "document.referrer": "",
  "window.location.ancestorOrigins": "לא זמין",
  "isInIframe": true
}
```
**פתרון**: בעיה ידועה ב-Firefox - צריך לבקש מהפורטל להוסיף `Referrer-Policy: unsafe-url`

#### תרחיש 3: Origin לא תקין
```javascript
{
  "document.referrer": "https://portal.tak.co.il",
  "window.location.ancestorOrigins": ["https://wrong-portal.com"],
  "isInIframe": true
}
```
**בעיה**: ה-iframe לא מהמקור הנכון!

#### תרחיש 4: לא ב-iframe בכלל
```javascript
{
  "isInIframe": false
}
```
**בעיה**: האפליקציה נפתחת ישירות במקום בתוך iframe

### שלב 3: בדוק את ה-iframe בפורטל

בדפדפן, בדוק את הקוד של דף הפורטל (Right-click → Inspect) וחפש את ה-iframe:

```html
<iframe
  src="https://your-app-domain.com/?token=eyJ..."
  width="100%"
  height="600">
</iframe>
```

ודא ש:
1. ה-`src` מכיל את ה-token בפורמט הנכון
2. ה-iframe לא מכיל `sandbox` attribute מגביל
3. הדף מוגש מ-`https://portal.tak.co.il`

## דרכים לפתרון

### אפשרות 1: השבת בדיקות זמנית (לפיתוח)

צור קובץ `.env.local`:
```env
VITE_SKIP_SECURITY_CHECK=true
```

**⚠️ שימוש זמני בלבד!** זה עוקף את כל בדיקות האבטחה.

### אפשרות 2: הוסף Referrer Policy לפורטל

בדף הפורטל שמכיל את ה-iframe, הוסף:

```html
<meta name="referrer" content="unsafe-url">
```

או ב-header של השרת:
```
Referrer-Policy: unsafe-url
```

### אפשרות 3: השתמש ב-postMessage

במקום להסתמך על `document.referrer`, הפורטל יכול לשלוח הודעה:

**בפורטל** (`https://portal.tak.co.il`):
```javascript
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage(
  { type: 'PARENT_ORIGIN', origin: 'https://portal.tak.co.il' },
  'https://your-app-domain.com'
);
```

**באפליקציה** - אנחנו כבר מוכנים לזה! (ראה `setupParentCommunication`)

### אפשרות 4: בדוק Headers בשרת

אם האפליקציה רצה בדוקר, ודא ש:

1. **אין `X-Frame-Options`** שחוסם את ה-iframe:
```
# אל תשים את זה!
X-Frame-Options: DENY
```

2. **יש `Content-Security-Policy`** נכון:
```
Content-Security-Policy: frame-ancestors https://portal.tak.co.il
```

## בדיקה מהירה

הרצי את הפקודה הזו ב-Console של הדפדפן **בתוך ה-iframe**:

```javascript
console.log({
  'בתוך iframe?': window.self !== window.top,
  'referrer': document.referrer,
  'ancestorOrigins': window.location.ancestorOrigins ?
    Array.from(window.location.ancestorOrigins) : 'לא זמין',
  'current URL': window.location.href
});
```

העתיקי את התוצאה ושלחי לי כדי שאוכל לעזור.

## שאלות נפוצות

### ש: למה זה עבד בפיתוח ולא בדוקר?
**ת**: בפיתוח כנראה השבתת את בדיקות האבטחה או שדפדפן מקומי מתנהג אחרת.

### ש: האם אני יכולה לכבות את הבדיקה לצמיתות?
**ת**: כן, אבל זה **לא מומלץ**! בדיקת iframe + origin חשובה לאבטחה.

### ש: מה אם הפורטל לא נותן referrer?
**ת**: אפשר לעבור ל-postMessage או לבקש מצוות הפורטל לשנות את ה-Referrer-Policy.

### ש: איך אני יודעת שזה עובד?
**ת**: בקונסול תראי:
```
✅ Parent origin מאושר: https://portal.tak.co.il
✅ אימות טוכן עבר בהצלחה
```

## צור קשר לעזרה

אם אחרי כל זה זה עדיין לא עובד:
1. העתיקי את כל ה-console output (Debug Info)
2. צלמי screenshot של ה-iframe בדף הפורטל (Inspect Element)
3. בדקי אם יש errors ב-Network tab
4. שלחי את כל זה ונמשיך לחקור!
