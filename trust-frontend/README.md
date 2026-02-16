# Kalinga Temple Trust Membership Portal

A comprehensive web application for managing temple trust members, payments, and family genealogy.

## Features

### Authentication
- Phone number + password login
- Separate admin and member access levels
- Email confirmation notifications
- Language switching (English/Tamil)

### Admin Features
- **Dashboard**: Overview statistics and recent activity
- **Members Management**: View, search, and filter all members
- **Add Members**: Complete registration with family details
- **Payment Tracking**: View all payment transactions
- **Family Tree**: Visualize family hierarchies and bloodlines
- **Excel Export**: Download complete member reports

### Member Features
- **My Profile**: View personal and family information
- **Payment Portal**: Check dues and make payments
- **Payment Confirmation**: Two-step payment verification

## Project Structure

```
trust-portal/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Login.jsx
│   │   ├── Notification.jsx
│   │   ├── Modal.jsx
│   │   └── MemberDetailsModal.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── MembersPage.jsx
│   │   ├── AddMemberPage.jsx
│   │   ├── AllPaymentsPage.jsx
│   │   ├── FamilyTreePage.jsx
│   │   ├── MyProfilePage.jsx
│   │   └── PaymentPage.jsx
│   ├── data/
│   │   ├── translations.js
│   │   └── initialData.js
│   ├── utils/
│   │   └── styles.js
│   └── App.jsx
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Credentials

### Admin Access
- Username: `admin`
- Password: `admin123`

### Member Access
- Phone: `+91 9876543210`
- Password: `member123`

## Technology Stack

- **React 18** - UI Framework
- **Lucide React** - Icons
- **Pure CSS** - Styling (No Tailwind)
- **JavaScript ES6+** - Programming Language

## Key Components

### App.jsx
Main application component that manages:
- Authentication state
- Member and payment data
- Navigation and routing
- Language preferences

### Components
- **Login**: Authentication interface
- **Header**: Top navigation bar
- **Sidebar**: Side navigation menu
- **Notification**: Toast notifications
- **Modal**: Reusable modal dialog
- **MemberDetailsModal**: Display member information

### Pages
- **DashboardPage**: Overview and statistics
- **MembersPage**: Member list and search
- **AddMemberPage**: New member registration
- **AllPaymentsPage**: Payment history
- **FamilyTreePage**: Family genealogy view
- **MyProfilePage**: Member profile view
- **PaymentPage**: Payment interface

## Features in Detail

### Multi-language Support
All text elements translate between English and Tamil dynamically.

### Family Management
- Track multiple children per member
- Store father, mother, and spouse names
- Visualize family trees

### Payment System
- Annual tax tracking
- Partial payment support
- Payment history
- Excel export capabilities

### Admin Controls
- Add/view members
- Monitor all payments
- Export reports
- View family hierarchies

## Customization

### Styling
All styles are defined in `src/utils/styles.js`. Modify this file to change:
- Colors
- Typography
- Spacing
- Component styles

### Translations
Add or modify translations in `src/data/translations.js`.

### Initial Data
Update sample data in `src/data/initialData.js`.

## Future Enhancements

Potential additions:
- Backend API integration
- Database connectivity
- Email notifications
- SMS alerts
- Advanced reporting
- Multi-role permissions
- Document uploads
- Event management

## License

Private project for Kalinga Temple Trust

## Support

For issues or questions, contact the development team.
