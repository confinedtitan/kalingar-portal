import React from 'react';
import { styles } from '../utils/styles';
import { formatDate } from '../utils/dateFormatter';

export default function MemberDetailsModal({ member, t, onClose }) {
  const annualTax = member.annual_tax ?? member.annualTax ?? 0;
  const amountPaid = member.amount_paid ?? member.amountPaid ?? 0;
  const amountDue = member.amount_due ?? member.amountDue ?? 0;
  const dob = member.date_of_birth ?? member.dob ?? '';
  const fatherName = member.father_name ?? member.fatherName ?? '';
  const fatherNameTa = member.father_name_ta ?? member.fatherNameTa ?? '';
  const motherName = member.mother_name ?? member.motherName ?? '';
  const motherNameTa = member.mother_name_ta ?? member.motherNameTa ?? '';
  const spouseName = member.spouse_name ?? member.spouseName ?? '';
  const spouseNameTa = member.spouse_name_ta ?? member.spouseNameTa ?? '';
  const children = member.children ?? [];

  // Helper to render a bilingual detail row
  const BilingualDetail = ({ label, labelTa, value, valueTa }) => {
    if (!value && !valueTa) return null;
    return (
      <div style={styles.detailItem}>
        <label>{label}</label>
        <div>
          {value && <div>{value}</div>}
          {valueTa && (
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              {labelTa ? `${labelTa}: ` : ''}{valueTa}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.modalInner}>
      <div style={styles.modalHeader}>
        <h3>{t.memberDetails}</h3>
        <button onClick={onClose} style={styles.modalClose}>×</button>
      </div>

      <div style={styles.modalBody}>
        <div style={styles.detailsGrid}>
          <BilingualDetail
            label={t.nameEnglish || t.memberName}
            labelTa=""
            value={member.name}
            valueTa={member.name_ta}
          />
          <div style={styles.detailItem}>
            <label>{t.phoneNumber}</label>
            <div>{member.phone}</div>
          </div>
          {(member.reference_id || member.referenceId) && (
            <div style={styles.detailItem}>
              <label>{t.referenceId || 'Reference ID'}</label>
              <div>{member.reference_id || member.referenceId}</div>
            </div>
          )}
          <div style={styles.detailItem}>
            <label>{t.dateOfBirth}</label>
            <div>{formatDate(dob) || '-'}</div>
          </div>
          <BilingualDetail
            label={t.fatherNameEnglish || t.fatherName}
            labelTa=""
            value={fatherName}
            valueTa={fatherNameTa}
          />
          {(motherName || motherNameTa) && (
            <BilingualDetail
              label={t.motherNameEnglish || t.motherName}
              labelTa=""
              value={motherName}
              valueTa={motherNameTa}
            />
          )}
          {(spouseName || spouseNameTa) && (
            <BilingualDetail
              label={t.spouseNameEnglish || t.spouseName}
              labelTa=""
              value={spouseName}
              valueTa={spouseNameTa}
            />
          )}
        </div>

        <BilingualDetail
          label={t.addressEnglish || t.address}
          labelTa=""
          value={member.address}
          valueTa={member.address_ta}
        />

        {children.length > 0 && (
          <div style={styles.detailItem}>
            <label>{t.children}</label>
            <div style={styles.childrenModalList}>
              {children.map((child, index) => (
                <div key={index} style={styles.childModalItem}>
                  {child.name}{child.name_ta ? ` / ${child.name_ta}` : ''} - {child.date_of_birth ?? child.dob} - {child.gender} - {child.marital_status || 'Unmarried'}
                </div>
              ))}
            </div>
          </div>
        )}

        {member.taxes && member.taxes.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            <h4>Tax History</h4>
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Tax Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Tax Count</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Paid</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {member.taxes.map(tax => (
                    <tr key={tax.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>{tax.tax_name}</td>
                      <td style={{ padding: '8px' }}>{tax.tax_count}</td>
                      <td style={{ padding: '8px' }}>₹{tax.total_tax}</td>
                      <td style={{ padding: '8px', color: '#10b981' }}>₹{tax.amount_paid}</td>
                      <td style={{ padding: '8px', color: '#ef4444' }}>₹{tax.amount_due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
