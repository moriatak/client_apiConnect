import React, { useState, useEffect } from 'react';
import styles from './ConnectionFilters.module.css';
import { useApiConnections } from '../../../contexts/ApiConnectionsContext';
import { apiConnectionsService } from '../../../services/apiConnectionsService';

// ...existing code...
const ConnectionFilters = () => {
  const { filters, setFilters, connections } = useApiConnections();
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // מצב האקורדיון (ברירת מחדל: סגור)
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadConnectionTypes();
  }, []);

  const loadConnectionTypes = async () => {
    try {
      setLoadingTypes(true);
      const result = await apiConnectionsService.getConnectionTypes();
      
      if (result.success && Array.isArray(result.data)) {
        setConnectionTypes(result.data);
      }
    } catch (error) {
      console.error('Error loading connection types:', error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
  };

  const handleTypeChange = (e) => {
    setFilters({ ...filters, connectionType: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      connectionType: 'all'
    });
  };

  const hasActiveFilters = 
    filters.searchTerm !== '' || 
    filters.status !== 'all' || 
    filters.connectionType !== 'all';

  // ספירת חיבורים לפי סטטוס
  const activeCount = connections.filter(c => c.status === 'active').length;
  const inactiveCount = connections.filter(c => c.status === 'inactive').length;

  // ספירת חיבורים לפי סוג
  const getConnectionTypeCount = (typeId) => {
    return connections.filter(c => c.connectionType === typeId).length;
  };

  // סינון החיבורים המוצגים
  const getFilteredConnectionsCount = () => {
    return connections.filter(c => {
      const matchesSearch = filters.searchTerm === '' || 
        c.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.qaId?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.token?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || c.status === filters.status;
      
      const matchesType = filters.connectionType === 'all' || 
        c.connectionType === parseInt(filters.connectionType);
      
      return matchesSearch && matchesStatus && matchesType;
    }).length;
  };

  return (
    <div className={styles.filtersContainer}>
      {/* כותרת ניתנת ללחיצה כדי לפתוח/לסגור את האקורדיון */}
      <div
        className={styles.filtersHeader}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(prev => !prev); }}
        aria-expanded={isOpen}
      >
        <h3>
          <i className="fa fa-filter"></i> סינון וחיפוש
        </h3>

        {/* כפתור נקה לא יפעיל את ה-toggle */}
        {hasActiveFilters && (
          <button 
            className={styles.clearBtn}
            onClick={(e) => { e.stopPropagation(); handleClearFilters(); }}
            title="נקה סינונים"
          >
            <i className="fa fa-times"></i> נקה הכל
          </button>
        )}

        {/* אינדיקטור פתוח/סגור */}
        <div className={styles.accordionIcon} aria-hidden>
          <i className={`fa ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </div>
      </div>

      {/* התוכן של האקורדיון — יוצג רק כשהוא פתוח */}
      {isOpen && (
        <>
          <div className={styles.filtersGrid}>
            {/* חיפוש */}
            <div className={styles.filterGroup}>
              <label htmlFor="search" className={styles.filterLabel}>
                <i className="fa fa-search"></i> חיפוש
              </label>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  id="search"
                  className={styles.searchInput}
                  placeholder="חפש לפי שם, Token, QA ID..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
                {filters.searchTerm && (
                  <button
                    className={styles.clearSearchBtn}
                    onClick={() => setFilters({ ...filters, searchTerm: '' })}
                    title="נקה חיפוש"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* סינון לפי סטטוס */}
            <div className={styles.filterGroup}>
              <label htmlFor="status" className={styles.filterLabel}>
                <i className="fa fa-toggle-on"></i> סטטוס
              </label>
              <select
                id="status"
                className={styles.filterSelect}
                value={filters.status}
                onChange={handleStatusChange}
              >
                <option value="all">
                  הכל ({connections.length})
                </option>
                <option value="active">
                  פעיל ({activeCount})
                </option>
                <option value="inactive">
                  מושבת ({inactiveCount})
                </option>
              </select>
            </div>

            {/* סינון לפי סוג חיבור */}
            <div className={styles.filterGroup}>
              <label htmlFor="type" className={styles.filterLabel}>
                <i className="fa fa-plug"></i> סוג חיבור
              </label>
              <select
                id="type"
                className={styles.filterSelect}
                value={filters.connectionType}
                onChange={handleTypeChange}
                disabled={loadingTypes}
              >
                <option value="all">
                  {loadingTypes ? 'טוען...' : 'כל הסוגים'}
                </option>
                {connectionTypes.map((type) => {
                  const count = getConnectionTypeCount(type.IdConnectType);
                  return (
                    <option key={type.IdConnectType} value={type.IdConnectType}>
                      {type.Description} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* תצוגת תוצאות */}
          {hasActiveFilters && (
            <div className={styles.resultsInfo}>
              <i className="fa fa-info-circle"></i>
              <span>
                מוצגים <strong>{getFilteredConnectionsCount()}</strong> מתוך <strong>{connections.length}</strong> חיבורים
              </span>
            </div>
          )}

          {/* תצוגת פילטרים פעילים */}
          {hasActiveFilters && (
            <div className={styles.activeFilters}>
              <span className={styles.activeFiltersLabel}>
                <i className="fa fa-tag"></i> פילטרים פעילים:
              </span>
              <div className={styles.filterTags}>
                {filters.searchTerm && (
                  <span className={styles.filterTag}>
                    <i className="fa fa-search"></i> {filters.searchTerm}
                    <button 
                      onClick={() => setFilters({ ...filters, searchTerm: '' })}
                      className={styles.removeTagBtn}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className={styles.filterTag}>
                    <i className="fa fa-toggle-on"></i> {filters.status === 'active' ? 'פעיל' : 'מושבת'}
                    <button 
                      onClick={() => setFilters({ ...filters, status: 'all' })}
                      className={styles.removeTagBtn}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.connectionType !== 'all' && (
                  <span className={styles.filterTag}>
                    <i className="fa fa-plug"></i> 
                    {connectionTypes.find(t => t.IdConnectType === parseInt(filters.connectionType))?.Description || 'סוג חיבור'}
                    <button 
                      onClick={() => setFilters({ ...filters, connectionType: 'all' })}
                      className={styles.removeTagBtn}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* סטטיסטיקות מהירות */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fa fa-plug"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>סה״כ חיבורים</span>
                <span className={styles.statValue}>{connections.length}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.success}`}>
                <i className="fa fa-check-circle"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>פעילים</span>
                <span className={styles.statValue}>{activeCount}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.inactive}`}>
                <i className="fa fa-times-circle"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>מושבתים</span>
                <span className={styles.statValue}>{inactiveCount}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.info}`}>
                <i className="fa fa-list"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>סוגי חיבור</span>
                <span className={styles.statValue}>{connectionTypes.length}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectionFilters;
