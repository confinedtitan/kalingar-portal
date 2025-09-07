# Kalingar Trust Membership Management System

A comprehensive React-based membership management portal for temple trust administration.

## Features

- **User Authentication**: Secure login system with admin credentials
- **Member Management**: Complete CRUD operations for family members
- **Bank Account Management**: Financial account tracking and management
- **Dashboard**: Overview with statistics and quick actions
- **Responsive Design**: Optimized for desktop and tablet use
- **Search & Filter**: Find members and accounts quickly

## Login Credentials

- **Username**: shamganesh
- **Password**: 123456789

## Project Structure

```
kalingar-trust-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginPage.js
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   └── Sidebar.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── MembersList.js
│   │   │   ├── MemberForm.js
│   │   │   ├── BankAccountsList.js
│   │   │   └── BankAccountForm.js
│   │   └── common/
│   │       ├── Button.js
│   │       ├── Input.js
│   │       └── Table.js
│   ├── data/
│   │   └── appData.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14.0 or higher)
- **npm** (version 6.0 or higher) or **yarn**

## Installation & Setup

### Step 1: Install Node.js

If you don't have Node.js installed:

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version for your operating system
3. Install Node.js (this will also install npm)
4. Verify installation by running:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Navigate to Project Directory

```bash
cd kalingar-trust-app
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run eject`

**Note: this is a one-way operation. Once you eject, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can eject at any time.

## Usage

1. **Login**: Use the credentials provided above
2. **Dashboard**: View overview statistics and quick actions
3. **Members**: Add, edit, delete, and search family members
4. **Bank Accounts**: Manage financial account information
5. **Navigation**: Use the sidebar to navigate between different sections

## Component Details

### Authentication
- **LoginPage**: Handles user authentication with form validation

### Layout Components
- **Header**: Top navigation with user info and logout functionality
- **Sidebar**: Left navigation menu with organized sections

### Page Components
- **Dashboard**: Main overview page with statistics and quick actions
- **MembersList**: Table view of all members with search and pagination
- **MemberForm**: Form for adding/editing member information
- **BankAccountsList**: Table view of bank accounts
- **BankAccountForm**: Form for adding/editing bank account details

### Common Components
- **Button**: Reusable button component with variants
- **Input**: Form input component with validation
- **Table**: Reusable data table with search and pagination

## Customization

### Adding New Features

1. Create new components in the appropriate folder under `src/components/`
2. Import and use them in `App.js`
3. Add new routes/views to the `renderContent` function

### Styling

- Main styles are in `src/styles/App.css`
- All text is styled in black color as requested
- Color scheme uses orange/yellow backgrounds with black text

### Data Management

- Sample data is stored in `src/data/appData.js`
- Data is managed using React state (in-memory)
- To add persistent storage, integrate with a backend API or local storage

## Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   npx kill-port 3000
   npm start
   ```

2. **Dependencies not installing**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build fails**:
   - Check for any syntax errors in the code
   - Ensure all imports are correct

## Support

For any issues or questions, please check the component files and ensure all dependencies are properly installed.

## License

This project is private and proprietary to Kalingar Trust.