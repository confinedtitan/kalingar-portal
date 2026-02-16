-- Initial database schema for Kalingar Trust Management System

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    wife_name VARCHAR(100),
    head_of_family VARCHAR(10) NOT NULL DEFAULT 'No',
    second_contact VARCHAR(15),
    old_balance REAL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_no VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    branch_address TEXT NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_mobile ON members(mobile);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_no ON bank_accounts(account_no);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_name ON bank_accounts(bank_name);

-- Insert default admin user (password will be hashed by the application)
-- This is just a placeholder - actual user creation happens in the app
INSERT OR IGNORE INTO users (username, password_hash, name, role) 
VALUES ('shamganesh', 'placeholder_hash', 'Sham Ganesh', 'superadmin');

-- Insert sample data (optional)
INSERT OR IGNORE INTO members (
    member_id, name, father_name, mobile, email, address, gender, 
    wife_name, head_of_family, second_contact, old_balance
) VALUES 
('KT001', 'Rajesh Kumar', 'Suresh Kumar', '9876543210', 'rajesh@example.com', 
 '123 Main Street, Chennai', 'Male', 'Priya Kumar', 'Yes', '9876543211', 1500.0),
('KT002', 'Priya Kumar', 'Ramesh Sharma', '9876543212', 'priya@example.com', 
 '123 Main Street, Chennai', 'Female', '', 'No', '', 0.0);

INSERT OR IGNORE INTO bank_accounts (
    account_no, account_name, ifsc_code, bank_name, branch_name, 
    branch_address, contact_no, status
) VALUES 
('1234567890123456', 'Kalingar Trust Main Account', 'ICIC0001234', 'ICICI Bank', 
 'T Nagar', '123 T Nagar Main Road, Chennai', '044-12345678', 'Active');