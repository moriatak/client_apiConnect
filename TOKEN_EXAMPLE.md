# דוגמה ליצירת טוקן

## פורמט הטוקן

הטוקן מורכב משני חלקים מופרדים בנקודה:
```
{payload_base64url}.{signature}
```

## Payload (JSON)

```json
{
  "sub": "user123",
  "company_id": "62",
  "exp": 1735689600,
  "iss": "portal.tak.co.il",
  "aud": "tak.co.il",
  "nonce": "abc123xyz789"
}
```

### הסבר השדות

- **sub** (subject): מזהה המשתמש הייחודי
- **company_id**: מזהה החברה של המשתמש
- **exp** (expiration): תאריך תפוגה ב-Unix timestamp (שניות)
- **iss** (issuer): המנפיק - חייב להיות `"portal.tak.co.il"`
- **aud** (audience): קהל היעד - חייב להיות `"tak.co.il"`
- **nonce**: מספר אקראי למניעת replay attacks

## יצירת Payload מקודד (Base64URL)

### שלב 1: המרה ל-JSON string
```javascript
const payload = {
  sub: "user123",
  company_id: "62",
  exp: Math.floor(Date.now() / 1000) + 3600, // תפוגה בעוד שעה
  iss: "portal.tak.co.il",
  aud: "tak.co.il",
  nonce: Math.random().toString(36).substring(2)
};

const payloadString = JSON.stringify(payload);
```

### שלב 2: קידוד ב-Base64URL

```javascript
function base64UrlEncode(str) {
  // המר לUTF-8 bytes ואז ל-base64
  const base64 = btoa(unescape(encodeURIComponent(str)));

  // המר base64 ל-base64url
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const payloadEncoded = base64UrlEncode(payloadString);
```

### שלב 3: יצירת החתימה (Signature)

**הערה**: בסביבת פיתוח, אפשר להשתמש בחתימה פיקטיבית.
בייצור, החתימה צריכה להיות HMAC-SHA256 או RSA.

```javascript
// לדוגמה בלבד - לא מאובטח!
const signature = "dev_signature_12345";
```

### שלב 4: שילוב לטוקן מלא

```javascript
const token = `${payloadEncoded}.${signature}`;
console.log(token);
```

## דוגמה מלאה בNode.js

```javascript
const crypto = require('crypto');

// 1. יצירת payload
const payload = {
  sub: "user123",
  company_id: "62",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iss: "portal.tak.co.il",
  aud: "tak.co.il",
  nonce: crypto.randomBytes(16).toString('hex')
};

// 2. קידוד ב-base64url
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

// 3. יצירת חתימה HMAC-SHA256
const secret = 'your-secret-key';
const signature = crypto
  .createHmac('sha256', secret)
  .update(payloadEncoded)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

// 4. טוקן מלא
const token = `${payloadEncoded}.${signature}`;

console.log('Token:', token);
console.log('URL:', `https://your-app.com/?token=${encodeURIComponent(token)}`);
```

## דוגמה ב-Python

```python
import json
import base64
import hmac
import hashlib
import time
import secrets

# 1. יצירת payload
payload = {
    "sub": "user123",
    "company_id": "62",
    "exp": int(time.time()) + 3600,  # שעה מהיום
    "iss": "portal.tak.co.il",
    "aud": "tak.co.il",
    "nonce": secrets.token_hex(16)
}

# 2. קידוד base64url
def base64url_encode(data):
    json_str = json.dumps(data)
    encoded = base64.urlsafe_b64encode(json_str.encode())
    return encoded.decode().rstrip('=')

payload_encoded = base64url_encode(payload)

# 3. חתימה
secret = b'your-secret-key'
signature = hmac.new(
    secret,
    payload_encoded.encode(),
    hashlib.sha256
).digest()
signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')

# 4. טוכן מלא
token = f"{payload_encoded}.{signature_encoded}"

print(f"Token: {token}")
print(f"URL: https://your-app.com/?token={token}")
```

## בדיקת תוקף הטוכן

```javascript
// בדוק שהטוכן לא פג תוקף
const now = Math.floor(Date.now() / 1000);
if (payload.exp < now) {
  console.error('הטוכן פג תוקף!');
} else {
  const secondsLeft = payload.exp - now;
  console.log(`הטוכן תקף עוד ${secondsLeft} שניות`);
}
```

## דוגמת URL מלאה

```
https://your-app.com/add_connect?token=eyJzdWIiOiJ1c2VyMTIzIiwiY29tcGFueV9pZCI6IjYyIiwiZXhwIjoxNzM1Njg5NjAwLCJpc3MiOiJwb3J0YWwudGFrLmNvLmlsIiwiYXVkIjoidGFrLmNvLmlsIiwibm9uY2UiOiJhYmMxMjN4eXoifQ.dev_signature_12345
```

## פענוח טוכן (לבדיקה)

```javascript
function decodeToken(token) {
  const [payloadEncoded, signature] = token.split('.');

  // פענח base64url
  const base64 = payloadEncoded
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const jsonString = atob(base64 + padding);

  const payload = JSON.parse(jsonString);

  console.log('Payload:', payload);
  console.log('Signature:', signature);

  return { payload, signature };
}

// שימוש
const decoded = decodeToken(token);
```

## כלי אונליין לבדיקה

1. **JWT.io** - https://jwt.io (אם הטוכן בפורמט JWT)
2. **Base64 Decode** - https://www.base64decode.org

## טיפים

1. **תפוגה**: הגדר תפוגה סבירה (15-60 דקות)
2. **Nonce**: השתמש בערך אקראי חדש לכל טוכן
3. **החתימה**: בייצור, השתמש במפתח סודי חזק
4. **HTTPS**: העבר טוכנים רק דרך HTTPS
5. **אל תשמור**: אל תשמור טוכנים ב-localStorage (רק ב-memory)

---

**הערה**: דוגמאות אלו הן למטרות הדרכה בלבד. בייצור, השתמש בספריות מוכחות כמו `jsonwebtoken` (Node.js) או `PyJWT` (Python).
