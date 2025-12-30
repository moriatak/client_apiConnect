// ...existing code...
import React from 'react';
import styles from './ConnectionsTable.module.css';
import { useApiConnections } from '../../../contexts/ApiConnectionsContext';
import ConnectionRow from './ConnectionRow';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage';

const ConnectionsTable = ({ onEdit, onDelete, onTest, onViewToken }) => {
  const { connections, loading, error, filters, updateConnection, deleteConnection, testConnection } = useApiConnections();

  if (loading) {
    return <LoadingSpinner message="טוען חיבורים..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // handlers עם fallback אם לא הועבר prop מההורה
  const handleEdit = async (connection) => {
    if (typeof onEdit === 'function') return onEdit(connection);

   
  };

  const handleDelete = async (connection) => {
    if (typeof onDelete === 'function') return onDelete(connection);

    if (!window.confirm('למחוק חיבור זה?')) return;
    const res = await deleteConnection(connection.id);
    if (!res.success) window.alert(res.message || 'שגיאה במחיקת חיבור');
  };

  const handleTest = async (connection) => {
    if (typeof onTest === 'function') return onTest(connection);

    const res = await testConnection(connection.id);
    if (res && res.success) {
      window.alert('החיבור תקין');
    } else {
      window.alert(res?.message || 'כשלון בבדיקת חיבור');
    }
  };

  const handleViewToken = (connection) => {
    if (typeof onViewToken === 'function') return onViewToken(connection);

    window.alert(connection.apiToken || 'אין Token זמין');
  };

  // סינון החיבורים
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = filters.searchTerm === '' ||
      connection.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      connection.qaId?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      connection.token?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' ||
      connection.status === filters.status;

    const matchesType = filters.connectionType === 'all' ||
      connection.connectionType === parseInt(filters.connectionType);

    return matchesSearch && matchesStatus && matchesType;
  });

  if (filteredConnections.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <i className="fa fa-search"></i>
          <h3>לא נמצאו תוצאות</h3>
          <p>
            {filters.searchTerm || filters.status !== 'all' || filters.connectionType !== 'all'
              ? 'נסה לשנות את הפילטרים שלך'
              : 'לא נמצאו חיבורים. התחל על ידי יצירת חיבור חדש.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.connectionsTable}  dir="rtl">
          <thead>
            <tr>
              <th>סוג חיבור</th>
              <th>שם ותיאור</th>
              <th>אמצעי תשלום</th>
              {/* <th>Token</th> */}
              <th>QR & Token</th>
              <th>שימוש אחרון</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map((connection) => (
              <ConnectionRow
                key={connection.id}
                connection={connection}
                // onEdit={handleEdit}
                onEdit={() => handleEdit(connection)}

                onTest={handleTest}
                onDelete={handleDelete}
                // onViewToken={handleViewToken}
                onViewToken={() => handleViewToken(connection)}

              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <span className={styles.totalCount}>
          מוצגים {filteredConnections.length} מתוך {connections.length} חיבורים
        </span>
      </div>
    </div>
  );
};

export default ConnectionsTable;
