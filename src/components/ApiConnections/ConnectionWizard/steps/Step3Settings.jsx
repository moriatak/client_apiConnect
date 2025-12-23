import React, { useEffect } from 'react';
import styles from './Steps.module.css';
import WordPressSettings from './settingsTypes/WordPressSettings';
import TiktzakSettings from './settingsTypes/TiktzakSettings';
import ZridiSettings from './settingsTypes/ZridiSettings';
import TerminalSettings from './settingsTypes/TerminalSettings';
import DonationsSettings from './settingsTypes/DonationsSettings';

const Step3Settings = ({ data, updateData, connectionTypes = [] }) => {
  // מילוי ברירות מחדל כשבוחרים סוג חיבור
useEffect(() => {
  if (data.connectionType && connectionTypes.length > 0 && !data.settingsInitialized) {
    const selectedType = connectionTypes.find(
      t => t.IdConnectType === data.connectionType
    );
    
    if (selectedType) {
      const defaultSettings = getDefaultSettings(selectedType);
      
      updateData({
        settings: {
          ...defaultSettings
        },
        settingsInitialized: true // ✅ מונע לופ
      });
    }
  }
}, [data.connectionType]); // ✅ הסר connectionTypes מה-dependencies

  const handleSettingsChange = (newSettings) => {
    updateData({
      settings: {
        ...data.settings,
        ...newSettings
      }
    });
  };

  const renderSettingsComponent = () => {
    const typeName = data.connectionTypeName?.toLowerCase();

    switch (typeName) {
      case 'wordpress':
        return (
          <WordPressSettings
            settings={data.settings || {}}
            onChange={handleSettingsChange}
          />
        );
      case 'tiktzak':
        return (
          <TiktzakSettings
            settings={data.settings || {}}
            onChange={handleSettingsChange}
          />
        );
      case 'charidy':
      case 'zridi':
        return (
          <ZridiSettings
            settings={data.settings || {}}
            onChange={handleSettingsChange}
          />
        );
      case 'msofon':
      case 'appmunition':
        return (
          <TerminalSettings
            settings={data.settings || {}}
            onChange={handleSettingsChange}
          />
        );
      case 'trumot':
      case 'apptrumot':
        return (
          <DonationsSettings
            settings={data.settings || {}}
            onChange={handleSettingsChange}
          />
        );
      default:
        return (
          <div className={styles.infoBox}>
            <i className="fa fa-info-circle"></i>
            <div>
              <strong>אין הגדרות נוספות</strong>
              <p>סוג חיבור זה אינו דורש הגדרות מיוחדות.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>
        <i className="fa fa-cog"></i>
        שלב 3: הגדרות חיבור
      </h4>
      <p className={styles.stepDescription}>
        הגדר את הפרמטרים הספציפיים לסוג החיבור שבחרת.
        ברירות מחדל מולאו אוטומטית.
      </p>

      {renderSettingsComponent()}

      {data.settings && Object.keys(data.settings).length > 1 && (
        <div className={styles.infoBox}>
          <i className="fa fa-check-circle"></i>
          <div>
            <strong>הגדרות נטענו בהצלחה</strong>
            <p>ניתן לערוך את ההגדרות בהתאם לצרכים שלך.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// פונקציה לקבלת הגדרות ברירת מחדל
const getDefaultSettings = (connectionType) => {
  const typeName = connectionType.Name?.toLowerCase();

  switch (typeName) {
    case 'wordpress':
      return {
        url: '',
        // api_key: '',
        client_id: ''
      };
    
    case 'tiktzak':
      return {
        form_id: '',
        password: ''
      };
    
    case 'charidy':
    case 'zridi':
      return {
        // api_key: '',
        user_id: ''
      };
    
    case 'msofon':
    case 'appmunition':
      return {
        terminal_id: '',
        terminal_type: 'physical',
        terminal_details: ''
      };
    
    case 'trumot':
    case 'apptrumot':
      return {
        campaign_name: connectionType.Description || 'קמפיין תרומות',
        campaign_description: '',
        default_amount: 100,
        amounts: '50, 100, 180, 360, 500'
      };
    
    default:
      return {};
  }
};

export default Step3Settings;