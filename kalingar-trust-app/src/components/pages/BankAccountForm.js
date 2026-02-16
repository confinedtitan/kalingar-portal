import React, { useState } from 'react';

const BankAccountForm = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    accountNo: '',
    accountName: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    branchAddress: '',
    contactNo: '',
    status: 'Active',
    ...account
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accountNo) newErrors.accountNo = 'Account number is required';
    if (!formData.accountName) newErrors.accountName = 'Account name is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.branchName) newErrors.branchName = 'Branch name is required';
    if (!formData.branchAddress) newErrors.branchAddress = 'Branch address is required';
    if (!formData.contactNo) newErrors.contactNo = 'Contact number is required';

    if (formData.contactNo && !/^[0-9-]+$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Contact number format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setSuccess('Bank account saved successfully!');
      setTimeout(() => {
        setSuccess('');
        onCancel();
      }, 1500);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <h2 className="form-title">
          {account ? 'Edit Bank Account' : 'Bank Account Form'}
        </h2>
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Account Number *</label>
              <input
                type="text"
                name="accountNo"
                className="form-input"
                placeholder="Enter Account Number"
                value={formData.accountNo}
                onChange={handleChange}
              />
              {errors.accountNo && <div className="error-message">{errors.accountNo}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Account Name *</label>
              <input
                type="text"
                name="accountName"
                className="form-input"
                placeholder="Enter Account Name"
                value={formData.accountName}
                onChange={handleChange}
              />
              {errors.accountName && <div className="error-message">{errors.accountName}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">IFSC Code *</label>
              <input
                type="text"
                name="ifscCode"
                className="form-input"
                placeholder="Enter IFSC Code"
                value={formData.ifscCode}
                onChange={handleChange}
              />
              {errors.ifscCode && <div className="error-message">{errors.ifscCode}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name *</label>
              <input
                type="text"
                name="bankName"
                className="form-input"
                placeholder="Enter Bank Name"
                value={formData.bankName}
                onChange={handleChange}
              />
              {errors.bankName && <div className="error-message">{errors.bankName}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Branch Name *</label>
              <input
                type="text"
                name="branchName"
                className="form-input"
                placeholder="Enter Branch Name"
                value={formData.branchName}
                onChange={handleChange}
              />
              {errors.branchName && <div className="error-message">{errors.branchName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Branch Address *</label>
              <textarea
                name="branchAddress"
                className="form-input"
                rows="3"
                placeholder="Enter Branch Address"
                value={formData.branchAddress}
                onChange={handleChange}
              ></textarea>
              {errors.branchAddress && <div className="error-message">{errors.branchAddress}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Branch Contact Number *</label>
              <input
                type="text"
                name="contactNo"
                className="form-input"
                placeholder="Enter Contact Number"
                value={formData.contactNo}
                onChange={handleChange}
              />
              {errors.contactNo && <div className="error-message">{errors.contactNo}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountForm;