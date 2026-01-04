# SanaMed Clinical Dashboard

**SanaMed** is a comprehensive patient management system designed for modern healthcare facilities. It streamlines clinical workflows by integrating real-time patient tracking, medical record management, and intelligent document processing into a unified, secure interface.

## 🚀 Key Features

### Clinical Management
-   **Patient Profiles**: Centralized hub for demographics, contact info, and medical history.
-   **Admissions & Vitals**: Track patient visits, diagnoses, and vital signs trends over time.
-   **Medication Plans**: Manage active prescriptions and dosage schedules.
-   **Risk Assessment**: Automated risk stratification (Low/Medium/High) based on patient data.

### Document Intelligence
-   **Smart Storage**: Securely upload and organize medical reports (PDF/Images).
-   **Semantic Search**: Query patient documents using natural language to find specific medical history (e.g., "History of hypertension").
-   **Automated Extraction**: Extract key metadata from uploaded files automatically.

### Administration
-   **Dashboard Analytics**: High-level overview of clinic performance and patient statistics.
-   **Billing & Invoicing**: Integrated billing system for generating and tracking invoices.
-   **Multi-Language Support**: Full RTL support for Arabic interfaces.
-   **Security**: Role-based access control and secure authentication via NextAuth.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: MongoDB (via Prisma ORM)
-   **Authentication**: NextAuth.js
-   **AI/ML**: Custom semantic search and extraction endpoints.

## ⚙️ Getting Started

### Prerequisites
-   Node.js 18+
-   MongoDB instance (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SidiElvaly/front_app.git
    cd front_app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="mongodb://localhost:27017/sanamed"
    NEXTAUTH_SECRET="your-secure-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Setup Database:**
    Generate the Prisma client and seed the database with demo data:
    ```bash
    npx prisma generate
    npm run seed
    ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── api/             # Backend API routes
│   │   ├── auth/        # Authentication handlers (NextAuth)
│   │   ├── patients/    # Patient management endpoints
│   │   ├── profile/     # User profile endpoints
│   │   └── ...
│   ├── dashboard/       # Main application views
│   │   ├── patients/    # Patient list and details
│   │   ├── billing/     # Billing and invoices
│   │   ├── profile/     # User profile settings
│   │   └── rtl/         # RTL dashboard view
│   ├── signin/          # Authentication page
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
├── lib/                 # Utilities, database clients, and helpers
└── styles/              # Global styles (Tailwind imports)
prisma/
└── schema.prisma       
```
