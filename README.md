# Store Rating Web Application

A full-stack store rating platform built for the **FullStack Intern Coding Challenge**. The application allows users to register, browse registered stores, and submit or modify ratings ranging from **1 to 5 stars**. The system features role-based access control (RBAC) across three distinct user roles: **System Administrator**, **Normal User**, and **Store Owner**.

---

## 🛠️ Tech Stack

- **Backend**: Node.js & Express.js (ES Modules, REST API architecture)
- **Database**: PostgreSQL (`store_rating_db` with `pg` connection pool)
- **Frontend**: React.js 18 (Vite, Tailwind CSS, Lucide Icons, React Router v6, Axios)
- **Security & Auth**: JSON Web Tokens (JWT), Bcrypt password hashing, RBAC middleware

---

## 📋 Features by User Role

### 1. 🛡️ System Administrator
- **Dashboard Metrics**:
  - Total number of registered users
  - Total number of registered stores
  - Total number of submitted ratings
- **Stores Management**:
  - View all stores with Name, Email, Address, Overall Rating, and assigned Store Owner.
  - Add new stores (Name, Email, Address, and assign an existing Store Owner).
  - Filter stores by Name, Email, and Address.
  - Sort stores (Ascending / Descending) on Name, Email, Address, and Rating.
- **Users Management**:
  - View all users (Name, Email, Address, Role).
  - Add new users with: Name, Email, Password, Address, and Role (`ADMIN`, `USER`, `STORE_OWNER`).
  - Filter users by Name, Email, Address, and Role.
  - Sort users (Ascending / Descending) on Name, Email, Address, and Role.
  - **User Details Modal**: View comprehensive details of any user. If the user is a **Store Owner**, their assigned store name, address, and overall store rating are displayed.
- **Authentication**: Secure Login and Logout.

---

### 2. 👤 Normal User
- **Sign Up**:
  - Dedicated public registration page.
  - Form fields: `Name`, `Email`, `Address`, `Password`, `Confirm Password`.
  - **Live validations**:
    - Name: Min 20 characters, Max 60 characters (includes real-time counter).
    - Address: Max 400 characters (includes counter).
    - Password: 8–16 characters, at least 1 uppercase letter, at least 1 special character (includes live checklist).
    - Email: Standard email format validation.
- **Store Browsing & Search**:
  - View list of all registered stores.
  - Real-time search for stores by **Name** and **Address**.
  - Sort store directory by Name, Address, Overall Rating, and My Rating.
  - Store listings display:
    - Store Name
    - Address
    - Overall Average Rating (interactive star icons + numeric score)
    - User's Submitted Rating (or "Not rated yet")
    - Action button: **"Submit Rating"** or **"Modify Rating"**
- **Ratings**:
  - Interactive modal with clickable stars (1 to 5) to rate or update existing rating.
- **Profile**: Update password after logging in.
- **Authentication**: Login and Logout.

---

### 3. 🏪 Store Owner
- **Dashboard**:
  - Overview of assigned store (Store Name, Email, Address).
  - High-visibility **Average Store Rating** card (e.g. `4.5 / 5.0 ★`) and total review count.
  - Table of customers who submitted reviews: Customer Name, Email, Address, Rating given, Date submitted.
  - Sort review listings (Ascending / Descending) on Customer Name, Email, Rating, and Date.
- **Profile**: Update password after logging in.
- **Authentication**: Login and Logout.

---

## 🔒 Form Validations Enforced

Both the **Frontend** and **Backend** strictly enforce the following rules:

| Field | Rule |
| :--- | :--- |
| **Name** | Minimum 20 characters, Maximum 60 characters. |
| **Address** | Maximum 400 characters. |
| **Password** | 8 to 16 characters, must include at least 1 uppercase letter and 1 special character. |
| **Email** | Valid RFC 5322 email format. |
| **Rating** | Integer between 1 and 5 (inclusive). |

---

## 🔑 Demo Login Accounts

Pre-seeded accounts are provided for instant evaluation:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@storerating.com` | `Password@123` | Full administrative controls |
| **Normal User** | `alexander@consumer.com` | `Password@123` | Can browse & rate stores |
| **Store Owner** | `owner1@dundermifflin.com` | `Password@123` | Owner of Dunder Mifflin Paper Co |

*(Note: The login page also features **1-click quick fill buttons** to test any role instantly).*

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL service running on port 5432

### 1. Database Configuration
Ensure PostgreSQL is running. Create the database:
```sql
CREATE DATABASE store_rating_db;
```
*(The backend automatically creates all required tables and seeds initial sample data on its first run).*

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application runs on `http://localhost:3000`.

---

## 🗄️ Database Architecture

- **`users` Table**: `id` (PK), `name` (VARCHAR 60), `email` (VARCHAR 255 UNIQUE), `password_hash`, `address` (VARCHAR 400), `role` (`ADMIN`, `USER`, `STORE_OWNER`), `created_at`, `updated_at`.
- **`stores` Table**: `id` (PK), `name` (VARCHAR 60), `email` (VARCHAR 255 UNIQUE), `address` (VARCHAR 400), `owner_id` (FK -> `users.id`), `created_at`, `updated_at`.
- **`ratings` Table**: `id` (PK), `user_id` (FK -> `users.id`), `store_id` (FK -> `stores.id`), `rating` (INT 1-5), `created_at`, `updated_at`.
  - Composite Unique Constraint: `UNIQUE (user_id, store_id)` ensures a user can only have one rating per store, which updates on subsequent submissions.
