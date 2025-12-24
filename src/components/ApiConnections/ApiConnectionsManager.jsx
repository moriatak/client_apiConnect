import React, { useEffect, useState } from 'react';
import styles from './ApiConnectionsManager.module.css';
import ConnectionWizard from './ConnectionWizard/ConnectionWizard';
import ConnectionsTable from './ConnectionsTable/ConnectionsTable';
import ConnectionFilters from './ConnectionFilters/ConnectionFilters';
import { useApiConnections } from '../../contexts/ApiConnectionsContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import ConnectionFormModal from './modals/ConnectionFormModal';
import { apiConnectionsService } from '../../services/apiConnectionsService'; // ✅

const ApiConnectionsManager = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [connectionTypes, setConnectionTypes] = useState([]); // ✅ הוסף את זה
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [connectionTokens, setConnectionTokens] = useState(null);
  const [submitting, setSubmitting] = useState(false); // ✅ הוספת state לחוסר ההגדרה

  const {
    filteredConnections,
    loading,
    error,
    loadConnections
  } = useApiConnections();
  const { showSuccess, showError } = useNotification();
  useEffect(() => {
    loadConnectionTypes();
  }, []);

  const loadConnectionTypes = async () => {
    try {
      setLoadingTypes(true);
      const result = await apiConnectionsService.getConnectionTypes();

      if (result.success && Array.isArray(result.data)) {
        console.log('Connection types loaded:', result.data);

        setConnectionTypes(result.data);
      }
    } catch (error) {
      console.error('Error loading connection types:', error);
    } finally {
      setLoadingTypes(false);
    }
  };
  const handleWizardSuccess = (data) => {
    showSuccess(`החיבור "${data.name}" נוצר בהצלחה!`);
    setShowWizard(false);
  };

  const handleWizardError = (message) => {
    showError(message || 'שגיאה ביצירת חיבור');
  };
 const handleSaveConnection = async (formData) => {
  try {
    setSubmitting(true);

    // ✅ אם יש editingConnection => עריכה (update)
    if (editingConnection?.id) {
      const result = await apiConnectionsService.updateConnection(editingConnection.id, {
        connectionName: formData.connectionName,
        connectionDescription: formData.connectionDescription,
        connectionStatus: formData.connectionStatus,
        paymentMethods: formData.paymentMethods,
        paymentButtonTexts: formData.paymentButtonTexts,
        campaignType: formData.campaignType,
        settings: formData.settings,
        emailSubject: formData.emailSubject,
        thankYouEmail: formData.thankYouEmail,
        items: formData.items
      });

      if (result.success) {
        showSuccess('החיבור עודכן בהצלחה!', 'success');
        await loadConnections();
        setShowFormModal(false);
        setEditingConnection(null);
        return { success: true, data: result.data };
      } else {
        showError(result.message || 'שגיאה בעדכון החיבור', 'error');
        return { success: false, message: result.message };
      }
    }

    // ✅ אחרת => יצירה (create)
    const result = await apiConnectionsService.createConnection(formData);

    if (result.success) {
      showSuccess('החיבור נוצר בהצלחה!', 'success');
console.log('Connection created successfully:', result.data);

      // הצג Tokens רק ביצירה
      if (result.data) {
        setConnectionTokens({
          // token: result.data.token?.trim(),
          apiToken: result.data.ApiToken,
          connectionName: formData.connectionName
        });
        setShowTokenModal(true);
      }

      await loadConnections();
      setShowFormModal(false);
      return { success: true, data: result.data };
    } else {
      showError(result.message || 'שגיאה ביצירת החיבור', 'error');
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Error saving connection:', error);
    showError('שגיאה: ' + error.message, 'error');
    return { success: false, message: error.message };
  } finally {
    setSubmitting(false);
  }
};


const handleEditConnection = async (connection) => {
  try {
    setSubmitting(true);
    
    console.log('📥 handleEditConnection - raw connection:', connection); // DEBUG
    
    // ✅ Fetch full connection data with all nested info
    const result = await apiConnectionsService.getConnectionDetails(connection.id);
    
    console.log('📤 getConnectionDetails result:', result); // DEBUG
    
    if (result.success) {
      console.log('✅ Setting editingConnection to:', result.data); // DEBUG
      
      setEditingConnection(result.data); // ✅ זה חייב להיות result.data, לא connection!
      setShowFormModal(true);
      showSuccess('טוען פרטי קמפיין בהצלחה...');
    } else {
      showError(result.message || 'שגיאה בטעינת פרטי הקמפיין');
    }
  } catch (error) {
    console.error('Error loading connection:', error);
    showError('שגיאה: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>חיבורים למערכת הAPI</h1>
        <p className={styles.subtitle}>
          ניהול כל החיבורים החיצוניים (טיקצאק, צרידי, וורדפרס, תרומות ועוד)
        </p>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadConnections}
        />
      )}
      <button
        className={styles.btnPrimary}
        onClick={() => {
          setEditingConnection(null); // ✅ null = מצב חדש
          setShowFormModal(true);
        }}
      >
        <i className="fa fa-plus"></i> חיבור חדש
      </button>
      <ConnectionFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveConnection}
        onSuccess={(result) => { // ✅ הוסף
          // הצג Tokens Modal
          if (result.data) {
            setConnectionTokens({
              token: result.data.Token?.trim(),
              apiToken: result.data.ApiToken,
              connectionName: result.data.Name || formData.connectionName,
              campaignId: result.data.C_id
            });
            setShowTokenModal(true);
          }
        }}
        connection={editingConnection}
        connectionTypes={connectionTypes}
      />
      {/* {!showWizard && (
        <button 
          className={styles.addButton}
          onClick={() => setShowWizard(true)}
          disabled={loading}
        >
          <i className="fa fa-plus"></i> הוסף חיבור חדש
        </button>
      )} */}

      {showWizard && (
        <ConnectionWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleWizardSuccess}
          onError={handleWizardError}
        />
      )}

      {!showWizard && (
        <>
          <ConnectionFilters />

          {loading ? (
            <LoadingSpinner message="טוען חיבורים..." />
          ) : (
            <ConnectionsTable connections={filteredConnections}
              onEdit={handleEditConnection}
            />
          )}
        </>
      )}
      {/* Token Modal */}
      {/* {showTokenModal && connectionTokens && (
        <TokenModal
          connection={connectionTokens}
          onClose={() => {
            setShowTokenModal(false);
            setConnectionTokens(null);
          }}
        />
      )} */}
      {/* Documentation Section */}
      <div className={styles.documentation}>
        <h3>תיעוד ומדריך</h3>
        <div className={styles.docGrid}>
          <DocumentationCard
            icon="fa-book"
            title="מדריך כללי"
            description="איך לחבר את הAPI לאתר חיצוני"
            link="/docs/general_api_guide.pdf"
          />
          <DocumentationCard
            icon="fa-wordpress"
            title="WordPress"
            description="חיבור וורדפרס לAPI תקציבית"
            link="/docs/wordpress_api_guide.pdf"
          />
          <DocumentationCard
            icon="fa-file-text"
            title="טיקצאק"
            description="חיבור טיקצאק לAPI תקציבית"
            link="/docs/tiktzak_api_guide.pdf"
          />
          <DocumentationCard
            icon="fa-bullhorn"
            title="צרידי"
            description="חיבור צרידי לAPI תקציבית"
            link="/docs/zridi_api_guide.pdf"
          />
        </div>
      </div>
    </div>
  );
};

const DocumentationCard = ({ icon, title, description, link }) => (
  <div className={styles.docCard}>
    <i className={`fa ${icon} ${styles.docIcon}`}></i>
    <h4>{title}</h4>
    <p>{description}</p>
    <a href={link} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
      פתח מדריך
    </a>
  </div>
);

export default ApiConnectionsManager;
