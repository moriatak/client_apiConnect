import React from 'react';
import styles from './Steps.module.css';
import { getIconForConnectionType } from '../../../../constants/connectionTypes';
import LoadingSpinner from '../../../shared/LoadingSpinner';

const Step1ConnectionType = ({ data, updateData, connectionTypes = [], loadingTypes = false }) => {
  
  const handleTypeChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedType = connectionTypes.find(t => t.IdConnectType === selectedId);
    
    if (selectedType) {
      updateData({ 
        connectionType: selectedId,
        connectionTypeName: selectedType.Name,
        connectionTypeDescription: selectedType.Description,
        connectionTypeParentName: selectedType.ParentName,
        settings: {}
      });
    }
  };

  if (loadingTypes) {
    return (
      <div className={styles.stepContainer}>
        <LoadingSpinner message="טוען סוגי חיבורים..." />
      </div>
    );
  }

  if (connectionTypes.length === 0) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.errorBox}>
          <i className="fa fa-exclamation-triangle"></i>
          <div>
            <strong>אין סוגי חיבורים זמינים</strong>
            <p>אנא פנה למנהל המערכת</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <h4 className={styles.stepTitle}>שלב 1: בחירת סוג החיבור</h4>
      <p className={styles.stepDescription}>
        בחר את סוג החיבור שברצונך ליצור. כל סוג חיבור מיועד למערכת חיצונית שונה.
      </p>

      <div className={styles.formGroup}>
        <label htmlFor="connectionType" className={styles.label}>
          <i className="fa fa-plug"></i> סוג החיבור: <span className={styles.required}>*</span>
        </label>
        <select
          id="connectionType"
          name="connectionType"
          className={styles.select}
          value={data.connectionType || ''}
          onChange={handleTypeChange}
          required
        >
          <option value="">-- בחר סוג חיבור --</option>
          {connectionTypes.map((type) => (
            <option key={type.IdConnectType} value={type.IdConnectType}>
              {type.Description} ({type.Name})
            </option>
          ))}
        </select>
        <span className={styles.hint}>
          בחר את המערכת החיצונית שאליה ברצונך להתחבר
        </span>
      </div>

      {data.connectionType && (
        <div className={styles.previewBox}>
          <h5>
            <i className="fa fa-eye"></i> החיבור שנבחר
          </h5>
          <div className={styles.previewContent}>
            <div className={styles.selectedTypeCard}>
              <i className={`fa ${getIconForConnectionType(data.connectionTypeName)} ${styles.bigIcon}`}></i>
              <div>
                <h6>{data.connectionTypeDescription}</h6>
                <p className={styles.typeNameBadge}>
                  <strong>סוג:</strong> {data.connectionTypeName}
                </p>
                {data.connectionTypeParentName && (
                  <p className={styles.parentNameBadge}>
                    <strong>Parent:</strong> {data.connectionTypeParentName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {connectionTypes.length > 0 && (
        <div className={styles.typeDescriptions}>
          <h5>
            <i className="fa fa-info-circle"></i> סוגי החיבורים הזמינים
          </h5>
          <div className={styles.typeGrid}>
            {connectionTypes.map((type) => (
              <TypeCard
                key={type.IdConnectType}
                icon={getIconForConnectionType(type.Name)}
                title={type.Description}
                subtitle={type.Name}
                isSelected={data.connectionType === type.IdConnectType}
                onClick={() => {
                  updateData({ 
                    connectionType: type.IdConnectType,
                    connectionTypeName: type.Name,
                    connectionTypeDescription: type.Description,
                    connectionTypeParentName: type.ParentName,
                    settings: {}
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.infoBox}>
        <i className="fa fa-lightbulb-o"></i>
        <div>
          <strong>טיפ:</strong>
          <p>
            כל סוג חיבור מגיע עם הגדרות ייעודיות משלו. לאחר הבחירה תוכל להגדיר את הפרמטרים הספציפיים.
          </p>
        </div>
      </div>
    </div>
  );
};

const TypeCard = ({ icon, title, subtitle, isSelected, onClick }) => (
  <div 
    className={`${styles.typeCard} ${isSelected ? styles.selected : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    <i className={`fa ${icon} ${styles.typeIcon}`}></i>
    <h6>{title}</h6>
    <p className={styles.typeSubtitle}>{subtitle}</p>
    {isSelected && (
      <div className={styles.selectedBadge}>
        <i className="fa fa-check-circle"></i> נבחר
      </div>
    )}
  </div>
);

export default Step1ConnectionType;