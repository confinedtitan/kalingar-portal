import React, { useState } from 'react';
import { styles } from '../utils/styles';
import { formatDate } from '../utils/dateFormatter';

export default function PaymentPage({ member, t, onMakePayment }) {
  const pendingTaxes = (member.taxes || []).filter(tax => Number(tax.amount_due) > 0);
  const [selectedTax, setSelectedTax] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectTax = (tax) => {
    setSelectedTax(tax);
    setPaymentAmount(Number(tax.amount_due));
    setShowConfirm(false);
  };

  const handlePayment = () => {
    if (selectedTax && paymentAmount > 0 && paymentAmount <= Number(selectedTax.amount_due)) {
      onMakePayment(paymentAmount, selectedTax.id);
      setShowConfirm(false);
      setSelectedTax(null);
      setPaymentAmount(0);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.makePayment}</h2>

      {pendingTaxes.length === 0 ? (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#16a34a', margin: '0 auto 16px auto' }}>✓</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>All Caught Up!</h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>All your taxes are paid. There are no pending payments.</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {pendingTaxes.map(tax => (
            <div key={tax.id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
              border: selectedTax?.id === tax.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '20px 24px',
                background: selectedTax?.id === tax.id ? '#f8fafc' : 'white',
                borderBottom: '1px solid #e2e8f0' 
              }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>{tax.tax_name}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Tax Generated on {formatDate(tax.created_at || Date.now())}</p>
                </div>
                {selectedTax?.id !== tax.id && (
                  <button 
                    onClick={() => handleSelectTax(tax)}
                    style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)' }}
                  >
                    Pay This
                  </button>
                )}
              </div>

              {/* Info section */}
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Tax</span>
                  <strong style={{ fontSize: '20px', color: '#1e293b' }}>₹{Number(tax.total_tax).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Paid</span>
                  <strong style={{ fontSize: '20px', color: '#10b981' }}>₹{Number(tax.amount_paid).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>Due Amount</span>
                  <strong style={{ fontSize: '20px', color: '#b45309' }}>₹{Number(tax.amount_due).toLocaleString()}</strong>
                </div>
              </div>

              {/* Payment form */}
              {selectedTax?.id === tax.id && (
                <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    {t.amount || 'Payment Amount'} (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                    max={Number(tax.amount_due)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '20px',
                      outline: 'none',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  />

                  {!showConfirm ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={paymentAmount <= 0 || paymentAmount > Number(tax.amount_due)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: (paymentAmount <= 0 || paymentAmount > Number(tax.amount_due)) ? '#94a3b8' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: (paymentAmount <= 0 || paymentAmount > Number(tax.amount_due)) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {t.payNow || 'Pay Now'}
                    </button>
                  ) : (
                    <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', textAlign: 'center', margin: '0 0 20px 0' }}>
                        Confirm payment of ₹{paymentAmount.toLocaleString()} for {tax.tax_name}?
                      </p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={handlePayment} style={{ flex: 1, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                          {t.confirmPayment || 'Confirm Payment'}
                        </button>
                        <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '14px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                          {t.cancel || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

