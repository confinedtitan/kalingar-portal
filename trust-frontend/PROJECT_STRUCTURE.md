# Trust Membership Portal - Project Structure

## 📁 Complete File Organization

```
trust-portal/
│
├── 📄 package.json                    # Project dependencies
├── 📄 README.md                       # Documentation
│
├── 📁 public/
│   └── 📄 index.html                  # HTML template
│
└── 📁 src/
    ├── 📄 index.js                    # React entry point
    ├── 📄 App.jsx                     # Main application component
    │
    ├── 📁 components/                 # Reusable UI components
    │   ├── 📄 Header.jsx              # Top navigation bar
    │   ├── 📄 Sidebar.jsx             # Side navigation menu
    │   ├── 📄 Login.jsx               # Login screen
    │   ├── 📄 Notification.jsx        # Toast notifications
    │   ├── 📄 Modal.jsx               # Modal wrapper
    │   └── 📄 MemberDetailsModal.jsx  # Member info modal
    │
    ├── 📁 pages/                      # Page components
    │   ├── 📄 DashboardPage.jsx       # Dashboard overview
    │   ├── 📄 MembersPage.jsx         # Members list (Admin)
    │   ├── 📄 AddMemberPage.jsx       # Add new member (Admin)
    │   ├── 📄 AllPaymentsPage.jsx     # Payment history (Admin)
    │   ├── 📄 FamilyTreePage.jsx      # Family tree view (Admin)
    │   ├── 📄 MyProfilePage.jsx       # Member profile (Member)
    │   └── 📄 PaymentPage.jsx         # Make payment (Member)
    │
    ├── 📁 data/                       # Data files
    │   ├── 📄 translations.js         # English/Tamil translations
    │   └── 📄 initialData.js          # Sample member & payment data
    │
    └── 📁 utils/                      # Utility files
        └── 📄 styles.js               # All CSS styles
```

## 🎯 Component Responsibilities

### Core Components
- **App.jsx**: State management, routing, authentication logic
- **Login.jsx**: User authentication interface
- **Header.jsx**: User info, language switcher, logout
- **Sidebar.jsx**: Navigation menu (dynamic based on role)

### Admin Pages
- **DashboardPage**: Statistics, recent activity, export button
- **MembersPage**: Search, filter, view all members
- **AddMemberPage**: Registration form with family details
- **AllPaymentsPage**: Complete payment history table
- **FamilyTreePage**: Visual family hierarchy cards

### Member Pages
- **MyProfilePage**: View personal & family information
- **PaymentPage**: Check dues and make payments

## 🔄 Data Flow

```
App.jsx (Central State)
    ↓
    ├─→ Login → Authentication
    ├─→ Header → Language/User Info
    ├─→ Sidebar → Navigation
    └─→ Pages → Display & Interactions
            ↓
        Back to App.jsx (State Updates)
```

## 🌐 Key Features by File

### translations.js
- English and Tamil text for all UI elements
- Easy to add more languages

### styles.js
- All CSS-in-JS styling
- Organized by component/page
- Consistent design system

### initialData.js
- Sample members with family details
- Sample payment records
- Easy to replace with API calls

## 🚀 How to Use

1. **Install**: `npm install`
2. **Run**: `npm start`
3. **Login**: 
   - Admin: admin/admin123
   - Member: +91 9876543210/member123

## 📝 File Naming Convention

- **Components**: PascalCase (Header.jsx)
- **Pages**: PascalCase + "Page" suffix
- **Utils/Data**: camelCase (.js extension)
- **Main entry**: lowercase (index.js)

## 🎨 Styling Approach

All styles in ONE file (styles.js):
- No CSS files needed
- No Tailwind classes
- Pure CSS-in-JS objects
- Easy to maintain and modify
