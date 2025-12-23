import React from 'react';
import styles from './StandingOrderSettings.module.css';
import Checkbox from './Checkbox';
import Radio from './Radio';

const StandingOrderSettings = ({ data, updateData, onPaymentMethodChange }) => {
  const isStandingOrderEnabled = data.paymentMethods?.includes('standing_order');

  const handleStandingOrderChange = (checked) => {
    onPaymentMethodChange('standing_order', checked);
  };

  const handleChargeModeChange = (mode) => {
    updateData({ standingOrderChargeMode: mode });
  };

  const handleBankStandingOrderChange = (checked) => {
    updateData({ allowBankStandingOrder: checked });
  };

  return (
    <div className={styles.standingOrderSection}>
      <h5 className={styles.sectionTitle}>
        <i className="fa fa-repeat"></i> הוראת קבע:
      </h5>

      <Checkbox
        name="paymentMethods[]"
        value="standing_order"
        label="הפעל הוראת קבע"
        checked={isStandingOrderEnabled}
        onChange={handleStandingOrderChange}
      />

      {isStandingOrderEnabled && (
        <div className={styles.standingOrderSettings}>
          <div className={styles.formGroup}>
            <label className={styles.label}>אופן חיוב:</label>
            
            <Radio
              name="standingOrderChargeMode"
              value="immediate"
              label="חיוב מיידי (חיוב ראשון + שמירת פרטים להמשך)"
              checked={data.standingOrderChargeMode === 'immediate'}
              onChange={() => handleChargeModeChange('immediate')}
            />
            
            <Radio
              name="standingOrderChargeMode"
              value="store"
              label="שמירת פרטי אשראי בלבד (ללא חיוב מיידי)"
              checked={data.standingOrderChargeMode === 'store'}
              onChange={() => handleChargeModeChange('store')}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>אפשרויות נוספות:</label>
            
            <Checkbox
              name="allowBankStandingOrder"
              value="1"
              label="אפשר רישום בהוראת קבע בנקאית"
              checked={data.allowBankStandingOrder || false}
              onChange={handleBankStandingOrderChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StandingOrderSettings;