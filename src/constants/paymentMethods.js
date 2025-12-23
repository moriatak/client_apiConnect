export const PAYMENT_METHODS = {
  CREDIT_CARD: {
    value: 'credit_card',
    label: 'כרטיס אשראי',
    icon: 'fa-credit-card',
    paymentOption: 1
  },
  BIT: {
    value: 'bit',
    label: 'ביט',
    icon: 'fa-mobile',
    paymentOption: 11
  },
  GAMA_BIT: {
    value: 'gama_bit',
    label: 'גמא ביט',
    icon: 'fa-mobile-phone',
    paymentOption: 15
  },
  PAYBOX: {
    value: 'paybox',
    label: 'Paybox',
    icon: 'fa-credit-card-alt',
    paymentOption: 13
  },
  OPEN_FINANCE: {
    value: 'open_finance',
    label: 'פתיחות פיננסית',
    icon: 'fa-bank',
    paymentOption: 14
  },
  RECURRING_PAYMENT: {
    value: 'recurring_payment',
    label: 'הוראת קבע',
    icon: 'fa-repeat',
    paymentOption: 5
  },
  RECURRING_PAYMENT_IMMEDIATE: {
    value: 'recurring_payment_immediate',
    label: 'הוראת קבע + חיוב מידי',
    icon: 'fa-bolt',
    paymentOption: 8
  },
  RECURRING_PAYMENT_BANK: {
    value: 'recurring_payment_bank',
    label: 'הוראת קבע בנקאית',
    icon: 'fa-university',
    paymentOption: 16
  },
  CREDIT_CARD_TOUCH: {
    value: 'credit_card_touch',
    label: 'סליקה ישירה (Touch)',
    icon: 'fa-hand-pointer-o',
    paymentOption: 23
  },
  CASH: {
    value: 'cash',
    label: 'מזומן',
    icon: 'fa-money',
    paymentOption: 22
  }
};

// פונקציה לקבלת שם מתורגם
export const getPaymentMethodLabel = (value) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === value);
  return method?.label || value;
};

// פונקציה לקבלת אייקון
export const getPaymentMethodIcon = (value) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === value);
  return method?.icon || 'fa-money';
};