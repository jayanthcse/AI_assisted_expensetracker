# AI Assisted Expense Tracker

## 1. Project Title
**AI Assisted Expense Tracker**

## 2. Project Description
A full-stack (MERN Stack) application designed for comprehensive personal and group finance management. Inspired by Splitwise, it offers robust group expense sharing with various split types, real-time balance tracking, and simplified settlements. Uniquely, it features an **AI-assisted bill scanning** capability using local OCR (Tesseract.js) to automatically extract transaction details from receipts. The application prioritizes privacy and security with JWT authentication and a clean, modern UI.

## 3. Features
- **User Authentication**: Secure Registration and Login using JWT (JSON Web Tokens).
- **Group Management**:
  - Create groups and add members by email.
  - **Expense Splitting**: Support for Equal, Exact Amount, and **Percentage** splits.
  - **Dynamic Balances**: Real-time calculation of "who owes who" (Net Balance).
- **Personal Finance Dashboard**:
  - Track personal Income and Expenses.
  - Visual Insights: Interactive Pie Charts and Activity Trend Graphs.
  - **Budget Alerts**: Email notifications when expenses exceed 80% of income.
- **AI Bill Scanning**:
  - Upload bill/receipt images.
  - **OCR Integration**: Extracts total amount and date using Tesseract.js.
  - Save scanned data directly to Personal or Group expenses.
- **Data Export**: Download transaction history as CSV.

## 4. Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Mongoose ODM).
- **Authentication**: JsonWebToken (JWT), BcryptJS.
- **OCR Engine**: Tesseract.js (running on Node.js).
- **Email Service**: Nodemailer.

## 5. Architecture Overview
- **Client-Server Model**: The Frontend (React) communicates with the Backend (Express) via RESTful APIs.
- **Stateless Authentication**: Protected routes use JWT passed in HTTP headers.
- **Database**: MongoDB serves as the persistent data store for Users, Groups, Expenses, and Personal Transactions.
- **OCR Processing**: Images are uploaded to the server (via Multer), processed locally by Tesseract.js, and then deleted after data extraction (privacy-focused).

## 6. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Connection URI

### Steps
1.  **Clone the repository**
    ```bash
    git clone https://github.com/jayanthcse/AI_assisted_expensetracker.git
    cd AI_assisted_expensetracker
    ```

2.  **Install Dependencies**
    *   **Backend**:
        ```bash
        cd backend
        npm install
        ```
    *   **Frontend**:
        ```bash
        cd ../frontend
        npm install
        ```

3.  **Configure Environment Variables**
    *   Navigate to the `backend` folder.
    *   Create a `.env` file (copy from `.env.example`).
    *   Fill in your credentials:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_uri
        JWT_SECRET=your_secret_key
        EMAIL_USER=your_email@gmail.com
        EMAIL_PASS=your_app_password
        ```

4.  **Run Locally**
    *   Start Backend:
        ```bash
        cd backend
        npm run dev
        ```
    *   Start Frontend (in a new terminal):
        ```bash
        cd frontend
        npm run dev
        ```

## 7. Deployment Notes
- **Frontend**: optimized for deployment on **Vercel** or **Netlify**.
- **Backend**: optimized for **Render**, **Heroku**, or **Railway**.
- **Database**: Use MongoDB Atlas for cloud hosting.

## 8. Future Improvements
- **Background Jobs**: Offload OCR processing to a background queue (e.g., BullMQ) for better performance.
- **Cloud Storage**: Integrate AWS S3 or Cloudinary for persistent bill image storage.
- **Push Notifications**: Real-time updates for group expenses.
- **Mobile App**: React Native adaptation.

