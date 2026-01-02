// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const db = new PrismaClient();

// async function main() {
//   console.log("🧹 Clearing existing data...");
//   await db.user.deleteMany();
//   await db.patientDocument.deleteMany();
//   await db.appointment.deleteMany();
//   await db.invoice.deleteMany();
//   await db.patient.deleteMany();

//   console.log("✅ Collections cleared!");

//   // -------- USERS --------
//   console.log("👤 Seeding users...");
//   await db.user.createMany({
//     data: [
//       {
//         name: "Sidi Elvaly",
//         email: "sidielvaly@gmail.com",
//         passwordHash: bcrypt.hashSync("pass123", 10),
//       },
//       {
//         name: "Khatu Ahmed",
//         email: "khatu@gmail.com",
//         passwordHash: bcrypt.hashSync("pass123", 10),
//       },
//     ],
//   });

//   // -------- PATIENTS --------
//   console.log("🧑‍⚕️ Seeding patients...");
//   const patients = await Promise.all(
//     Array.from({ length: 10 }).map((_, i) =>
//       db.patient.create({
//         data: {
//           name: `Patient ${i + 1}`,
//           email: `patient${i + 1}@mail.com`,
//           phone: `+222 44 44 44 ${i + 1}`,
//           idnum: `MRN-${1000 + i}`,
//           lastVisit: new Date(Date.now() - i * 86400000 * 5),
//           dob: new Date(1990, 1, i + 1),
//           status: i % 3 === 0 ? "HIGH" : i % 3 === 1 ? "MEDIUM" : "LOW",
//         },
//       })
//     )
//   );

//   // -------- APPOINTMENTS --------
//   console.log("📅 Seeding appointments...");
//   await Promise.all(
//     patients.slice(0, 6).map((p, i) =>
//       db.appointment.create({
//         data: {
//           patientId: p.id,
//           date: new Date(Date.now() + i * 86400000),
//           room: `Consultation ${i + 1}`,
//           type: i % 3 === 0 ? "CHECKUP" : i % 3 === 1 ? "FOLLOWUP" : "EMERGENCY",
//         },
//       })
//     )
//   );

//   // -------- INVOICES --------
//   console.log("💰 Seeding invoices...");
//   await Promise.all(
//     patients.slice(0, 2).map((p, i) =>
//       db.invoice.create({
//         data: {
//           patientId: p.id,
//           amount: 50 + i * 25,
//           dueDate: new Date(Date.now() + i * 86400000 * 3),
//           status: "PENDING",
//         },
//       })
//     )
//   );

//     await Promise.all(
//     patients.slice(0, 3).map((p, i) =>
//       db.invoice.create({
//         data: {
//           patientId: p.id,
//           amount: 50 + i * 25,
//           dueDate: new Date(Date.now() + i * 86400000 * 3),
//           status: "PAID",
//         },
//       })
//     )
//   );
  

//   console.log("✅✅ Seeding complete!");
// }

// main()
//   .catch((e) => console.error("❌ Seeding failed:", e))
//   .finally(() => db.$disconnect());


// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// async function main() {
//   console.log("Adding fake data...");

//   const patientNames = ["Alice Freeman", "Bob Wright", "Charlie Davis", "Diana Prince", "Edward Norton"];
//   const statuses = ["HIGH", "MEDIUM", "LOW"];
//   const apptTypes = ["CHECKUP", "FOLLOWUP", "EMERGENCY"];

//   for (let i = 0; i < patientNames.length; i++) {
//     await prisma.patient.create({
//       data: {
//         name: patientNames[i],
//         email: `patient${i}@example.com`,
//         status: i < 3 ? "HIGH" : "MEDIUM", // Ensure we get 3 High Risk for the dashboard
//         lastVisit: new Date(Date.now() - Math.random() * 1000000000),
//         appointments: {
//           create: [
//             {
//               date: new Date(Date.now() + Math.random() * 864000000), // Future dates
//               type: apptTypes[Math.floor(Math.random() * apptTypes.length)],
//               room: `Room ${100 + i}`,
//               status: "SCHEDULED",
//             }
//           ]
//         },
//         invoices: {
//           create: [
//             {
//               amount: Math.floor(Math.random() * 500) + 50,
//               status: "PENDING",
//               dueDate: new Date(Date.now() + 604800000),
//             }
//           ]
//         }
//       },
//     });
//   }

//   console.log("Success! Added 5 patients with appointments and invoices.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🛠️  Updating Alice, Bob, and friends with correct info...");

  const patientNames = ["Alice Freeman", "Bob Wright", "Charlie Davis", "Diana Prince", "Edward Norton"];

  for (let i = 0; i < patientNames.length; i++) {
    const name = patientNames[i];
    
    // 1. Find the existing patient by name or email
    const existingPatient = await prisma.patient.findFirst({
      where: { name: name }
    });

    if (existingPatient) {
      // 2. Update that specific patient using their ID
      await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          phone: `+222 44 44 00 0${i + 1}`, // Correct format
          idnum: `ENR-2026-00${i + 1}`,     // Correct enrollment format
        },
      });
      console.log(`✅ Updated: ${name}`);
    } else {
      console.log(`⚠️  Could not find ${name}, skipping...`);
    }
  }

  console.log("✨ All existing fake patients now have correct Phone and ID formats.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });