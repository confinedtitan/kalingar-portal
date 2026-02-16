import React, { useState, useCallback } from 'react';
import { styles } from '../utils/styles';
import { useTamilInput } from '../utils/useTamilInput';

export default function AddMemberPage({ t, onAddMember }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    dob: '',
    address: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    annualTax: 20000,
    children: []
  });

  const [childForm, setChildForm] = useState({ name: '', dob: '', gender: 'Male' });

  // Tamil input hooks — each returns { onChange, onKeyDown } to spread onto the input
  const setName = useCallback((v) => setFormData(prev => ({ ...prev, name: v })), []);
  const setFatherName = useCallback((v) => setFormData(prev => ({ ...prev, fatherName: v })), []);
  const setMotherName = useCallback((v) => setFormData(prev => ({ ...prev, motherName: v })), []);
  const setSpouseName = useCallback((v) => setFormData(prev => ({ ...prev, spouseName: v })), []);
  const setAddress = useCallback((v) => setFormData(prev => ({ ...prev, address: v })), []);
  const setChildName = useCallback((v) => setChildForm(prev => ({ ...prev, name: v })), []);

  const nameProps = useTamilInput(formData.name, setName);
  const fatherProps = useTamilInput(formData.fatherName, setFatherName);
  const motherProps = useTamilInput(formData.motherName, setMotherName);
  const spouseProps = useTamilInput(formData.spouseName, setSpouseName);
  const addressProps = useTamilInput(formData.address, setAddress);
  const childNameProps = useTamilInput(childForm.name, setChildName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMember(formData);
    setFormData({
      name: '',
      phone: '',
      password: '',
      dob: '',
      address: '',
      fatherName: '',
      motherName: '',
      spouseName: '',
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
      setChildForm({ name: '', dob: '', gender: 'Male' });
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.addMember}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.memberName} *</label>
            <input
              type="text"
              required
              value={formData.name}
              {...nameProps}
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

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.fatherName} *</label>
            <input
              type="text"
              required
              value={formData.fatherName}
              {...fatherProps}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.motherName}</label>
            <input
              type="text"
              value={formData.motherName}
              {...motherProps}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>{t.spouseName}</label>
            <input
              type="text"
              value={formData.spouseName}
              {...spouseProps}
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

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>{t.address} *</label>
          <textarea
            required
            value={formData.address}
            {...addressProps}
            style={styles.formTextarea}
            rows="3"
          />
        </div>

        <div style={styles.childrenSection}>
          <h3 style={styles.subsectionTitle}>{t.children}</h3>

          <div style={styles.childFormGrid}>
            <input
              type="text"
              placeholder={t.childName}
              value={childForm.name}
              {...childNameProps}
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
            <button type="button" onClick={addChild} style={styles.addChildButton}>
              {t.addChild}
            </button>
          </div>

          {formData.children.length > 0 && (
            <div style={styles.childrenList}>
              {formData.children.map((child, index) => (
                <div key={index} style={styles.childItem}>
                  <span>{child.name} - {child.dob} - {child.gender}</span>
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