// ...existing code...
// import React, { useState, useEffect } from 'react';
// import styles from './ConnectionFilters.module.css';
// import { useApiConnections } from '../../../contexts/ApiConnectionsContext';
// import { apiConnectionsService } from '../../../services/apiConnectionsService';

// const ConnectionFilters = () => {
//   const { filters, setFilters, connections } = useApiConnections();
//   const [connectionTypes, setConnectionTypes] = useState([]);
//   const [loadingTypes, setLoadingTypes] = useState(true);

//   useEffect(() => {
//     loadConnectionTypes();
//   }, []);

//   const loadConnectionTypes = async () => {
//     try {
//       setLoadingTypes(true);
//       const result = await apiConnectionsService.getConnectionTypes();
      
//       if (result.success && Array.isArray(result.data)) {
//         setConnectionTypes(result.data);
//       }
//     } catch (error) {
//       console.error('Error loading connection types:', error);
//     } finally {
//       setLoadingTypes(false);
//     }
//   };

//   const handleSearchChange = (e) => {
//     setFilters({ ...filters, searchTerm: e.target.value });
//   };

//   const handleStatusChange = (e) => {
//     setFilters({ ...filters, status: e.target.value });
//   };

//   const handleTypeChange = (e) => {
//     setFilters({ ...filters, connectionType: e.target.value });
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       searchTerm: '',
//       status: 'all',
//       connectionType: 'all'
//     });
//   };

