import React, { useState, useEffect } from 'react';

const MemberForm = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    fatherName: '',
    mobile: '',
    email: '',
    address: '',
    gender: 'Male',
    wifeName: '',
    headOfFamily: 'No',
    familyHeadName: '', // NEW FIELD
    secondContact: '',
    oldBalance: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        familyHeadName: member.familyHeadName || ''
      });
    }
  }, [member]);

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.memberId.trim()) newErrors.memberId = 'Member ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Family head name validation - NEW VALIDATION
    if (formData.headOfFamily === 'No' && !formData.familyHeadName.trim()) {
      newErrors.familyHeadName = 'Family Head Name is required when member is not the family head';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.mobile && !mobileRegex.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear family head name when user selects "Yes" for head of family
    if (name === 'headOfFamily' && value === 'Yes') {
      setFormData(prev => ({
        ...prev,
        familyHeadName: ''
      }));
      // Clear family head name error
      if (errors.familyHeadName) {
        setErrors(prev => ({
          ...prev,
          familyHeadName: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Map form data to backend format
      const memberData = {
        memberId: formData.memberId,
        name: formData.name,
        fatherName: formData.fatherName,
        contactNo: formData.mobile,
        email: formData.email,
        address: formData.address,
        gender: formData.gender,
        wifeName: formData.wifeName,
        headOfFamily: formData.headOfFamily,
        familyHeadName: formData.familyHeadName, // NEW FIELD
        secondContact: formData.secondContact,
        oldBalance: parseFloat(formData.oldBalance) || 0
      };

      // If editing, include the ID
      if (member && member.id) {
        memberData.id = member.id;
      }

      await onSave(memberData);

      // Reset form if not editing
      if (!member) {
        setFormData({
          memberId: '',
          name: '',
          fatherName: '',
          mobile: '',
          email: '',
          address: '',
          gender: 'Male',
          wifeName: '',
          headOfFamily: 'No',
          familyHeadName: '',
          secondContact: '',
          oldBalance: 0
        });
      }

    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{member ? 'Edit Member' : 'Add Member'}</h2>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Member ID *</label>
              <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                className={`form-input ${errors.memberId ? 'error' : ''}`}
                placeholder="Enter member ID"
                disabled={loading}
              />
              {errors.memberId && <span className="error-text">{errors.memberId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Father's Name *</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className={`form-input ${errors.fatherName ? 'error' : ''}`}
                placeholder="Enter father's name"
                disabled={loading}
              />
              {errors.fatherName && <span className="error-text">{errors.fatherName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={`form-input ${errors.mobile ? 'error' : ''}`}
                placeholder="Enter mobile number"
                disabled={loading}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter email address"
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Enter full address"
              rows="3"
              disabled={loading}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Head of Family</label>
              <select
                name="headOfFamily"
                value={formData.headOfFamily}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* NEW CONDITIONAL FIELD - Family Head Name */}
            {formData.headOfFamily === 'No' && (
              <div className="form-group">
                <label className="form-label">Family Head Name *</label>
                <input
                  type="text"
                  name="familyHeadName"
                  value={formData.familyHeadName}
                  onChange={handleChange}
                  className={`form-input ${errors.familyHeadName ? 'error' : ''}`}
                  placeholder="Enter family head's name"
                  disabled={loading}
                />
                {errors.familyHeadName && <span className="error-text">{errors.familyHeadName}</span>}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Wife's Name</label>
              <input
                type="text"
                name="wifeName"
                value={formData.wifeName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter wife's name (if applicable)"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Second Contact</label>
              <input
                type="tel"
                name="secondContact"
                value={formData.secondContact}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter alternate contact"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Old Balance</label>
            <input
              type="number"
              name="oldBalance"
              value={formData.oldBalance}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter old balance (if any)"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;