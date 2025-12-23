import React, { useRef, useEffect } from 'react';
import styles from './RichTextEditor.module.css';

const RichTextEditor = ({ value, onChange, placeholder = 'הזן טקסט...' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertVariable = (variable) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const span = document.createElement('span');
      span.className = styles.variable;
      span.textContent = variable;
      span.contentEditable = 'false';
      range.insertNode(span);
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      execCommand('insertHTML', `<span class="${styles.variable}" contenteditable="false">${variable}</span>`);
    }
    handleInput();
  };

  const variables = [
    { label: 'שם לקוח', value: '{שם_לקוח}' },
    { label: 'סכום', value: '{סכום}' },
    { label: 'תאריך', value: '{תאריך}' },
    { label: 'שם פרויקט', value: '{שם_פרויקט}' },
    { label: 'מספר תרומה', value: '{מספר_תרומה}' },
    { label: 'מק״ט', value: '{מק״ט}' }
  ];

  return (
    <div className={styles.editorContainer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('bold')}
            title="מודגש"
          >
            <i className="fa fa-bold"></i>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('italic')}
            title="נטוי"
          >
            <i className="fa fa-italic"></i>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('underline')}
            title="קו תחתון"
          >
            <i className="fa fa-underline"></i>
          </button>
        </div>

        <div className={styles.toolbarDivider}></div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('insertUnorderedList')}
            title="רשימה"
          >
            <i className="fa fa-list-ul"></i>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('insertOrderedList')}
            title="רשימה ממוספרת"
          >
            <i className="fa fa-list-ol"></i>
          </button>
        </div>

        <div className={styles.toolbarDivider}></div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => execCommand('createLink', prompt('הזן URL:'))}
            title="קישור"
          >
            <i className="fa fa-link"></i>
          </button>
        </div>

        <div className={styles.toolbarDivider}></div>

        {/* Variables Dropdown */}
        <div className={styles.toolbarGroup}>
          <select
            className={styles.variableSelect}
            onChange={(e) => {
              if (e.target.value) {
                insertVariable(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="">הוסף משתנה</option>
            {variables.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        dir="rtl"
      />
    </div>
  );
};

export default RichTextEditor;