//   const hasActiveFilters = 
//     filters.searchTerm !== '' || 
//     filters.status !== 'all' || 
//     filters.connectionType !== 'all';

//   // ספירת חיבורים לפי סטטוס
//   const activeCount = connections.filter(c => c.status === 'active').length;
//   const inactiveCount = connections.filter(c => c.status === 'inactive').length;

//   // ספירת חיבורים לפי סוג
//   const getConnectionTypeCount = (typeId) => {
//     return connections.filter(c => c.connectionType === typeId).length;
//   };

//   // סינון החיבורים המוצגים
//   const getFilteredConnectionsCount = () => {
//     return connections.filter(c => {
//       const matchesSearch = filters.searchTerm === '' || 
//         c.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
//         c.qaId?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
//         c.token?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
//       const matchesStatus = filters.status === 'all' || c.status === filters.status;
      
//       const matchesType = filters.connectionType === 'all' || 
//         c.connectionType === parseInt(filters.connectionType);
      
//       return matchesSearch && matchesStatus && matchesType;
//     }).length;
//   };

//   return (
//     <div className={styles.filtersContainer}>
//       <div className={styles.filtersHeader}>
//         <h3>
//           <i className="fa fa-filter"></i> סינון וחיפוש
//         </h3>
//         {hasActiveFilters && (
//           <button 
//             className={styles.clearBtn}
//             onClick={handleClearFilters}
//             title="נקה סינונים"
//           >
//             <i className="fa fa-times"></i> נקה הכל
//           </button>
//         )}
//       </div>

//       <div className={styles.filtersGrid}>
//         {/* חיפוש */}
//         <div className={styles.filterGroup}>
//           <label htmlFor="search" className={styles.filterLabel}>
//             <i className="fa fa-search"></i> חיפוש
//           </label>
//           <div className={styles.searchWrapper}>
//             <input
//               type="text"
//               id="search"
//               className={styles.searchInput}
//               placeholder="חפש לפי שם, Token, QA ID..."
//               value={filters.searchTerm}
//               onChange={handleSearchChange}
//             />
//             {filters.searchTerm && (
//               <button
//                 className={styles.clearSearchBtn}
//                 onClick={() => setFilters({ ...filters, searchTerm: '' })}
//                 title="נקה חיפוש"
//               >
//                 <i className="fa fa-times"></i>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* סינון לפי סטטוס */}
//         <div className={styles.filterGroup}>
//           <label htmlFor="status" className={styles.filterLabel}>
//             <i className="fa fa-toggle-on"></i> סטטוס
//           </label>
//           <select
//             id="status"
//             className={styles.filterSelect}
//             value={filters.status}
//             onChange={handleStatusChange}
//           >
//             <option value="all">
//               הכל ({connections.length})
//             </option>
//             <option value="active">
//               פעיל ({activeCount})
//             </option>
//             <option value="inactive">
//               מושבת ({inactiveCount})
//             </option>
//           </select>
//         </div>

//         {/* סינון לפי סוג חיבור */}
//         <div className={styles.filterGroup}>
//           <label htmlFor="type" className={styles.filterLabel}>
//             <i className="fa fa-plug"></i> סוג חיבור
//           </label>
//           <select
//             id="type"
//             className={styles.filterSelect}
//             value={filters.connectionType}
//             onChange={handleTypeChange}
//             disabled={loadingTypes}
//           >
//             <option value="all">
//               {loadingTypes ? 'טוען...' : 'כל הסוגים'}
//             </option>
//             {connectionTypes.map((type) => {
//               const count = getConnectionTypeCount(type.IdConnectType);
//               return (
//                 <option key={type.IdConnectType} value={type.IdConnectType}>
//                   {type.Description} ({count})
//                 </option>
//               );
//             })}
//           </select>
//         </div>
//       </div>

