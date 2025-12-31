const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const file = path.join(__dirname, 'seed_plans.json');
  const raw = fs.readFileSync(file, 'utf-8');
  const plans = JSON.parse(raw);

  for (const p of plans) {
    const desc = Array.isArray(p.description) ? p.description : (p.description ? [p.description] : []);
    // Prisma upsert requires a unique field in `where`. The schema doesn't mark
    // `name` unique, so use findFirst + update/create to achieve idempotency.
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          price: p.price,
          oldPrice: p.oldPrice,
          billingPeriod: p.billingPeriod,
          description: desc,
          isPopular: p.isPopular,
          config: p.config,
        },
      });
      console.log(`Updated plan ${p.name}`);
    } else {
      await prisma.subscriptionPlan.create({
        data: {
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice,
          billingPeriod: p.billingPeriod,
          description: desc,
          isPopular: p.isPopular,
          config: p.config,
        },
      });
      console.log(`Created plan ${p.name}`);
    }
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
