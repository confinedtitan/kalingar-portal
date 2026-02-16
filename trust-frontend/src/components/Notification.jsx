import React from 'react';
import { Mail } from 'lucide-react';
import { styles } from '../utils/styles';

export default function Notification({ message }) {
  if (!message) return null;
  
  return (
    <div style={styles.notification}>
      <Mail size={20} />
      <span>{message}</span>
    </div>
  );
}
