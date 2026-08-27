import { PrismaClient } from "@prisma/client";
import { UNITS } from "../lib/units-config";

const prisma = new PrismaClient();

async function main() {
  for (const u of UNITS) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: {},
      create: {
        code: u.code,
        floor: u.floor,
        type: u.type,
        label: u.label,
        // Owner flat is never "vacant" in the rental sense, but we still
        // track it for electricity — mark it OCCUPIED by default.
        status: "VACANT",
      },
    });
  }
  console.log(`Seeded ${UNITS.length} units.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
