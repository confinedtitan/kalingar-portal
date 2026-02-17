# Kalingar Trust Portal

This repository contains the source code for the Kalingar Trust Membership Portal.

## Prerequisites

- **Python** (3.8 or higher)
- **Node.js** (16 or higher)
- **Git**

## 1. Backend Setup (Django)

Open a terminal in the project root.

```bash
cd trust-backend
```

### Create and Activate Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Configure Environment
Create a `.env` file in the `trust-backend` folder (or just update `trust_portal/settings.py` directly if preferred for dev).
Add your computer's IP address to `ALLOWED_HOSTS`.

Example `.env` content:
```ini
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,<YOUR_IP_ADDRESS>
```
*Replace `<YOUR_IP_ADDRESS>` with your actual local IP (e.g., `192.168.1.5`). You can find this by running `ipconfig`.*

### Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Run the Backend
To allow access from other devices, bind to `0.0.0.0`:
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 2. Frontend Setup (React)

Open a **new** terminal in the project root.

```bash
cd trust-frontend
```

### Install Dependencies
```bash
npm install
```

### Run the Frontend
To allow access from other devices, you need to bind to `0.0.0.0`.

**Command Prompt (cmd):**
```cmd
set HOST=0.0.0.0 && npm start
```

**PowerShell:**
```powershell
$env:HOST="0.0.0.0"; npm start
```

## 3. Accessing from Another Device

1.  Find your computer's IP address by running `ipconfig` in a terminal. Look for **IPv4 Address** (e.g., `192.168.1.5`).
2.  Ensure both Backend and Frontend are running as described above.
3.  On the other device (phone, laptop), open a browser.
4.  Go to: `http://<YOUR_IP_ADDRESS>:3000`

### Troubleshooting
- **Firewall**: If you cannot connect, check your Windows Firewall settings. Ensure `python` and `node` are allowed through the firewall for Private networks.
- **API Connection**: If the frontend loads but cannot fetch data, ensure the backend is running on `0.0.0.0:8000` and `ALLOWED_HOSTS` includes your IP.
