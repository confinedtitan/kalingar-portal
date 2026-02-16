import React, { useState } from 'react';
import { styles } from '../utils/styles';

export default function PaymentPage({ member, t, onMakePayment }) {
  const annualTax = Number(member.annual_tax ?? member.annualTax ?? 0);
  const amountPaid = Number(member.amount_paid ?? member.amountPaid ?? 0);
  const amountDue = Number(member.amount_due ?? member.amountDue ?? 0);

  const [paymentAmount, setPaymentAmount] = useState(amountDue);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePayment = () => {
    if (paymentAmount > 0 && paymentAmount <= amountDue) {
      onMakePayment(paymentAmount);
      setShowConfirm(false);
      setPaymentAmount(0);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.makePayment}</h2>

      <div style={styles.paymentCard}>
        <div style={styles.paymentHeader}>
          <h3>{t.paymentDetails}</h3>
        </div>

        <div style={styles.paymentInfo}>
          <div style={styles.paymentInfoItem}>
            <span>{t.annualTax}</span>
            <strong>₹{annualTax.toLocaleString()}</strong>
          </div>
          <div style={styles.paymentInfoItem}>
            <span>{t.amountPaid}</span>
            <strong style={{ color: '#10b981' }}>₹{amountPaid.toLocaleString()}</strong>
          </div>
          <div style={{ ...styles.paymentInfoItem, ...styles.paymentInfoHighlight }}>
            <span>{t.amountDue}</span>
            <strong>₹{amountDue.toLocaleString()}</strong>
          </div>
        </div>

        {amountDue > 0 && (
          <div style={styles.paymentForm}>
            <label style={styles.formLabel}>{t.amount} (₹)</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
              max={amountDue}
              style={styles.paymentInput}
            />

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={paymentAmount <= 0 || paymentAmount > amountDue}
                style={styles.payButton}
              >
                {t.payNow}
              </button>
            ) : (
              <div style={styles.confirmSection}>
                <p style={styles.confirmText}>
                  Confirm payment of ₹{paymentAmount.toLocaleString()}?
                </p>
                <div style={styles.confirmButtons}>
                  <button onClick={handlePayment} style={styles.confirmButton}>
                    {t.confirmPayment}
                  </button>
                  <button onClick={() => setShowConfirm(false)} style={styles.cancelButton}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {amountDue === 0 && (
          <div style={styles.paymentComplete}>
            <div style={styles.checkIcon}>✓</div>
            <p>All payments completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}

