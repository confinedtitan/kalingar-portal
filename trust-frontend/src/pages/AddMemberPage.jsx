import React, { useState, useCallback, useEffect } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';

export default function AddMemberPage({ t, onAddMember, member, onUpdateMember, onCancel, members = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    nameTa: '',
    phone: '',
    password: '',
    dob: '',
    address: '',
    addressTa: '',
    father: '',
    fallbackFatherNameEn: '',
    fallbackFatherNameTa: '',
    fatherName: '',
    fatherNameTa: '',
    motherName: '',
    motherNameTa: '',
    spouseName: '',
    spouseNameTa: '',
    annualTax: 20000,
    isFamilyHead: true,
    isActive: true,
    isExpired: false,
    children: []
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        nameTa: member.name_ta || '',
        phone: member.phone || '',
        password: '',
        dob: member.date_of_birth || member.dob || '',
        address: member.address || '',
        addressTa: member.address_ta || '',
        father: member.father || '',
        fallbackFatherNameEn: member.fallback_father_name_en || '',
        fallbackFatherNameTa: member.fallback_father_name_ta || '',
        fatherName: member.father_name || '',
        fatherNameTa: member.father_name_ta || '',
        motherName: member.mother_name || '',
        motherNameTa: member.mother_name_ta || '',
        spouseName: member.spouse_name || '',
        spouseNameTa: member.spouse_name_ta || '',
        annualTax: member.annual_tax || 20000,
        isFamilyHead: member.is_family_head || false,
        isActive: member.is_active ?? true,
        isExpired: member.is_expired ?? false,
        children: (member.children || []).map(child => ({
          id: child.id,
          name: child.name,
          nameTa: child.name_ta || '',
          dob: child.date_of_birth || child.dob || '',
          gender: child.gender || 'Male',
          marital_status: child.marital_status || 'Unmarried'
        }))
      });
    }
  }, [member]);

  const [childForm, setChildForm] = useState({ name: '', nameTa: '', dob: '', gender: 'Male', marital_status: 'Unmarried' });

  // Tamil input hooks — each returns { onChange, onKeyDown } to spread onto the input
  const setNameTa = useCallback((v) => setFormData(prev => ({ ...prev, nameTa: v })), []);
  const setFatherNameTa = useCallback((v) => setFormData(prev => ({ ...prev, fallbackFatherNameTa: v, fatherNameTa: v })), []);
  const setMotherNameTa = useCallback((v) => setFormData(prev => ({ ...prev, motherNameTa: v })), []);
  const setSpouseNameTa = useCallback((v) => setFormData(prev => ({ ...prev, spouseNameTa: v })), []);
  const setAddressTa = useCallback((v) => setFormData(prev => ({ ...prev, addressTa: v })), []);
  const setChildNameTa = useCallback((v) => setChildForm(prev => ({ ...prev, nameTa: v })), []);

  const nameTaProps = useTamilInput(formData.nameTa, setNameTa);
  const fatherTaProps = useTamilInput(formData.fallbackFatherNameTa, setFatherNameTa);
  const motherTaProps = useTamilInput(formData.motherNameTa, setMotherNameTa);
  const spouseTaProps = useTamilInput(formData.spouseNameTa, setSpouseNameTa);
  const addressTaProps = useTamilInput(formData.addressTa, setAddressTa);
  const childNameTaProps = useTamilInput(childForm.nameTa, setChildNameTa);

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalChildren = formData.children;
    // Auto-save child if name and dob are filled but user forgot to click "+ Add Child"
    if (childForm.name && childForm.dob) {
      finalChildren = [...formData.children, childForm];
    }
    const finalData = {
      ...formData,
      children: finalChildren
    };
    if (member && onUpdateMember) {
      onUpdateMember(member.id, finalData);
    } else {
      onAddMember(finalData);
    }
  };

  const addChild = () => {
    if (childForm.name && childForm.dob) {
      setFormData({
        ...formData,
        children: [...formData.children, childForm]
      });
      setChildForm({ name: '', nameTa: '', dob: '', gender: 'Male', marital_status: 'Unmarried' });
    }
  };

  // Style for the paired language label
  const langTag = (text) => (
    <span style={{
      display: 'inline-block',
      fontSize: '10px',
      fontWeight: '600',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '6px',
      verticalAlign: 'middle',
      background: text === 'EN' ? '#dbeafe' : '#fef3c7',
      color: text === 'EN' ? '#1d4ed8' : '#92400e',
    }}>{text}</span>
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.addMember}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Name (English) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.nameEnglish} {langTag('EN')} *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.formInput}
              placeholder="Enter name in English"
            />
          </div>

          {/* Name (Tamil) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.nameTamil} {langTag('தமிழ்')}</label>
            <input
              type="text"
              value={formData.nameTa}
              {...nameTaProps}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.phoneNumber} *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              style={styles.formInput}
              placeholder="Enter 10 digit number"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.defaultPassword}</label>
            <input
              type="text"
              value={formData.password || formData.phone}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.formInput}
              placeholder={t.defaultPasswordNote}
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
              {t.defaultPasswordNote}
            </small>
          </div>


          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.dateOfBirth} *</label>
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              style={styles.formInput}
            />
          </div>

          {/* Father Linkage & Bilingual Fallbacks */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Link Father (if registered member)</label>
            <select
              value={formData.father || ''}
              onChange={(e) => {
                const fatherId = e.target.value;
                const linkedFather = members.find(m => String(m.id) === String(fatherId));
                setFormData(prev => ({
                  ...prev,
                  father: fatherId,
                  fatherName: linkedFather ? linkedFather.name : prev.fallbackFatherNameEn,
                  fatherNameTa: linkedFather ? linkedFather.name_ta : prev.fallbackFatherNameTa,
                }));
              }}
              style={styles.formInput}
            >
              <option value="">-- Not in members list (Enter fallback names below) --</option>
              {members
                .filter(m => m.is_family_head && m.is_active && (!member || String(m.id) !== String(member.id)))
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name}{m.name_ta ? ` / ${m.name_ta}` : ''}</option>
                ))
              }
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.fatherNameEnglish} {langTag('EN')} *</label>
            <input
              type="text"
              required={!formData.father}
              disabled={!!formData.father}
              value={formData.father ? formData.fatherName : formData.fallbackFatherNameEn}
              onChange={(e) => {
                if (!formData.father) {
                  setFormData({ ...formData, fallbackFatherNameEn: e.target.value, fatherName: e.target.value });
                }
              }}
              style={styles.formInput}
              placeholder={formData.father ? "Linked to father profile" : "Enter father's name in English"}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.fatherNameTamil} {langTag('தமிழ்')}</label>
            <input
              type="text"
              disabled={!!formData.father}
              value={formData.father ? formData.fatherNameTa : formData.fallbackFatherNameTa}
              {...(formData.father ? {} : fatherTaProps)}
              style={styles.formInput}
              placeholder={formData.father ? "Linked to father profile" : ""}
            />
          </div>

          {/* Mother Name (English) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.motherNameEnglish} {langTag('EN')}</label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              style={styles.formInput}
              placeholder="Enter mother's name in English"
            />
          </div>

          {/* Mother Name (Tamil) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.motherNameTamil} {langTag('தமிழ்')}</label>
            <input
              type="text"
              value={formData.motherNameTa}
              {...motherTaProps}
              style={styles.formInput}
            />
          </div>

          {/* Spouse Name (English) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.spouseNameEnglish} {langTag('EN')}</label>
            <input
              type="text"
              value={formData.spouseName}
              onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
              style={styles.formInput}
              placeholder="Enter spouse's name in English"
            />
          </div>

          {/* Spouse Name (Tamil) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.spouseNameTamil} {langTag('தமிழ்')}</label>
            <input
              type="text"
              value={formData.spouseNameTa}
              {...spouseTaProps}
              style={styles.formInput}
            />
          </div>
        </div>

        {/* Status and Promotion Settings (Only in Edit Mode) */}
        {member && (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#334155' }}>Status & Account Settings</h4>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={formData.isExpired}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      isExpired: checked,
                      ...(checked ? { isActive: false, isFamilyHead: false } : { isActive: true })
                    }));
                  }}
                />
                Deceased / Expired
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: formData.isExpired ? '#94a3b8' : 'inherit' }}>
                <input
                  type="checkbox"
                  disabled={formData.isExpired}
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active Member
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: (formData.isExpired || formData.isFamilyHead) ? '#94a3b8' : 'inherit' }}>
                <input
                  type="checkbox"
                  disabled={formData.isExpired || formData.isFamilyHead}
                  checked={formData.isFamilyHead}
                  onChange={(e) => setFormData({ ...formData, isFamilyHead: e.target.checked })}
                />
                Is Family Head
              </label>
            </div>
            
            {/* Manual promotion button */}
            {!formData.isFamilyHead && !formData.isExpired && (
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isFamilyHead: true })}
                  style={{
                    padding: '8px 16px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
                  }}
                >
                  👑 Promote to Family Head
                </button>
              </div>
            )}
          </div>
        )}

        {/* Address (English) */}
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>{t.addressEnglish} {langTag('EN')} *</label>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            style={styles.formTextarea}
            rows="3"
            placeholder="Enter address in English"
          />
        </div>

        {/* Address (Tamil) */}
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>{t.addressTamil} {langTag('தமிழ்')}</label>
          <textarea
            value={formData.addressTa}
            {...addressTaProps}
            style={styles.formTextarea}
            rows="3"
          />
        </div>

        <div style={styles.childrenSection}>
          <h3 style={styles.subsectionTitle}>{t.children}</h3>

          <div style={styles.childFormGrid}>
            <input
              type="text"
              placeholder={t.childNameEnglish || t.childName}
              value={childForm.name}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
              style={styles.formInput}
            />
            <input
              type="text"
              placeholder={t.childNameTamil || 'Child Name (Tamil)'}
              value={childForm.nameTa}
              {...childNameTaProps}
              style={styles.formInput}
            />
            <input
              type="date"
              placeholder={t.childDOB}
              value={childForm.dob}
              onChange={(e) => setChildForm({ ...childForm, dob: e.target.value })}
              style={styles.formInput}
            />
            <select
              value={childForm.gender}
              onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}
              style={styles.formInput}
            >
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
            </select>
            <select
              value={childForm.marital_status}
              onChange={(e) => setChildForm({ ...childForm, marital_status: e.target.value })}
              style={styles.formInput}
            >
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
            </select>
            <button type="button" onClick={addChild} style={styles.addChildButton}>
              {t.addChild}
            </button>
          </div>

          {formData.children.length > 0 && (
            <div style={styles.childrenList}>
              {formData.children.map((child, index) => (
                <div key={index} style={styles.childItem}>
                  <span>{child.name}{child.nameTa ? ` / ${child.nameTa}` : ''} - {child.dob} - {child.gender} - {child.marital_status}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      children: formData.children.filter((_, i) => i !== index)
                    })}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button type="submit" style={styles.submitButton}>
            {member ? (t.save || 'Save Changes') : t.submit}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ ...styles.submitButton, backgroundColor: '#64748b' }}
            >
              {t.cancel || 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
