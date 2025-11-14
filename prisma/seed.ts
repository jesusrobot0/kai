import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create or update demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@kai.app" },
    update: {},
    create: {
      email: "demo@kai.app",
      name: "Demo User",
    },
  });

  console.log("✅ Demo user created/updated:");
  console.log(`   ID: ${demoUser.id}`);
  console.log(`   Email: ${demoUser.email}`);
  console.log(`   Name: ${demoUser.name}`);
  console.log("");
  console.log("💡 Copy this ID to use as DEMO_USER_ID:");
  console.log(`   ${demoUser.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
