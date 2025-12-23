// מיפוי דינמי של סוגי חיבורים מהשרת
export const CONNECTION_TYPE_ICONS = {
  'charidy': 'fa-bullhorn',
  'wordpress': 'fa-wordpress',
  'msofon': 'fa-credit-card',
  'Trumot': 'fa-heart',
  'appMsofon': 'fa-credit-card',
  'appTrumot': 'fa-heart'
};

export const CONNECTION_TYPE_PREFIXES = {
  'charidy': 'CH',
  'wordpress': 'WP',
  'msofon': 'MS',
  'Trumot': 'TR',
  'appMsofon': 'MS',
  'appTrumot': 'TR'
};

// פונקציה לקבלת אייקון לפי שם
export const getIconForConnectionType = (name) => {
  return CONNECTION_TYPE_ICONS[name] || 'fa-plug';
};

// פונקציה לקבלת Prefix לפי שם
export const getPrefixForConnectionType = (name) => {
  return CONNECTION_TYPE_PREFIXES[name] || 'API';
};

// פונקציה לקבלת שם מתורגם
export const getTranslatedName = (name, description) => {
  return description || name;
};