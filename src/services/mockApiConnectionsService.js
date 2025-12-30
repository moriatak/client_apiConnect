// // Mock Data - נתוני דמה
// const mockConnections = [
//   {
//     id: 1,
//     connectionType: 'wordpress',
//     name: 'אתר ראשי',
//     description: 'חיבור לאתר הראשי של העמותה',
//     status: 'active',
//     paymentMethods: ['credit', 'bit', 'paypal'],
//     campaignType: 'regular',
//     token: 'wp_abc123def456ghi789',
//     qaId: 'WP-123',
//     lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // לפני יומיים
//     settings: {
//       url: 'https://example.com',
//       api_key: 'sk_test_123456',
//       client_id: 'client_123'
//     },
//     specialOptions: [],
//     thankYouEmail: '<p>תודה רבה על התרומה!</p>',
//     items: []
//   },
//   {
//     id: 2,
//     connectionType: 'tiktzak',
//     name: 'טופס הרשמה לאירוע',
//     description: 'טופס הרשמה לכנס השנתי',
//     status: 'active',
//     paymentMethods: ['credit', 'bit'],
//     campaignType: 'registration',
//     token: 'tk_xyz789abc123def456',
//     qaId: 'TK-456',
//     lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // אתמול
//     settings: {
//       form_id: 'FORM-12345',
//       password: ''
//     },
//     specialOptions: ['registration_only'],
//     thankYouEmail: '<p>נרשמת בהצלחה!</p>',
//     items: [
//       { id: 1, name: 'כרטיס VIP', sku: 'VIP-001', price: 500, quantity: 1, description: 'כרטיס VIP לכנס' }
//     ]
//   },
//   {
//     id: 3,
//     connectionType: 'zridi',
//     name: 'קמפיין תרומות חורף',
//     description: 'קמפיין גיוס תרומות לחורף 2024',
//     status: 'active',
//     paymentMethods: ['credit', 'bit', 'bank', 'standing_order'],
//     campaignType: 'donations',
//     token: 'zr_mno456pqr789stu012',
//     qaId: 'ZR-789',
//     lastUsed: new Date().toISOString(), // היום
//     settings: {
//       api_key: 'zr_key_123456',
//       user_id: 'USER-67890'
//     },
//     specialOptions: [],
//     standingOrderChargeMode: 'immediate',
//     allowBankStandingOrder: true,
//     thankYouEmail: '<p>תודה על תרומתך הנדיבה!</p>',
//     items: []
//   },
//   {
//     id: 4,
//     connectionType: 'donations',
//     name: 'אפליקציית תרומות מהירה',
//     description: 'תרומות דרך האפליקציה הייעודית',
//     status: 'inactive',
//     paymentMethods: ['credit', 'paybox'],
//     campaignType: 'donations',
//     token: 'dn_uvw345xyz678abc901',
//     qaId: 'DN-234',
//     lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // לפני שבוע
//     settings: {
//       campaign_name: 'תרומות כלליות',
//       campaign_description: 'תמיכה כללית בעמותה',
//       default_amount: 100,
//       amounts: '50, 100, 180, 360, 500'
//     },
//     specialOptions: [],
//     thankYouEmail: '<p>תודה על תרומתך!</p>',
//     items: []
//   }
// ];

// // אמצעי תשלום זמינים (מה שהחברה תומכת)
// const availablePaymentMethods = ['credit', 'bit', 'paypal', 'paybox', 'bank', 'direct'];

// // Simulate API delay
// const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// // Mock API Service
// export const mockApiConnectionsService = {
//   // קבלת אמצעי תשלום זמינים
//   async getAvailablePaymentMethods() {
//     await delay(300);
//     return {
//       success: true,
//       availableMethods: availablePaymentMethods
//     };
//   },

//   // יצירת חיבור חדש
//   async createConnection(connectionData) {
//     await delay(1000);
    
//     const newConnection = {
//       id: mockConnections.length + 1,
//       ...connectionData,
//       lastUsed: null,
//       createdAt: new Date().toISOString()
//     };

//     mockConnections.push(newConnection);

//     return {
//       success: true,
//       message: 'החיבור נוצר בהצלחה',
//       data: newConnection,
//       token: connectionData.token
//     };
//   },

//   // קבלת כל החיבורים
//   async getConnections() {
//     await delay(500);
//     return {
//       success: true,
//       connections: [...mockConnections]
//     };
//   },

//   // עדכון חיבור
//   async updateConnection(connectionId, updates) {
//     await delay(800);
    
//     const index = mockConnections.findIndex(c => c.id === connectionId);
    
//     if (index === -1) {
//       return {
//         success: false,
//         message: 'החיבור לא נמצא'
//       };
//     }

//     mockConnections[index] = {
//       ...mockConnections[index],
//       ...updates,
//       updatedAt: new Date().toISOString()
//     };

//     return {
//       success: true,
//       message: 'החיבור עודכן בהצלחה',
//       data: mockConnections[index]
//     };
//   },

//   // מחיקת חיבור
//   async deleteConnection(connectionId) {
//     await delay(600);
    
//     const index = mockConnections.findIndex(c => c.id === connectionId);
    
//     if (index === -1) {
//       return {
//         success: false,
//         message: 'החיבור לא נמצא'
//       };
//     }

//     mockConnections.splice(index, 1);

//     return {
//       success: true,
//       message: 'החיבור נמחק בהצלחה'
//     };
//   },

//   // בדיקת חיבור
//   async testConnection(connectionId) {
//     await delay(1500);
    
//     const connection = mockConnections.find(c => c.id === connectionId);
    
//     if (!connection) {
//       return {
//         success: false,
//         message: 'החיבור לא נמצא'
//       };
//     }

//     // סימולציה - 90% הצלחה
//     const isSuccess = Math.random() > 0.1;

//     if (isSuccess) {
//       return {
//         success: true,
//         message: 'החיבור תקין! כל הפרמטרים אומתו בהצלחה'
//       };
//     } else {
//       return {
//         success: false,
//         message: 'שגיאה בחיבור - אנא בדוק את ההגדרות'
//       };
//     }
//   }
// };