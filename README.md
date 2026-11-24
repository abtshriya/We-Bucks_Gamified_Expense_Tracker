# We-Bucks: Your Personal Expense Tracker

**CSA3426 Project Work**

We-Bucks is a gamified personal finance and expense tracking application built using **React.js, Vite, Python, Django REST Framework, and SQLite**.

The application helps users understand their spending habits by converting purchase costs into equivalent working hours, tracking emotional spending patterns, and monitoring recurring subscriptions.

---

## Features

- **Time-to-Earn Conversion:** Translates purchase costs into equivalent working hours based on the user's hourly wage.
- **Emotion Tagging:** Tracks the emotional context behind each expense, including Stressed, Celebrating, Bored, Hungry, Peer Pressure, Calm / Content, and Impulsive.
- **Subscription Value Rating:** Allows users to rate recurring subscriptions on a monthly scale of 1–10. Automatically flags subscriptions rated below 4 for two consecutive rated months for cancellation review.
- **Financial Dashboard:** Displays available balance, upcoming subscription commitments, spendable balance, monthly income, and emotional spending breakdowns.
- **Expense Ledger:** Records, searches, and filters daily expenses.
- **Gamification:** Includes XP progress, pixel-style visuals, coin animations, and an interactive alien assistant.
- **Sage Green Interface:** Retro-inspired interface using a sage green palette, pixel fonts, custom CSS, and Bootstrap components.

---

# Getting Started

Follow the instructions below to set up and run We-Bucks on your local machine.

## 1. Prerequisites

Before setting up the project, make sure the following software is installed.

| Software | Purpose |
|---|---|
| Python 3.x | Django backend development |
| Node.js | React frontend runtime and tooling |
| npm | Frontend dependency management |
| Git | Repository cloning and version control |
| Code Editor | VS Code or any preferred editor |

Check whether Python, Node.js, npm, and Git are installed:

```bash
python --version
node --version
npm --version
git --version
```

If a command is not recognized, install the corresponding software before continuing.

- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/downloads/
- VS Code: https://code.visualstudio.com/

## 2. Clone the Repository

Open a terminal and clone the project repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project directory:

```bash
cd We-Bucks
```

The project contains two main directories:

```text
We-Bucks/
│
├── backend/
│   ├── manage.py
│   ├── finance_backend/
│   └── tracker/
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
│
└── README.md
```

The backend and frontend are developed and executed separately.

---

# Backend Setup (Django + Django REST Framework)

The backend handles application logic, financial calculations, data processing, and API communication.

## 3. Navigate to the Backend

```bash
cd backend
```

## 4. Create a Python Virtual Environment

A virtual environment keeps the project's Python dependencies isolated from other Python projects.

Create the environment:

```bash
python -m venv venv
```

### Activate the Virtual Environment

**Windows (Command Prompt):**

```bash
venv\Scripts\activate
```

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

After activation, your terminal should display `(venv)`.

## 5. Install Backend Dependencies

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

If the project contains a `requirements.txt` file, install its dependencies:

```bash
pip install -r requirements.txt
```

If no requirements file is available, install the core Django dependencies:

```bash
pip install django djangorestframework django-cors-headers
```

Install any additional packages required by the project if they are not already included.

## 6. Database Migration

We-Bucks uses SQLite as its database.

Django migrations create and update the database tables based on the application's models.

Run:

```bash
python manage.py makemigrations
```

Then apply the migrations:

```bash
python manage.py migrate
```

This creates or updates the database file and its tables.

## 7. Optional: Create an Admin Account

To access Django's administration panel, create a superuser:

```bash
python manage.py createsuperuser
```

Follow the terminal instructions to configure the username, email, and password.

## 8. Optional: Load Sample Data

If the project includes the custom `seed_data` management command, execute:

```bash
python manage.py seed_data
```

This loads sample data for testing and demonstration purposes.

## 9. Start the Django Development Server

Run:

```bash
python manage.py runserver 127.0.0.1:8000
```

The backend should now be available at:

```text
http://127.0.0.1:8000/
```

The API endpoint is:

```text
http://127.0.0.1:8000/api/
```

Keep this terminal running while using the application.

