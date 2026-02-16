import React from 'react';
import { styles } from '../utils/styles';

export default function AllPaymentsPage({ payments, t }) {
  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.payments}</h2>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t.date}</th>
              <th style={styles.th}>{t.memberName}</th>
              <th style={styles.th}>{t.amount}</th>
              <th style={styles.th}>{t.method}</th>
              <th style={styles.th}>{t.reference}</th>
              <th style={styles.th}>{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} style={styles.tr}>
                <td style={styles.td}>{payment.payment_date ?? payment.date}</td>
                <td style={styles.td}>{payment.member_name ?? payment.memberName}</td>
                <td style={styles.td}>₹{Number(payment.amount || 0).toLocaleString()}</td>
                <td style={styles.td}>{payment.payment_method ?? payment.method}</td>
                <td style={styles.td}>{payment.reference_number ?? payment.reference}</td>
                <td style={styles.td}>
                  <span style={styles.statusPaid}>{payment.status ?? t.paid}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
