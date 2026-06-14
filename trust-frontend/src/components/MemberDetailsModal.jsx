import React from 'react';
import { styles } from '../utils/styles';

export default function MemberDetailsModal({ member, t, onClose }) {
  const annualTax = member.annual_tax ?? member.annualTax ?? 0;
  const amountPaid = member.amount_paid ?? member.amountPaid ?? 0;
  const amountDue = member.amount_due ?? member.amountDue ?? 0;
  const dob = member.date_of_birth ?? member.dob ?? '';
  const fatherName = member.father_name ?? member.fatherName ?? '';
  const motherName = member.mother_name ?? member.motherName ?? '';
  const spouseName = member.spouse_name ?? member.spouseName ?? '';
  const children = member.children ?? [];

  return (
    <div style={styles.modalInner}>
      <div style={styles.modalHeader}>
        <h3>{t.memberDetails}</h3>
        <button onClick={onClose} style={styles.modalClose}>×</button>
      </div>

      <div style={styles.modalBody}>
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <label>{t.memberName}</label>
            <div>{member.name}</div>
          </div>
          <div style={styles.detailItem}>
            <label>{t.phoneNumber}</label>
            <div>{member.phone}</div>
          </div>
          <div style={styles.detailItem}>
            <label>{t.dateOfBirth}</label>
            <div>{dob}</div>
          </div>
          <div style={styles.detailItem}>
            <label>{t.fatherName}</label>
            <div>{fatherName}</div>
          </div>
          {motherName && (
            <div style={styles.detailItem}>
              <label>{t.motherName}</label>
              <div>{motherName}</div>
            </div>
          )}
          {spouseName && (
            <div style={styles.detailItem}>
              <label>{t.spouseName}</label>
              <div>{spouseName}</div>
            </div>
          )}
        </div>

        <div style={styles.detailItem}>
          <label>{t.address}</label>
          <div>{member.address}</div>
        </div>

        {children.length > 0 && (
          <div style={styles.detailItem}>
            <label>{t.children}</label>
            <div style={styles.childrenModalList}>
              {children.map((child, index) => (
                <div key={index} style={styles.childModalItem}>
                  {child.name} - {child.date_of_birth ?? child.dob} - {child.gender}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.paymentModalSummary}>
          <div style={styles.paymentModalItem}>
            <span>{t.annualTax}</span>
            <strong>₹{Number(annualTax).toLocaleString()}</strong>
          </div>
          <div style={styles.paymentModalItem}>
            <span>{t.amountPaid}</span>
            <strong style={{ color: '#10b981' }}>₹{Number(amountPaid).toLocaleString()}</strong>
          </div>
          <div style={styles.paymentModalItem}>
            <span>{t.amountDue}</span>
            <strong style={{ color: '#ef4444' }}>₹{Number(amountDue).toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