//       {/* תצוגת תוצאות */}
//       {hasActiveFilters && (
//         <div className={styles.resultsInfo}>
//           <i className="fa fa-info-circle"></i>
//           <span>
//             מוצגים <strong>{getFilteredConnectionsCount()}</strong> מתוך <strong>{connections.length}</strong> חיבורים
//           </span>
//         </div>
//       )}

//       {/* תצוגת פילטרים פעילים */}
//       {hasActiveFilters && (
//         <div className={styles.activeFilters}>
//           <span className={styles.activeFiltersLabel}>
//             <i className="fa fa-tag"></i> פילטרים פעילים:
//           </span>
//           <div className={styles.filterTags}>
//             {filters.searchTerm && (
//               <span className={styles.filterTag}>
//                 <i className="fa fa-search"></i> {filters.searchTerm}
//                 <button 
//                   onClick={() => setFilters({ ...filters, searchTerm: '' })}
//                   className={styles.removeTagBtn}
//                 >
//                   <i className="fa fa-times"></i>
//                 </button>
//               </span>
//             )}
//             {filters.status !== 'all' && (
//               <span className={styles.filterTag}>
//                 <i className="fa fa-toggle-on"></i> {filters.status === 'active' ? 'פעיל' : 'מושבת'}
//                 <button 
//                   onClick={() => setFilters({ ...filters, status: 'all' })}
//                   className={styles.removeTagBtn}
//                 >
//                   <i className="fa fa-times"></i>
//                 </button>
//               </span>
//             )}
//             {filters.connectionType !== 'all' && (
//               <span className={styles.filterTag}>
//                 <i className="fa fa-plug"></i> 
//                 {connectionTypes.find(t => t.IdConnectType === parseInt(filters.connectionType))?.Description || 'סוג חיבור'}
//                 <button 
//                   onClick={() => setFilters({ ...filters, connectionType: 'all' })}
//                   className={styles.removeTagBtn}
//                 >
//                   <i className="fa fa-times"></i>
//                 </button>
//               </span>
//             )}
//           </div>
//         </div>
//       )}

//       {/* סטטיסטיקות מהירות */}
//       <div className={styles.quickStats}>
//         <div className={styles.statCard}>
//           <div className={styles.statIcon}>
//             <i className="fa fa-plug"></i>
//           </div>
//           <div className={styles.statContent}>
//             <span className={styles.statLabel}>סה״כ חיבורים</span>
//             <span className={styles.statValue}>{connections.length}</span>
//           </div>
//         </div>

//         <div className={styles.statCard}>
//           <div className={`${styles.statIcon} ${styles.success}`}>
//             <i className="fa fa-check-circle"></i>
//           </div>
//           <div className={styles.statContent}>
//             <span className={styles.statLabel}>פעילים</span>
//             <span className={styles.statValue}>{activeCount}</span>
//           </div>
//         </div>

//         <div className={styles.statCard}>
//           <div className={`${styles.statIcon} ${styles.inactive}`}>
//             <i className="fa fa-times-circle"></i>
//           </div>
//           <div className={styles.statContent}>
//             <span className={styles.statLabel}>מושבתים</span>
//             <span className={styles.statValue}>{inactiveCount}</span>
//           </div>
//         </div>

//         <div className={styles.statCard}>
//           <div className={`${styles.statIcon} ${styles.info}`}>
//             <i className="fa fa-list"></i>
//           </div>
//           <div className={styles.statContent}>
//             <span className={styles.statLabel}>סוגי חיבור</span>
//             <span className={styles.statValue}>{connectionTypes.length}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConnectionFilters;