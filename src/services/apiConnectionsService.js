// import { mockApiConnectionsService } from './mockApiConnectionsService';
import { auth } from '../utils/auth';

// ✅ הגדרות בסיס
const USE_MOCK = false; // שנה ל-true אם רוצה לעבוד עם Mock
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qa.tak.co.il/campaignServer/connetToApi';

// פונקציה לקבלת idCompany מהטוקן
const getCompanyId = () => {
  const companyId = auth.getCompanyId();
  if (!companyId) {
    throw new Error('לא נמצא Company ID בטוכן האימות');
  }
  return companyId;
};

// פונקציה ליצירת headers עם Authorization
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
      const response = await fetch(`${API_BASE_URL}/getAllTypeConnect`, {
        headers: getAuthHeaders()
      });
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
        method: 'POST',
        headers: getAuthHeaders()
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
 // 🔍 DEBUG - מה מגיע לפונקציה
    console.log('🔍 createConnection - connectionData received:', connectionData);
    console.log('🔍 connectionData.email:', connectionData.email);
    console.log('🔍 connectionData.emailName:', connectionData.emailName);
      // בניית הבקשה לפי הפורמט של השרת
      const requestBody = buildCreateConnectionRequest(connectionData);
    console.log('📤 Creating connection:', requestBody); // ✅ DEBUG

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
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

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
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
            paymentMethods: mapPayOptionsToMethods(conn.PaymentMethodIds || conn.PaymentMethods || []),
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
      headers: getAuthHeaders(),
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
          discount: result.data.discount || {},
          recurringContractId: result.data.recurringContractId || normalized.recurringContractId,
          recurringBankContractId: result.data.recurringBankContractId || normalized.recurringBankContractId
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
    // 🔍 DEBUG - מה מגיע לפונקציה
    console.log('🔍 updateConnection - updates received:', updates);
    console.log('🔍 updates.email:', updates.email);
    console.log('🔍 updates.emailName:', updates.emailName);
      const requestBody = {
        cId: connectionId,
        ...buildUpdateConnectionRequest(updates)
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
  },

  // קבלת חוזים זמינים
  async getAllContracts() {
    try {
      const companyId = getCompanyId();
      const url = `${API_BASE_URL}/getAllContrac/${companyId}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // סנן רק חוזים פעילים
        const activeContracts = result.data.filter(contract => contract.active);

        return {
          success: true,
          contracts: activeContracts.map(contract => ({
            id: contract.id,
            takId: contract.takId,
            name: contract.name,
            active: contract.active
          }))
        };
      }

      return { success: false, message: 'Failed to fetch contracts', contracts: [] };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return { success: false, message: error.message, contracts: [] };
    }
  }
};



function mapPayOptionsToMethods(payOptions) {
  console.log('🔧 mapPayOptionsToMethods - payOptions:', payOptions, 'Type:', typeof payOptions);
  
  // ✅ Normalize to array - טיפול בstring עם פסיקים
  let ids = [];
  
  if (typeof payOptions === 'string') {
    // ✅ אם זה string עם פסיקים: "11,1" → [11, 1]
    ids = payOptions.split(',').map(id => parseInt(id.trim())).filter(Boolean);
  } else if (Array.isArray(payOptions)) {
    // ✅ אם זה כבר array: [11, 1]
    ids = payOptions.map(id => typeof id === 'string' ? parseInt(id) : id).filter(Boolean);
  } else if (typeof payOptions === 'number') {
    // ✅ אם זה מספר בודד: 1 → [1]
    ids = [payOptions];
  }
  
  console.log('🔍 Normalized IDs:', ids);
  
  if (ids.length === 0) {
    console.log('⚠️ payOptions is empty');
    return [];
  }

  const methodMapping = {
    1: 'credit_card',
    2: 'credit_card',
    5: 'recurring_payment',
    8: 'recurring_payment_immediate',
    11: 'bit',
    13: 'paybox',
    14: 'open_finance',
    15: 'gama_bit',
    16: 'recurring_payment_bank',
    22: 'cash',
    23: 'credit_card_touch'
  };
  
  const extracted = ids
    .map(id => methodMapping[id])
    .filter(Boolean);
  
  console.log('✅ Methods extracted:', extracted);
  return extracted;
}
// ✅ מיפוי אמצעי תשלום ל-PayOptions - ההפך
// ✅ מיפוי אמצעי תשלום - חזור IDs AND שמות (ללא כפילויות!)
function mapMethodsToPayOptions(methods) {
  console.log('🔧 mapMethodsToPayOptions - methods:', methods);

  if (!Array.isArray(methods)) {
    console.log('⚠️ methods is not an array');
    return { ids: [], names: [] };
  }

  // ✅ הסר כפילויות באמצעות Set
  const uniqueMethods = [...new Set(methods)];
  console.log('🔍 Unique methods after deduplication:', uniqueMethods);

  const methodToIdMapping = {
    'credit_card': 1,
    'recurring_payment': 5,
    'recurring_payment_immediate': 8,
    'bit': 11,
    'paybox': 13,
    'open_finance': 14,
    'gama_bit': 15,
    'recurring_payment_bank': 16,
    'cash': 22,
    'credit_card_touch': 23
  };

  // ✅ חלץ IDs (ללא כפילויות)
  const ids = uniqueMethods
    .map(method => methodToIdMapping[method])
    .filter(id => id !== undefined);

  console.log('✅ IDs extracted from methods:', ids);
  console.log('✅ Names (methods):', uniqueMethods);

  // ✅ חזור גם IDs וגם שמות
  return {
    ids: ids,                          // [8, 16] (ללא כפילויות)
    names: uniqueMethods,              // ['recurring_payment_immediate', 'recurring_payment_bank']
    idsString: ids.join(','),          // "8,16"
    namesString: uniqueMethods.join(',')  // "recurring_payment_immediate,recurring_payment_bank"
  };
}

async function mapConnectionFromServer(conn, companyId, connectionTypes = []) {
  console.log('🔧 mapConnectionFromServer - conn object:', conn);
  console.log('🔍 Available connectionTypes:', connectionTypes);
  
  const connId = conn.C_id || conn.Id || conn.id;
  const connTypeId = conn.IdConnectType || conn.connectionType;
  
  const connectionType = connectionTypes.find(t => t.IdConnectType === connTypeId);
  
  // ✅ השתמש ב-PaymentMethodIds או paymentMethods (לפי מה שהשרת שולח)
  console.log('🔍 Payment Methods from server:');
  console.log('  - conn.PaymentMethodIds:', conn.PaymentMethodIds);
  console.log('  - conn.paymentMethods:', conn.paymentMethods);
  console.log('  - conn.PaymentMethods:', conn.PaymentMethods);
  
  const paymentMethodIds = conn.PaymentMethodIds || conn.paymentMethods || conn.PaymentMethods || [];
  
  const result = {
    id: connId,
    campaignId: connId,
    connectionType: connTypeId,
    connectionTypeName: connectionType?.Name || conn.connectionTypeName || conn.Name || conn.Title || 'Unknown',
    connectionTypeDescription: connectionType?.Description || conn.connectionTypeDescription || conn.Description || '',
    name: conn.Title || conn.Name || conn.name || '',
    description: conn.Description || conn.description || '',
    status: conn.Active ? 'active' : 'inactive',
    
    // ✅ תיקון: השתמש ב-PaymentMethodIds
    paymentMethods: mapPayOptionsToMethods(paymentMethodIds),
    campaignType: conn.IsTrumot ? 'donations' : 'regular',
    
    token: conn.Token?.trim() || '',
    apiToken: conn.ApiToken || '',
    qaId: conn.Token?.trim() || '',
    lastUsed: conn.UpdateDate || conn.CreateDate || null,
    createdAt: conn.CreateDate || null,
    updatedAt: conn.UpdateDate || null,

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

    specialOptions: conn.specialOptions || [],
    thankYouEmail: conn.EmailNote || conn.thankyou_page || conn.thankYouEmail || '',
    items: conn.items || [],
    
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

    // ✅ חוזים להוראות קבע
    recurringContractId: conn.recurringContractId || null,
    recurringBankContractId: conn.recurringBankContractId || null,

    fullData: conn
  };

  console.log('✅ mapConnectionFromServer result:', result);
  return result;
}
// בניית בקשת יצירת חיבור
function buildCreateConnectionRequest(data) {
  console.log('🔧 buildCreateConnectionRequest - data received:', data); // ✅ DEBUG

  const request = {
    connectionName: data.connectionName,
    connectionType: data.connectionType,
    connectionDescription: data.connectionDescription,
    connectionStatus: data.connectionStatus || 'active',
     IsTrumot: data.campaignType === 'donations',  // true אם קמפיין תרומות

  };

  // הגדרות בסיסיות
  if (data.settings) {
    request.settings = data.settings;
  }

  // פרטי קמפיין
  if (data.thankYouEmail || data.Title || data.Note || data.email || data.emailName) {
    request.campaignDetails = {
      title: data.Title || data.connectionName,
      note: data.Note || '',
      footer: data.Footer || '',
      description: data.connectionDescription || '',
      email: data.email || data.Email || '',
      emailName: data.emailName || data.EmailName || '',
      sendEmail: data.sendEmail !== false,
      logo: data.Logo || '',
      logoMobile: data.LogoMobile || '',
      fullWidthLogo: data.FullWidthLogo || false,
      maxNumPay: data.MaxNumPay || 12,
      youtubeLink: data.youtubeLink || null,
      webhook: data.webhook || ''
    };
  }

 // ✅ אמצעי תשלום - שלח IDs וגם שמות!
  if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
    console.log('🔍 paymentMethods received:', data.paymentMethods);

    // ✅ חלץ גם IDs וגם שמות
    const paymentData = mapMethodsToPayOptions(data.paymentMethods);

    console.log('🔍 Mapped payment data:', paymentData);

    // ✅ שלח את שניהם!
    request.paymentMethods = paymentData.names;      // ['credit_card', 'bit', ...]
    request.PaymentMethodIds = paymentData.ids;      // [1, 11, ...]
    request.PaymentOptions = paymentData.idsString;  // "1,11,..."
    request.PaymentMethodNames = paymentData.namesString;  // "credit_card,bit,..."

    // ✅ אם יש הוראת קבע רגילה/מיידית, שלח את ה-contractId
    const hasRecurring = data.paymentMethods.some(m =>
      m === 'recurring_payment' || m === 'recurring_payment_immediate'
    );
    if (hasRecurring && data.recurringContractId) {
      request.recurringContractId = data.recurringContractId;
      console.log('🔍 Recurring contract ID:', data.recurringContractId);
    }

    // ✅ אם יש הוראת קבע בנקאית, שלח את ה-contractId שלה
    const hasBankRecurring = data.paymentMethods.includes('recurring_payment_bank');
    if (hasBankRecurring && data.recurringBankContractId) {
      request.recurringBankContractId = data.recurringBankContractId;
      console.log('🔍 Bank recurring contract ID:', data.recurringBankContractId);
    }
  }

  // כפתורים מותאמים
  if (data.paymentButtonTexts && Object.keys(data.paymentButtonTexts).length > 0) {
    request.customPaymentButtons = Object.entries(data.paymentButtonTexts).map(([method, texts]) => ({
      paymentMethod: method,
      title: texts.title || '',
      description: texts.description || ''
    }));
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

  // ✅ תבנית אימייל
  const hasEmailContent = data.email || data.emailName || data.emailSubject || data.thankYouEmail;

  if (hasEmailContent) {
    request.emailTemplates = {};

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

    if (data.email && data.email.trim()) {
      request.emailTemplates.sendEmail = data.sendEmail !== false;
    }

    console.log('✅ emailTemplates created:', request.emailTemplates);
  }

  // ✅ Webhook
  if (data.webhook !== undefined) {
    request.webhook = data.webhook;
    console.log('✅ webhook added to request:', data.webhook);
  }

  // ✅ הגדרות נוספות
  if (data.maxNumPay !== undefined) {
    request.maxNumPay = data.maxNumPay;
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

  console.log('✅ Final request body:', request); // ✅ DEBUG
  return request;
}
// בניית בקשת עדכון חיבור

// בניית בקשת עדכון חיבור
function buildUpdateConnectionRequest(updates) {
  console.log('🔧 buildUpdateConnectionRequest - updates received:', updates); // ✅ DEBUG
  
  const request = {};
  if (updates.campaignType !== undefined) {
    request.IsTrumot = updates.campaignType === 'donations';  // true אם קמפיין תרומות
    console.log('🔍 IsTrumot set to:', request.IsTrumot);
  }
  // ✅ התאמה לשמות שבאים מהטופס
  if (updates.connectionType) request.connectionType = updates.connectionType;
  if (updates.connectionTypeName) request.connectionTypeName = updates.connectionTypeName;
  if (updates.connectionName) request.connectionName = updates.connectionName;
  if (updates.connectionDescription) request.connectionDescription = updates.connectionDescription;
  if (updates.connectionStatus) request.connectionStatus = updates.connectionStatus;

  // ✅ עדכון פרטי קמפיין
  if (updates.connectionName || updates.connectionDescription || updates.email || updates.emailName) {
    request.campaignDetails = {};
    if (updates.connectionName) request.campaignDetails.title = updates.connectionName;
    if (updates.connectionDescription) request.campaignDetails.description = updates.connectionDescription;
    if (updates.email) request.campaignDetails.email = updates.email;
    if (updates.emailName) request.campaignDetails.emailName = updates.emailName;
    if (updates.email) request.campaignDetails.sendEmail = updates.sendEmail !== false;
  }

  // ✅ אמצעי תשלום - תיקון חשוב!
 if (Array.isArray(updates.paymentMethods) && updates.paymentMethods.length > 0) {
    console.log('🔍 paymentMethods received:', updates.paymentMethods);

    // ✅ חלץ גם IDs וגם שמות
    const paymentData = mapMethodsToPayOptions(updates.paymentMethods);

    console.log('🔍 Mapped payment data:', paymentData);

    // ✅ שלח את שניהם!
    request.paymentMethods = paymentData.names;      // ['credit_card', 'bit', ...]
    request.PaymentMethodIds = paymentData.ids;      // [1, 11, ...]
    request.PaymentOptions = paymentData.idsString;  // "1,11,..."
    request.PaymentMethodNames = paymentData.namesString;  // "credit_card,bit,..."

    // ✅ אם יש הוראת קבע רגילה/מיידית, שלח את ה-contractId
    const hasRecurring = updates.paymentMethods.some(m =>
      m === 'recurring_payment' || m === 'recurring_payment_immediate'
    );
    if (hasRecurring && updates.recurringContractId) {
      request.recurringContractId = updates.recurringContractId;
      console.log('🔍 Recurring contract ID:', updates.recurringContractId);
    }

    // ✅ אם יש הוראת קבע בנקאית, שלח את ה-contractId שלה
    const hasBankRecurring = updates.paymentMethods.includes('recurring_payment_bank');
    if (hasBankRecurring && updates.recurringBankContractId) {
      request.recurringBankContractId = updates.recurringBankContractId;
      console.log('🔍 Bank recurring contract ID:', updates.recurringBankContractId);
    }
  }

  // ✅ כפתורי תשלום מותאמים
  if (updates.paymentButtonTexts && Object.keys(updates.paymentButtonTexts).length > 0) {
    request.customPaymentButtons = Object.entries(updates.paymentButtonTexts).map(([method, texts]) => ({
      paymentMethod: method,
      title: texts.title || '',
      description: texts.description || ''
    }));
  }

  // ✅ פריטים
  if (Array.isArray(updates.items) && updates.items.length > 0) {
    request.items = updates.items.map(item => ({
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

  // ✅ תבנית אימייל
  const hasEmailContent = updates.email || updates.emailName || updates.emailSubject || updates.thankYouEmail;

  console.log('🔍 Email fields received:', {
    email: updates.email,
    emailName: updates.emailName,
    emailSubject: updates.emailSubject,
    thankYouEmail: updates.thankYouEmail
  });

  if (hasEmailContent) {
    request.emailTemplates = {};

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

    if (updates.email && updates.email.trim()) {
      request.emailTemplates.sendEmail = updates.sendEmail !== false;
    }

    console.log('✅ emailTemplates created:', request.emailTemplates);
  }

  // ✅ Webhook
  if (updates.webhook !== undefined) {
    request.webhook = updates.webhook;
    console.log('✅ webhook added to request:', updates.webhook);
  }

  // ✅ הגדרות נוספות
  if (updates.maxNumPay !== undefined) {
    request.maxNumPay = updates.maxNumPay;
  }

  console.log('✅ Final request body:', request); // ✅ DEBUG
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
export const apiConnectionsService =  realApiService;

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
  getItems,
  getAllContracts
} = apiConnectionsService;