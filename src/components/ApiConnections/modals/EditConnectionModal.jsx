import React, { useState } from 'react';
import styles from './Modal.module.css';
import { useApiConnections } from '../../../contexts/ApiConnectionsContext';
import { useNotification } from '../../../contexts/NotificationContext';

const EditConnectionModal = ({ connection, onClose }) => {
  const [formData, setFormData] = useState({
    name: connection.name || '',
    description: connection.description || '',
    status: connection.status || 'active'
  });

  const { updateConnection } = useApiConnections();
  const { showSuccess, showError } = useNotification();
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('שם החיבור הוא שדה חובה');
      return;
    }

    setSaving(true);

    const result = await updateConnection(connection.id, formData);

    setSaving(false);

    if (result.success) {
      showSuccess('החיבור עודכן בהצלחה');
      onClose();
    } else {
      showError(result.message || 'שגיאה בעדכון החיבור');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.large}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>עריכת חיבור</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>שם החיבור: <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>תיאור:</label>
              <textarea
                className={styles.textarea}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>סטטוס:</label>
              <select
                className={styles.select}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="active">פעיל</option>
                <option value="inactive">מושבת</option>
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> שומר...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i> שמור שינויים
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConnectionModal;