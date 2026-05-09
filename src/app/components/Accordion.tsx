'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={styles.accordion}>
      {items.map((item) => (
        <div key={item.id} className={styles.accordionItem}>
          <button
            className={styles.accordionButton}
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            aria-expanded={openId === item.id}
          >
            <span>{item.title}</span>
            <span className={styles.accordionIcon}>
              {openId === item.id ? '−' : '+'}
            </span>
          </button>
          {openId === item.id && (
            <div className={styles.accordionContent}>{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
