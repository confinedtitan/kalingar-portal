import React, { useState, useCallback } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';

export default function AddMemberPage({ t, onAddMember }) {
  const [formData, setFormData] = useState({
    name: '',
    nameTa: '',
    phone: '',
    password: '',
    dob: '',
    address: '',
    addressTa: '',
    fatherName: '',
    fatherNameTa: '',
    motherName: '',
    motherNameTa: '',
    spouseName: '',
    spouseNameTa: '',
    annualTax: 20000,
    children: []
  });

  const [childForm, setChildForm] = useState({ name: '', nameTa: '', dob: '', gender: 'Male', marital_status: 'Unmarried' });

  // Tamil input hooks — each returns { onChange, onKeyDown } to spread onto the input
  const setNameTa = useCallback((v) => setFormData(prev => ({ ...prev, nameTa: v })), []);
  const setFatherNameTa = useCallback((v) => setFormData(prev => ({ ...prev, fatherNameTa: v })), []);
  const setMotherNameTa = useCallback((v) => setFormData(prev => ({ ...prev, motherNameTa: v })), []);
  const setSpouseNameTa = useCallback((v) => setFormData(prev => ({ ...prev, spouseNameTa: v })), []);
  const setAddressTa = useCallback((v) => setFormData(prev => ({ ...prev, addressTa: v })), []);
  const setChildNameTa = useCallback((v) => setChildForm(prev => ({ ...prev, nameTa: v })), []);

  const nameTaProps = useTamilInput(formData.nameTa, setNameTa);
  const fatherTaProps = useTamilInput(formData.fatherNameTa, setFatherNameTa);
  const motherTaProps = useTamilInput(formData.motherNameTa, setMotherNameTa);
  const spouseTaProps = useTamilInput(formData.spouseNameTa, setSpouseNameTa);
  const addressTaProps = useTamilInput(formData.addressTa, setAddressTa);
  const childNameTaProps = useTamilInput(childForm.nameTa, setChildNameTa);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMember(formData);
    setFormData({
      name: '',
      nameTa: '',
      phone: '',
      password: '',
      dob: '',
      address: '',
      addressTa: '',
      fatherName: '',
      fatherNameTa: '',
      motherName: '',
      motherNameTa: '',
      spouseName: '',
      spouseNameTa: '',
      annualTax: 20000,
      children: []
    });
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

          {/* Father Name (English) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.fatherNameEnglish} {langTag('EN')} *</label>
            <input
              type="text"
              required
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              style={styles.formInput}
              placeholder="Enter father's name in English"
            />
          </div>

          {/* Father Name (Tamil) */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.fatherNameTamil} {langTag('தமிழ்')}</label>
            <input
              type="text"
              value={formData.fatherNameTa}
              {...fatherTaProps}
              style={styles.formInput}
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

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.annualTax} (₹) *</label>
            <input
              type="number"
              required
              value={formData.annualTax}
              onChange={(e) => setFormData({ ...formData, annualTax: parseInt(e.target.value) })}
              style={styles.formInput}
            />
          </div>
        </div>

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

        <button type="submit" style={styles.submitButton}>
          {t.submit}
        </button>
      </form>
    </div>
  );
}
