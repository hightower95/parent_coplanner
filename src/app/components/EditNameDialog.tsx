'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface EditNameDialogProps {
  currentName: string;
  onSave: (name: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditNameDialog({
  currentName,
  onSave,
  isOpen,
  onClose
}: EditNameDialogProps) {
  const [inputValue, setInputValue] = useState(currentName);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.dialogTitle}>Edit Your Name</h2>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
          className={styles.dialogInput}
          autoFocus
          maxLength={50}
        />

        <div className={styles.dialogButtons}>
          <button
            className={styles.dialogButtonSecondary}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={styles.dialogButtonPrimary}
            onClick={handleSave}
            disabled={!inputValue.trim() || inputValue === currentName}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}