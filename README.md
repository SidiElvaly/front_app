# 🏥 SanaMed Clinic Dashboard

A modern clinic management dashboard built with:

✅ **Next.js App Router**  
✅ **MongoDB (Prisma + MongoDB adapter)**  
✅ **NextAuth Authentication**  
✅ **Real-time Patient, Billing & Appointment Data**  
✅ **Profile Management & Password Change**  
✅ **RTL Arabic Dashboard Support**  
✅ **Seeder Script for Demo Data**

---

## 📦 Features

### ✅ Core Modules
- Patient Management
- Patient Risk Levels (LOW / MEDIUM / HIGH)
- Appointment Tracking
- Billing & Invoice System
- Document Storage
- Dashboard Analytics
- RTL Arabic Dashboard

### ✅ User Features
- Login / Logout (NextAuth)
- Profile Editing
- Avatar Upload
- Change Password

### ✅ Developer Features
- MongoDB Integration
- Prisma ORM
- API Routes
- Seed Data Script
- Modular & Clean File Structure

---

## ✅ 3️⃣ Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

---

## ✅ 4️⃣ Environment Variables

Create a file:

```
.env
```

Paste:

```
DATABASE_URL="YOUR_MONGODB_CONNECTION_STRING"
NEXTAUTH_SECRET="YOUR_RANDOM_SECRET"
NEXTAUTH_URL="http://localhost:3000"
```

### 🔹 MongoDB Example
```
DATABASE_URL="mongodb://127.0.0.1:27017/sanamed?replicaSet=rs0"

```

---

## ✅ 5️⃣ Prisma Setup

### Generate Prisma Client

```bash
npx prisma generate
```


---

## ✅ 6️⃣ Seed Demo Data

This inserts demo users, patients, documents & invoices.

```bash

npm run seed
```

✅ After running, your dashboard will show real data.

---

## ✅ 7️⃣ Run the App

```bash
npm run dev
```

Go to:

👉 http://localhost:3000

---

## ✅ 8️⃣ Login Credentials (Demo)

| Email | Password |
|-------|----------|
| sidielvaly@gmail.com | pass123 |
| khatu@gmail.com | pass123 |

---

## ✅ 9️⃣ File Structure

```
src/
 ├─ app/
 │   ├─ dashboard/
 │   │   ├─ page.tsx
 │   │   ├─ billing/
 │   │   ├─ rtl/
 │   │   └─ profile/
 │   ├─ api/
 │   │   ├─ dashboard/
 │   │   ├─ invoices/
 │   │   ├─ profile/
 │   │   └─ auth/
 │   └─ signin/
 ├─ lib/
 │   ├─ db.ts
 │   ├─ auth.ts
 │   └─ utils.ts
 ├─ components/
 └─ prisma/
     └─ schema.prisma
```

---

## ✅ 10️⃣ API Endpoints

### Dashboard
```
GET /api/dashboard
```

### Patients
```
GET /api/patients
POST /api/patients
```

### Invoices
```
GET /api/invoices
```

### Profile
```
GET /api/profile
PUT /api/profile
```

### Auth
```
/api/auth/[...nextauth]
```

---

## ✅ 11️⃣ Deployment Notes

Just make sure:

✅ `DATABASE_URL` is set  
✅ Prisma is built (`npx prisma generate`)  

---

## ✅ 12️⃣ Troubleshooting

### ❌ Prisma "client not found"
```bash
npx prisma generate
```

### ❌ MongoDB connection error
Check `DATABASE_URL` in `.env`

### ❌ Empty dashboard data
Run:
```bash
node prisma/seed.js
```


## ✅ Done ✅

Your project is now:

✅ Installable  
✅ Documented  
✅ Ready for other developers  
✅ Production-friendly
