import React from 'react';
import styles from './ItemsManager.module.css';

const ItemsManager = ({ items = [], onChange }) => {
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      sku: '',
      price: '',
      quantity: 1,
      description: ''
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      // אם זה הפריט האחרון, רק נקה אותו
      onChange([{
        id: items[0].id,
        name: '',
        sku: '',
        price: '',
        quantity: 1,
        description: ''
      }]);
    } else {
      onChange(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // אם אין פריטים, הוסף אחד ריק
  React.useEffect(() => {
    if (items.length === 0) {
      handleAddItem();
    }
  }, []);

  return (
    <div className={styles.itemsManager}>
      <div className={styles.tableWrapper}>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>שם פריט</th>
              <th>מק״ט</th>
              <th>מחיר</th>
              <th>כמות</th>
              <th>תיאור קצר</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={styles.itemRow}>
                <td>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="שם פריט"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="מק״ט"
                    value={item.sku}
                    onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="מחיר"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="כמות"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="תיאור"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveItem(item.id)}
                    title="הסר פריט"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAddItem}
      >
        <i className="fa fa-plus"></i> הוסף פריט
      </button>

      {items.length > 0 && items.some(item => item.name || item.sku) && (
        <div className={styles.summary}>
          <strong>סה״כ פריטים:</strong> {items.filter(item => item.name || item.sku).length}
        </div>
      )}
    </div>
  );
};

export default ItemsManager;