---

# Frontend Setup (React + Vite)

The frontend is responsible for the user interface, navigation, interactive components, animations, and communication with the Django backend.

## 10. Open a New Terminal

Do not close the backend terminal.

Open another terminal window and navigate to the frontend directory:

```bash
cd We-Bucks/frontend
```

If you are already inside the project root, simply run:

```bash
cd frontend
```

## 11. Install Frontend Dependencies

Install the packages specified in `package.json`:

```bash
npm install
```

This installs the required dependencies, including React, Vite, Bootstrap, and other project packages.

## 12. Start the Vite Development Server

Run:

```bash
npm run dev
```

Vite will start the frontend development server.

Open the application in your browser:

```text
http://localhost:5173/
```

The frontend communicates with the Django backend through API requests.

---

# Running the Complete Application

To run We-Bucks, both servers must be active simultaneously.

| Component | Command | Local Address |
|---|---|---|
| Django Backend | `python manage.py runserver 127.0.0.1:8000` | `127.0.0.1:8000` |
| React Frontend | `npm run dev` | `localhost:5173` |

**Recommended workflow:**

1. Open Terminal 1 and start the Django backend.
2. Open Terminal 2 and start the React frontend.
3. Open `http://localhost:5173/` in your browser.
4. Start using We-Bucks.

The Vite development server proxies API requests to the Django backend at `http://127.0.0.1:8000/api/`.

---

# Running Tests

Django's built-in testing framework can be used to test the backend application.

Navigate to the backend directory, activate the virtual environment, and execute:

```bash
python manage.py test tracker
```

This runs the tests associated with the `tracker` application.

---

# Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Component-based frontend development |
| Vite | Frontend development server and build tool |
| Bootstrap 5 | Responsive layout and UI components |
| Custom CSS | Retro pixel-themed interface and styling |
| Python | Backend programming language |
| Django | Backend web framework |
| Django REST Framework | REST API development |
| SQLite | Relational database |
| Git | Version control |
| GitHub | Remote repository and project collaboration |

---

# Project Architecture

We-Bucks follows a frontend–backend architecture.

```text
                  WE-BUCKS APPLICATION
                          |
             +------------+------------+
             |                         |
        FRONTEND                    BACKEND
        React.js                    Django
        Vite                        REST API
             |                         |
             |      HTTP Requests      |
             +-------------------------+
                                       |
                                  SQLite Database
                                       |
                              Persistent Data Storage
```

### Frontend

The frontend handles user interactions and displays financial information through reusable React components.

### Backend

The Django backend processes API requests, performs calculations, validates information, and manages application logic.

### Database

SQLite stores user profile information, expenses, subscriptions, and subscription ratings.

---

# Troubleshooting

### 1. Python is not recognized

Make sure Python is installed and added to the system PATH.

On Windows, try:

```bash
py --version
```

You can also use `py` instead of `python` in the setup commands.

### 2. Virtual Environment Activation Error

If PowerShell blocks activation scripts, use Command Prompt:

```bash
venv\Scripts\activate
```

Alternatively, review your PowerShell execution policy settings.

### 3. Django Module Not Found

Make sure the virtual environment is activated and install the backend dependencies:

```bash
pip install -r requirements.txt
```

### 4. Database or Migration Errors

Run:

```bash
python manage.py makemigrations
python manage.py migrate
```

Make sure you are executing these commands from the `backend` directory.

### 5. Frontend Dependencies Missing

Navigate to the frontend directory and run:

```bash
npm install
```

### 6. Frontend Cannot Connect to Backend

Make sure the Django server is running at:

```text
http://127.0.0.1:8000/
```

Also verify that the frontend API proxy configuration points to the correct backend address.

---

# Academic Project Information

**Project Name:** We-Bucks – Your Personal Expense Tracker

**Course:** CSA3426 Project Work

**Project Type:** Full-Stack Web Application

**Frontend:** React.js + Vite

**Backend:** Python + Django REST Framework

**Database:** SQLite

**Purpose:** To encourage smarter financial decisions by connecting everyday spending with the time and effort required to earn money.

---

*We-Bucks – Spend smarter. Value your time. Level up your finances.*
