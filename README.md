# Dental Point Clinic - Digital Management System
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-4169E1?style=flat&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.0-0170FE?style=flat&logo=antdesign&logoColor=white)

A comprehensive digital management system for dental clinics in Romania, featuring patient registration, medical questionnaires, and doctor dashboard interfaces.
> **Note**: This project was developed with AI assistance as a learning and development tool, alongside traditional programming methods.

**Team Project**: Developed collaboratively with 3 colleagues:
- [elenamoglan](https://github.com/elenamoglan)
- [qduke](https://github.com/qduke)
- [MarcoRO04](https://github.com/MarcoRO04)

## Overview

Dental Point Clinic is a full-stack web application designed to streamline dental clinic operations in Romania through digital patient management, medical history tracking, and GDPR-compliant data handling.

## Tech Stack

**Frontend:**
- React 18 with Vite
- Ant Design UI components
- TailwindCSS for styling
- React Hook Form for form management
- Axios for API communication

**Backend:**
- Node.js with Express
- PostgreSQL database
- Data encryption for sensitive information
- RESTful API architecture

**Testing:**
- Jest for unit testing
- React Testing Library
- Test coverage for components and services

## Key Features

### Patient Interface
- Patient registration and login system
- Digital medical questionnaire (8 sections)
- Auto-fill functionality for returning patients
- Mobile-optimized tablet interface
- Multilingual support (Romanian)

### Doctor Interface
- Secure authentication for medical staff
- Real-time dashboard with statistics
- Patient profile management
- Medical risk assessment alerts
- Report generation system
- Patient search and filtering

### Data Security
- GDPR-compliant data processing
- Encrypted patient information
- Digital consent forms with signatures
- Secure authentication system

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bughi04/clinica-app.git
cd clinica-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
   - Create `.env` files in both backend and frontend directories
   - Configure database connection and API URLs

5. Initialize the database:
```bash
cd backend
npm run db:init
```

### Running the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:3001` (backend API).

## Testing

Run the test suite:
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Features in Detail

### Medical Questionnaire
- Comprehensive 8-section medical history form
- Patient information and referral tracking
- Dental examination records
- General health assessment
- Medical conditions tracking
- Data processing consent
- Multiple consent forms (general, pediatric, endodontic)

### Doctor Dashboard
- Patient statistics overview
- Risk distribution analysis
- Recent questionnaires tracking
- High-priority medical alerts
- Patient search functionality
- Report generation

### Security Features
- GDPR-compliant data handling
- Encrypted patient data
- Secure authentication
- Digital signature capture
- Audit trail for consents

## Demo Credentials

**Patient Login:**
- CNP: `5041129350010` (Demo Patient)

**Doctor Login:**
- Username: `dr.popescu`
- Password: `password123`

## Database Schema

The application uses a PostgreSQL database with the following main tables:
- `pacient` - Patient records
- `chestionar` - Medical questionnaires
- `date_medicale` - Dental records
- `boli` - Medical conditions
- `antecedente_medicale` - Medical history
- `user` - Authentication
- `dentist` - Doctor profiles

## API Documentation

The backend provides RESTful API endpoints for:
- Patient management (`/api/patients`)
- Questionnaires (`/api/questionnaires`)
- Authentication (`/api/auth`)
- Dashboard statistics (`/api/dashboard`)
- Reports generation (`/api/reports`)

## Acknowledgments

- Built with React and Node.js
- UI components from Ant Design
- Icons from Lucide React
- Developed with AI assistance for enhanced learning
