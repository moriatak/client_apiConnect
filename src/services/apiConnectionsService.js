import { mockApiConnectionsService } from './mockApiConnectionsService';
import { auth } from '../utils/auth';

// ✅ הגדרות בסיס
const USE_MOCK = false; // שנה ל-true אם רוצה לעבוד עם Mock
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qa.tak.co.il/campaignServer/connetToApi';

// פונקציה לקבלת idCompany מה-session/cookies
const getCompanyId = () => {
  // אם יש לך דרך לקבל את ה-idCompany, שים כאן
  // לדוגמה מ-localStorage או cookies
  return auth.getCompanyId() || '62'; // ברירת מחדל זמנית

};

function mapPaymentOptionToMethod(paymentOption) {
  const mapping = {
    1: 'credit_card',      // כרטיס אשראי
    11: 'bit',         // ביט
    15: 'gama_bit',
    13: 'paybox',     // Paybox
    14: 'open_finance',        // העברה בנקאית
    5: 'recurring_payment', // הוראת קבע
    8: 'recurring_payment_immediate', // הוראת קבע עם חיוב מידי
    16: 'recurring_payment_bank', // הוראת קבע בנקאית

    23: 'credit_card_touch',     // סליקה ישירה
    22: 'cash' //מזומן
  };

  return mapping[paymentOption] || null;
}
// מיפוי מהממשק ל-PaymentOption של השרת
function mapMethodToPaymentOption(method) {
  const mapping = {
    'credit_card': 1,
    'bit': 11,
    'gama_bit': 15,
    'paybox': 13,
    'open_finance': 14,
    'recurring_payment': 5,
    'recurring_payment_immediate': 8,
    'recurring_payment_bank': 16,
    'credit_card_touch': 23,
    'cash': 22
  };

  return mapping[method] || null;
}
// Real API Service
const realApiService = {
  // בדיקת תקינות השרת
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }
  },

  // קבלת סוגי חיבורים זמינים
  async getConnectionTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/getAllTypeConnect`);
      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      }

      return { success: false, message: 'Failed to fetch connection types' };
    } catch (error) {
      console.error('Error fetching connection types:', error);
      return { success: false, message: error.message };
    }
  },

  // קבלת אמצעי תשלום זמינים
  async getAvailablePaymentMethods(cId = null) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/getPaymentOptions/${companyId}`;

      const options = {
        method: 'POST', // שנה ל-POST
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // אם יש cId, שלח בגוף הבקשה
      if (cId) {
        options.body = JSON.stringify({ cId });
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // המרה לפורמט הממשק
        const methods = result.data
          .filter(pm => pm.enabled)
          .map(pm => mapPaymentOptionToMethod(pm.paymentOption));

        return {
          success: true,
          availableMethods: result.data.map(pm => pm.type || pm.id),
          rawData: result.data // שמירת הנתונים המלאים
        };
      }

      return { success: false, message: 'Failed to fetch payment methods', availableMethods: [] };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return { success: false, message: error.message, availableMethods: [] };
    }
  },
  // יצירת חיבור חדש
  async createConnection(connectionData) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/createConnect/${companyId}`;

      // בניית הבקשה לפי הפורמט של השרת
      const requestBody = buildCreateConnectionRequest(connectionData);
    console.log('📤 Creating connection:', requestBody); // ✅ DEBUG

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
    console.log('📥 Server response:', result); // ✅ DEBUG

      if (result.success) {
        return {
          success: true,
          message: result.message || 'החיבור נוצר בהצלחה',
          data: {
            id: result.data.C_id,
            campaignId: result.data.C_id,
            token: result.data.Token,
            apiToken: result.data.ApiToken,
            name: connectionData.connectionName
          }
        };
      }

      return { success: false, message: result.message || 'שגיאה ביצירת החיבור' };
    } catch (error) {
      console.error('Error creating connection:', error);
      return { success: false, message: error.message };
    }
  },

  // קבלת כל החיבורים
  // קבלת כל החיבורים
  async getConnections() {
    try {
      const companyId = getCompanyId();

      // קבלת סוגי חיבורים תחילה
      const typesResult = await this.getConnectionTypes();
      const connectionTypes = typesResult.success ? typesResult.data : [];

      const url = `${API_BASE_URL}/get_connections/${companyId}`;
  //    const response = await fetch(url);
  //     const result = await response.json();

  //     if (result.success && Array.isArray(result.data)) {
  //       // ✅ שימוש ב־mapConnectionFromServer כדי לקבל את כל הנתונים
  //       const connections = await Promise.all(
  //         result.data.map(async (conn) => {
  //           return await mapConnectionFromServer(conn, companyId, connectionTypes);
  //         })
  //       );

  //       console.log('📥 Loaded connections:', connections); // DEBUG
  //       return {
  //         success: true,
  //         connections: connections
  //       };
  //     }

  //     return { success: false, message: 'Failed to fetch connections', connections: [] };
  //   } catch (error) {
  //     console.error('Error fetching connections:', error);
  //     return { success: false, message: error.message, connections: [] };
  //   }
  // },
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // המרה לפורמט שהממשק מצפה לו

        const connections = result.data.map(conn => {
          const connectionType = connectionTypes.find(t => t.IdConnectType === conn.IdConnectType);

          return {
            id: conn.C_id,
            campaignId: conn.C_id,
            connectionType: conn.IdConnectType,
            connectionTypeName: connectionType?.Name || conn.Name,
            connectionTypeDescription: connectionType?.Description || '',
            name: conn.Title || conn.Name,
            description: conn.Description || '',
            status: conn.Active ? 'active' : 'inactive',
            paymentMethods: mapPayOptionsToMethods(conn.PayOptions || 0),
            token: conn.Token?.trim() || '',
            apiToken: conn.ApiToken || '',
            qaId: conn.Token?.trim() || '',
            lastUsed: conn.UpdateDate || null,
            createdAt: conn.CreateDate || null,
            updatedAt: conn.UpdateDate || null,
            webhook: conn.webhook,

            // פרטים מלאים
            fullData: conn
          };
        });

        return {
          success: true,
          connections: connections
        };
      }

      return { success: false, message: 'Failed to fetch connections', connections: [] };
    } catch (error) {
      console.error('Error fetching connections:', error);
      return { success: false, message: error.message, connections: [] };
    }
  },
  // In realApiService, add this new method after getConnections():

// ✅ תיקון: getConnectionDetails - אל תקרא ל-getItems ו-getPaymentOptions כי כבר יש את הנתונים!
async getConnectionDetails(connectionId) {
  try {
    const companyId = getCompanyId();
    const url = `${API_BASE_URL}/getConnect/${companyId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cId: connectionId })
    });

    const result = await response.json();

    if (result.success && result.data) {
      const connectionTypes = await this.getConnectionTypes();
      const types = connectionTypes.success ? connectionTypes.data : [];
      
      // ✅ Normalize the connection data
      const normalized = await mapConnectionFromServer(result.data, companyId, types);

      console.log('📥 Full connection details loaded:', {
        ...normalized,
        items: result.data.items || [],
        paymentMethodsDetails: result.data.paymentMethodsDetails || []
      });

      // ✅ בחזרה מ-getConnect כבר יש את כל הנתונים!
      return {
        success: true,
        data: {
          ...normalized,
          // ✅ תן קדימות לנתונים מהשרת (הם חזרו ב-200)
          items: result.data.items || [],
          paymentMethods: result.data.paymentMethods || normalized.paymentMethods,
          paymentMethodsDetails: result.data.paymentMethodsDetails || [],
          emailSubject: result.data.emailSubject || '',
          paymentButtonTexts: result.data.paymentButtonTexts || {},
          email: result.data.email,
          emailName: result.data.emailName,
          sendEmail: result.data.sendEmail,
          maxNumPay: result.data.maxNumPay,
          specialOptions: result.data.specialOptions || [],
          rules: result.data.rules,
          rulesTitle: result.data.rulesTitle,
          rulesShow: result.data.rulesShow,
          discount: result.data.discount || {}
        }
      };
    }

    return { success: false, message: 'Failed to fetch connection details' };
  } catch (error) {
    console.error('Error fetching connection details:', error);
    return { success: false, message: error.message };
  }
},
  // עדכון חיבור
  async updateConnection(connectionId, updates) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/updateConnect/${companyId}`;

      const requestBody = {
        cId: connectionId,
        ...buildUpdateConnectionRequest(updates)
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: result.message || 'החיבור עודכן בהצלחה'
        };
      }

      return { success: false, message: result.message || 'שגיאה בעדכון החיבור' };
    } catch (error) {
      console.error('Error updating connection:', error);
      return { success: false, message: error.message };
    }
  },

  // מחיקת חיבור
  async deleteConnection(connectionId) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/deleteConnect/${companyId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cId: connectionId })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: result.message || 'החיבור נמחק בהצלחה'
        };
      }

      return { success: false, message: result.message || 'שגיאה במחיקת החיבור' };
    } catch (error) {
      console.error('Error deleting connection:', error);
      return { success: false, message: error.message };
    }
  },

  // בדיקת חיבור
  async testConnection(connectionId) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/testConnect/${companyId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cId: connectionId })
      });

      const result = await response.json();

      return {
        success: result.success,
        message: result.message || (result.success ? 'החיבור תקין' : 'החיבור נכשל'),
        details: result.details
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return { success: false, message: error.message };
    }
  },

  // חידוש API Token
  async regenerateApiToken(connectionId) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/regenerateApiToken/${companyId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cId: connectionId })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          apiToken: result.apiToken,
          message: result.message || 'API Token חודש בהצלחה'
        };
      }

      return { success: false, message: result.message || 'שגיאה בחידוש Token' };
    } catch (error) {
      console.error('Error regenerating token:', error);
      return { success: false, message: error.message };
    }
  },

  // קבלת פריטים של קמפיין
  async getItems(connectionId) {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/getItems/${companyId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cId: connectionId })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          items: result.data.map(item => ({
            id: item.Lst_Id,
            name: item.name,
            description: item.description,
            price: item.price,
            sku: item.itemId,
            quantity: item.inventory,
            type: item.Type,
            isForContact: item.IsForContact,
            iconLink: item.iconLink,
            sortOrder: item.sortOrder
          }))
        };
      }

      return { success: false, message: 'Failed to fetch items' };
    } catch (error) {
      console.error('Error fetching items:', error);
      return { success: false, message: error.message };
    }
  }
};


// מיפוי PayOptions לאמצעי תשלום
function mapPayOptionsToMethods(payOptions) {
  const methods = [];

  // PayOptions הוא bit-wise
  if (payOptions & 1) methods.push('credit');      // 1 = כרטיס אשראי
  if (payOptions & 2) methods.push('bit');         // 2 = ביט
  if (payOptions & 4) methods.push('paypal');      // 4 = PayPal
  if (payOptions & 8) methods.push('bank');        // 8 = העברה בנקאית
  if (payOptions & 16) methods.push('standing_order'); // 16 = הוראת קבע
  if (payOptions & 32) methods.push('direct');     // 32 = סליקה ישירה

  return methods;
}


// מיפוי אמצעי תשלום ל-PayOptions
function mapMethodsToPayOptions(methods) {
  let payOptions = 0;

  methods.forEach(method => {
    switch (method) {
      case 'credit': payOptions |= 1; break;
      case 'bit': payOptions |= 2; break;
      case 'paypal': payOptions |= 4; break;
      case 'bank': payOptions |= 8; break;
      case 'standing_order': payOptions |= 16; break;
      case 'direct': payOptions |= 32; break;
    }
  });

  return payOptions;
}
// ❌ הסר את זה (קומנט או מחק)
// async function mapConnectionFromServer(conn, companyId, connectionTypes = []) {
//   const connectionType = connectionTypes.find(t => t.IdConnectType === conn.IdConnectType);
// }

// ✅ שמור רק על הגדרה אחת (המלאה):
async function mapConnectionFromServer(conn, companyId, connectionTypes = []) {
  console.log('🔧 mapConnectionFromServer - conn object:', conn);
  console.log('🔍 Available connectionTypes:', connectionTypes);
  
  const connId = conn.C_id || conn.Id || conn.id;
  console.log('🔍 Extracted ID:', connId, 'from conn object');
  
  // ✅ תיקון: השרת מחזיר 'connectionType', לא 'IdConnectType'
  const connTypeId = conn.IdConnectType || conn.connectionType;
  console.log('🔍 Looking for connectionType:', connTypeId); // ✅ DEBUG
  
  // ✅ בדוק איזה שדה קיים בשרת
  const connectionType = connectionTypes.find(t => {
    console.log('🔍 Comparing:', t.IdConnectType, 'vs', connTypeId);
    return t.IdConnectType === connTypeId;
  });
  
  console.log('✅ Found connectionType:', connectionType); // ✅ DEBUG
  
  // ✅ הושלמה הפונקציה בשלמותה:
  const result = {
    id: connId,
    campaignId: connId,
    connectionType: connTypeId,  // ✅ תיקון: השתמש ב-connTypeId
    // ✅ תיקון: אם לא נמצא connectionType, השתמש בערכים מה-conn עצמו
    connectionTypeName: connectionType?.Name || conn.connectionTypeName || conn.Name || conn.Title || 'Unknown',
    connectionTypeDescription: connectionType?.Description || conn.connectionTypeDescription || conn.Description || '',
    name: conn.Title || conn.Name || conn.name || '',  // ✅ הוסף conn.name
    description: conn.Description || conn.description || '',  // ✅ הוסף conn.description
    status: conn.Active ? 'active' : 'inactive',
    
    // ✅ אמצעי תשלום
    paymentMethods: mapPayOptionsToMethods(conn.PayOptions || 0),
    campaignType: conn.IsTrumot ? 'donations' : 'regular',
    
    // ✅ Tokens
    token: conn.Token?.trim() || '',
    apiToken: conn.ApiToken || '',
    qaId: conn.Token?.trim() || '',
    lastUsed: conn.UpdateDate || conn.CreateDate || null,
    createdAt: conn.CreateDate || null,
    updatedAt: conn.UpdateDate || null,

    // ✅ הגדרות
    settings: {
      webhook: conn.webhook || '',
      email: conn.Email || conn.email || '',
      emailName: conn.EmailName || conn.emailName || '',
      sendEmail: conn.SendEmail || conn.sendEmail || false,
      logo: conn.Logo || '',
      logoMobile: conn.LogoMobile || '',
      maxNumPay: conn.MaxNumPay || conn.maxNumPay || 1,
      youtubeLink: conn.youtubeLink || ''
    },

    // ✅ שדות נוספים
    specialOptions: conn.specialOptions || [],
    thankYouEmail: conn.EmailNote || conn.thankyou_page || conn.thankYouEmail || '',
    items: conn.items || [],
    
    // ✅ עוד שדות חשובים
    title: conn.Title || conn.Name || conn.title || '',
    note: conn.Note || conn.note || '',
    footer: conn.Footer || conn.footer || '',
    allowUploadFiles: conn.allowUploadFiles || false,
    allowShipping: conn.allowShipping || false,
    allowZeroSum: conn.allowZeroSum || false,
    allowCoupon: conn.AllowCoupon || conn.allowCoupon || false,
    allowCards: conn.AllowCards || conn.allowCards || false,
    rules: conn.rules || '',
    rulesTitle: conn.rulesTitle || '',
    rulesShow: conn.rulesShow || false,
    theme: conn.Theme || conn.theme || 'default',
    styleSheetUrl: conn.StyleSheetUrl || '',
    gaMeasurementId: conn.gaMeasurementId || '',
    visitCode: conn.VisitCode || '',
    conversionCode: conn.ConversionCode || '',
    ogTitle: conn.OgTitle || '',
    ogDescription: conn.OgDescription || '',
    ogImagePath: conn.OgImagePath || '',
    
    // ✅ פרטים מלאים
    fullData: conn
  };
  
  console.log('✅ mapConnectionFromServer result:', result);
  return result;
}
// async function mapConnectionFromServer(conn, companyId, connectionTypes = []) {
//   const connectionType = connectionTypes.find(t => t.IdConnectType === conn.IdConnectType);

//   return {
//     id: conn.C_id,
//     campaignId: conn.C_id,
//     connectionType: conn.IdConnectType,
//     connectionTypeName: connectionType?.Name || conn.Name,
//     connectionTypeDescription: connectionType?.Description || '',
//     name: conn.Title || conn.Name,
//     description: conn.Description || '',
//     status: conn.Active ? 'active' : 'inactive',
    
//     // ✅ אמצעי תשלום
//     paymentMethods: mapPayOptionsToMethods(conn.PayOptions || 0),
//     campaignType: conn.IsTrumot ? 'donations' : 'regular',
    
//     token: conn.Token?.trim() || '',
//     apiToken: conn.ApiToken || '',
//     qaId: conn.Token?.trim() || '',
//     lastUsed: conn.UpdateDate || conn.CreateDate || null,
//     createdAt: conn.CreateDate || null,
//     updatedAt: conn.UpdateDate || null,

//     settings: {
//       webhook: conn.webhook,
//       email: conn.Email,
//       emailName: conn.EmailName,
//       sendEmail: conn.SendEmail,
//       logo: conn.Logo,
//       logoMobile: conn.LogoMobile,
//       maxNumPay: conn.MaxNumPay,
//       youtubeLink: conn.youtubeLink
//     },

//     specialOptions: [],
//     thankYouEmail: conn.EmailNote || conn.thankyou_page || '',
//     items: [],

//     title: conn.Title,
//     note: conn.Note,
//     footer: conn.Footer,
//     allowUploadFiles: conn.allowUploadFiles,
//     allowShipping: conn.allowShipping,
//     allowZeroSum: conn.allowZeroSum,
//     allowCoupon: conn.AllowCoupon,
//     allowCards: conn.AllowCards,
//     rules: conn.rules,
//     rulesTitle: conn.rulesTitle,
//     rulesShow: conn.rulesShow,
//     theme: conn.Theme,
//     styleSheetUrl: conn.StyleSheetUrl,
//     gaMeasurementId: conn.gaMeasurementId,
//     visitCode: conn.VisitCode,
//     conversionCode: conn.ConversionCode,
//     ogTitle: conn.OgTitle,
//     ogDescription: conn.OgDescription,
//     ogImagePath: conn.OgImagePath
//   };
// }

// ✅ אל תחזור על ההגדרה עוד פעם!
// בניית בקשת יצירת חיבור
function buildCreateConnectionRequest(data) {

  const request = {
    connectionName: data.connectionName,
    connectionType: data.connectionType, // מספר IdConnectType
    connectionDescription: data.connectionDescription,
    connectionStatus: data.connectionStatus || 'active'
  };

  // הגדרות בסיסיות
  if (data.settings) {
    request.settings = data.settings;
  }

  // פרטי קמפיין
  if (data.thankYouEmail || data.Title || data.Note) {
    request.campaignDetails = {
      title: data.Title || data.connectionName,
      note: data.Note || '',
      footer: data.Footer || '',
      description: data.connectionDescription || '',
      email: data.Email || '',
      emailName: data.EmailName || '',
      sendEmail: data.SendEmail !== false,
      logo: data.Logo || '',
      logoMobile: data.LogoMobile || '',
      fullWidthLogo: data.FullWidthLogo || false,
      maxNumPay: data.MaxNumPay || 12,
      youtubeLink: data.youtubeLink || null,
      webhook: data.webhook || ''
    };
  }

  // אמצעי תשלום
  if (data.paymentMethods && data.paymentMethods.length > 0) {
    request.paymentMethods = data.paymentMethods
    // .map(method => mapMethodToPaymentOption(method))
    // .filter(Boolean);
    if (request.paymentButtonTexts && Object.keys(request.paymentButtonTexts).length > 0) {
      request.customPaymentButtons = Object.entries(request.paymentButtonTexts).map(([method, texts]) => ({
        paymentMethod: method,
        title: texts.title || '',
        description: texts.description || ''
      }));
    }
  }

  // פריטים
  if (data.items && data.items.length > 0) {
    request.items = data.items.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      sku: item.sku,
      quantity: item.quantity,
      type: item.type || 1,
      isForContact: item.isForContact || false,
      iconLink: item.iconLink || null,
      sortOrder: item.sortOrder || 0
    }));
  }

  // הגדרות תשלום
  if (data.campaignType || data.specialOptions) {
    request.paymentSettings = {
      isDonations: data.campaignType === 'donations',
      allowZeroSum: data.specialOptions?.includes('invoice_no_payment') || false
    };
  }

 // ✅ תבנית אימייל - רק אם יש תוכן אמיתי
// ✅ תבנית אימייל - רק אם יש תוכן אמיתי
const hasEmailContent = data.email || data.emailName || data.emailSubject || data.thankYouEmail;

console.log('🔍 Email fields received:', {
  email: data.email,
  emailName: data.emailName,
  emailSubject: data.emailSubject,
  thankYouEmail: data.thankYouEmail
});

console.log('🔍 hasEmailContent:', hasEmailContent);

if (hasEmailContent) {
  request.emailTemplates = {};
  
  // ✅ הוסף רק שדות שיש להם ערך - תיקון הבדיקה
  if (data.email && data.email.trim()) {
    request.emailTemplates.email = data.email.trim();
  }
  if (data.emailName && data.emailName.trim()) {
    request.emailTemplates.emailName = data.emailName.trim();
  }
  if (data.emailSubject && data.emailSubject.trim()) {
    request.emailTemplates.paySuccessMailTitle = data.emailSubject.trim();
  }
  if (data.thankYouEmail && data.thankYouEmail.trim()) {
    request.emailTemplates.emailNote = data.thankYouEmail.trim();
  }
  
  // sendEmail - רק אם יש מייל
  if (data.email && data.email.trim()) {
    request.emailTemplates.sendEmail = data.sendEmail !== false;
  }
  
  console.log('✅ emailTemplates created:', request.emailTemplates);
}


  // הגדרות תצוגה
  request.display = {
    showContacts: true,
    showContactsBelow: false,
    contactsTitle: 'פרטי קשר',
    theme: 'default',
    pageLTR: false
  };

  // הגדרות דף
  request.pageConfig = {
    pageType: null,
    pageVersion: 3,
    isTemplate: false
  };

  // לוקליזציה
  request.localization = {
    languageId: 1,
    currencyId: 1
  };

  return request;
}

// בניית בקשת עדכון חיבור
function buildUpdateConnectionRequest(updates) {
  const request = {};

  // ✅ התאמה לשמות שבאים מהטופס
    if (updates.connectionType) request.connectionType = updates.connectionType;
  if (updates.connectionTypeName) request.connectionTypeName = updates.connectionTypeName;
  if (updates.connectionName) request.connectionName = updates.connectionName;
  if (updates.connectionDescription) request.connectionDescription = updates.connectionDescription;
  if (updates.connectionStatus) request.connectionStatus = updates.connectionStatus;

  // (אופציונלי) עדכון פרטי קמפיין
  if (updates.connectionName || updates.connectionDescription) {
    request.campaignDetails = {};
    if (updates.connectionName) request.campaignDetails.title = updates.connectionName;
    if (updates.connectionDescription) request.campaignDetails.description = updates.connectionDescription;
  }

  // ✅ אם השרת תומך בעדכון אמצעי תשלום/פריטים/מייל וכו' — הוסף כאן לפי ה-API שלך
  // לדוגמה:
  if (Array.isArray(updates.paymentMethods)) request.paymentMethods = updates.paymentMethods;
  if (updates.paymentButtonTexts) request.customPaymentButtons = Object.entries(updates.paymentButtonTexts).map(([method, texts]) => ({
    paymentMethod: method,
    title: texts.title || '',
    description: texts.description || ''
  }));
  if (Array.isArray(updates.items)) request.items = updates.items;

// ✅ תבנית אימייל - רק אם יש תוכן אמיתי
const hasEmailContent = updates.email || updates.emailName || updates.emailSubject || updates.thankYouEmail;

console.log('🔍 Email fields received:', {
  email: updates.email,
  emailName: updates.emailName,
  emailSubject: updates.emailSubject,
  thankYouEmail: updates.thankYouEmail
});

console.log('🔍 hasEmailContent:', hasEmailContent);

if (hasEmailContent) {
  request.emailTemplates = {};
  
  // ✅ הוסף רק שדות שיש להם ערך - תיקון הבדיקה
  if (updates.email && updates.email.trim()) {
    request.emailTemplates.email = updates.email.trim();
  }
  if (updates.emailName && updates.emailName.trim()) {
    request.emailTemplates.emailName = updates.emailName.trim();
  }
  if (updates.emailSubject && updates.emailSubject.trim()) {
    request.emailTemplates.paySuccessMailTitle = updates.emailSubject.trim();
  }
  if (updates.thankYouEmail && updates.thankYouEmail.trim()) {
    request.emailTemplates.emailNote = updates.thankYouEmail.trim();
  }
  
  // sendEmail - רק אם יש מייל
  if (updates.email && updates.email.trim()) {
    request.emailTemplates.sendEmail = updates.sendEmail !== false;
  }
  
  console.log('✅ emailTemplates created:', request.emailTemplates);
}


  return request;
}


// מיפוי IdConnectType לערך טקסטואלי
function mapConnectionTypeIdToValue(idConnectType) {
  const mapping = {
    1: 'wordpress',
    2: 'salesforce',
    3: 'tiktzak',
    4: 'zridi',
    5: 'terminal',
    6: 'donations'
  };

  return mapping[idConnectType] || 'unknown';
}

// Export the appropriate service
export const apiConnectionsService = USE_MOCK ? mockApiConnectionsService : realApiService;

// Export individual methods
export const {
  healthCheck,
  getConnectionTypes,
  getAvailablePaymentMethods,
  createConnection,
  getConnections,
  updateConnection,
  deleteConnection,
  testConnection,
  regenerateApiToken,
  getItems
} = apiConnectionsService;