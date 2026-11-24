# We-Bucks: Your Personal Expense Tracker
CSA3426 Project Work

Personal finance and expense tracking application built with Django REST Framework and React.

## Features

- **Time-to-Earn Conversion**: Translates purchase costs into equivalent working hours based on your net hourly rate.
- **Emotion Tagging**: Tracks the emotional context behind each expense (Stressed, Celebrating, Bored, Hungry, Peer Pressure, Calm / Content, Impulsive) with dashboard spending breakdown.
- **Subscription Value Rating**: Monthly 1–10 value score for recurring services. Automatically flags subscriptions rated under 4 for two consecutive months for cancellation review.
- **Sage Green Interface**: Minimalist layout using a custom sage green palette, clean typography, and Bootstrap grid components.

## Getting Started

### Backend (Django)

```bash
cd backend
python manage.py migrate
python manage.py seed_data      # Optional sample data
python manage.py runserver 127.0.0.1:8000
```

Tests can be run with:
```bash
python manage.py test tracker
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Application runs locally at `http://localhost:5173/` and proxies API requests to `http://127.0.0.1:8000/api/`.
