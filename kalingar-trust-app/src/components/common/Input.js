import React from 'react';

const Input = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required, 
  disabled, 
  className = '',
  label,
  error,
  ...props 
}) => {
  const inputClass = `form-input ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}{required && ' *'}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        className={inputClass}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Input;