# Kalingar Trust Portal — User Manual

Welcome to the **Kalingar Trust Portal**. This guide provides step-by-step instructions for non-technical users, trust members, accountants, and administrators to navigate the platform, manage member directories, track family relationships, and perform financial and accounting duties.

---

## Table of Contents
1. [Getting Started & Login](#1-getting-started--login)
2. [Navigating the Dashboard](#2-navigating-the-dashboard)
3. [Member Directory Management](#3-member-directory-management)
4. [Family Tree Visualization](#4-family-tree-visualization)
5. [Financial Accounting Workflows](#5-financial-accounting-workflows)
6. [Generating Financial Reports](#6-generating-financial-reports)
7. [Member Portal Workflows](#7-member-portal-workflows)
8. [Troubleshooting & Validation Guide](#8-troubleshooting--validation-guide)

---

## 1. Getting Started & Login

### How to Access the Portal
1. Open your web browser and navigate to the portal address.
2. Choose your preferred language by clicking the language toggle (**English** / **தமிழ்**) in the top-right header corner.
3. Enter your login credentials:
   - **Username / Phone Number**: Enter your 10-digit registered mobile number.
   - **Password**: Enter your secret password.
4. Click the **Login** (அல்லது **உள்நுழைய**) button.

> [!NOTE]
> Access permissions are role-based. Depending on whether you are logged in as an **Administrator**, an **Accountant**, or a **Member**, certain menu buttons and reports will be shown or hidden.

---

## 2. Navigating the Dashboard

Once logged in, the primary page is the **Dashboard**.

- **Admin/Accountant View**: Displays statistical tiles summarizing:
  - **Total Members**: Number of registered family heads.
  - **Total Collected**: Total monetary contributions received.
  - **Pending Dues**: Total amount outstanding.
  - **Quick Export**: Click **Export to Excel** to download the dashboard metrics.
- **Member View**: Shows personal tax summary details, contribution status (Paid/Pending), and contact information.

---

## 3. Member Directory Management

This section is available to **Administrators**. Click **Members** in the sidebar navigation to open the directory.

### Searching, Sorting, and Filtering
- **Global Search**: Type any name, ID, or phone number in the search bar.
- **Column Sorting**: Click on any column header name (e.g., *Member ID*, *Name*, *Phone*, *Annual Tax*, *Paid*, *Due*) to sort the list in Ascending (`▲`) or Descending (`▼`) order.
- **Column Filtering**: Type values directly in the filter box under each header or select a status (*All*, *Paid*, *Pending*) to instantly narrow down the list.

### Registering a New Member
1. Click the **➕ Add Member** button at the top right of the Members list.
2. Fill in the member details:
   - **Name (English)**: Enter full name.
   - **Name (Tamil)**: Optional Tamil translation.
   - **Phone Number**: A unique 10-digit mobile number (this serves as their login username).
   - **Father's / Mother's / Spouse's Name**: Enter family details in English and Tamil.
   - **Address**: Permanent home address.
   - **Is Family Head?**: Check this box if they are the primary trust contributor. (This automatically provisions login credentials).
3. **Adding Children**: Click **➕ Add Child** to add details for dependents.
4. Click **Submit** to save. The portal automatically registers the member and redirects you to the list.

### Editing & Resetting Passwords
- **Edit Member**: Click **Edit** on a member's row to modify their details. Click **Save Changes** to commit or **Cancel** to return.
- **Reset Password**: Click the **🔑 Reset Password** button on a member's row. You will be prompted to enter a new password (minimum 8 characters) to reset their login credentials.

---

## 4. Family Tree Visualization

For a clear view of how members relate, click **Family Tree** in the sidebar.
- Only **Family Heads** are shown as root cards.
- Clicking on a Family Head card expands their node to list their spouse, parents, and children to track the lineage easily.

---

## 5. Financial Accounting Workflows

The portal contains a complete double-entry bookkeeping system accessible by Admins and Accountants.

### Account Heads
Account Heads represent different ledger accounts (e.g., General Fund, Kovil Festival donation).
1. Go to **Account Heads** in the sidebar.
2. Click **➕ New Account Head**.
3. Choose the **Type** (either **General** or **Kodai**) and the **Account Type** (e.g., *Revenue*, *Asset*, *Liability*, *Expense*).
4. Enter the names and click **Create**.

### Trust Accounts
Trust Accounts represent cash safes or bank accounts.
- Click **Trust Accounts** in the sidebar to view balances.
- Click **➕ New Trust Account** to register a cash vault or bank account.

### Registering Transactions
1. Go to **Transactions** in the sidebar.
2. Click **➕ Add Transaction** at the top right.
3. Select the details:
   - **Member** (Optional): Search/select a registered family head.
   - **Account Head** & **Transaction Type** (*Credit* for income/deposits, *Debit* for expense/outflows).
   - **Amount** and **Date**.
   - **Payment Mode**: Select *Cash*, *Bank Transfer*, *UPI*, *Cheque*, *Credit*, or *Commodities* (for physical gold/silver deposits).
   - **Trust Account**: Choose which cash account or bank ledger this transaction updates.
   - **Proof Document**: Upload receipt scans or deposit slips.
4. Click **Create Transaction & Generate Receipt**.
5. Once saved, click **📄 Download Receipt** to obtain a printable PDF receipt.

---

## 6. Generating Financial Reports

Navigate to **Reports** in the sidebar to review accounting ledgers.
- **Balance Sheet**: Shows net balances across all account heads.
- **Single Head Summary**: Select a specific Account Head to see all transactions and net balance.
- **Commodity & Asset Summary**: Tracks physical gold and silver weight held in the trust vault.
- **Member Balance Matrix**: Lists all family heads, their total billed amount, total paid, and net outstanding dues.

---

## 7. Member Portal Workflows

When logged in as a normal member:
- **My Profile**: View personal registration details and update login passwords.
- **Make Payment**: Enter contribution amounts to pay dues online via UPI.
- **My Donations**: View receipt records for all past donations made to the trust.

---

## 8. Troubleshooting & Validation Guide

When filling out forms, you may run into validation messages. Here is how to resolve them:

> [!WARNING]
> **Error: "Phone number already exists"**
> - **Why it happens**: Every registered phone number must be completely unique across the entire trust directory.
> - **How to fix**: Check if the member has already been registered or check if the phone number belongs to another family member.

> [!IMPORTANT]
> **Error: "Password is too short"**
> - **Why it happens**: For security, all user accounts require a password of at least 8 characters.
> - **How to fix**: Enter a stronger password containing 8 or more letters, numbers, or symbols.

> [!CAUTION]
> **Error: "Unexpected token < in JSON" when resetting passwords**
> - **Why it happens**: You attempted to reset a password for a family member who is not marked as a "Family Head" and therefore does not have user login credentials.
> - **How to fix**: Go to the Edit Member form, verify that **Is Family Head** is checked, save the member, and then perform the password reset.
