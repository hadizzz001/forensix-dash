/* eslint-disable */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const payload = {
  title: 'Our Approach',
  description:
    'At Forensix, we investigate financial irregularities with the rigor of forensic accountants, the discipline of auditors, and the precision of investigators. From suspicious transactions in government ministries to questionable expenditures in donor-funded programs, we look beyond the numbers to uncover how funds flow, where they disappear, and who is accountable. Our approach blends forensic accounting, data analytics, fund tracing, and investigative interviewing to deliver findings that are transparent, evidence-based, and defensible — enabling institutions to act with confidence, recover lost resources, and restore public and donor trust.',
  img: [],
};

async function main() {
  const existing = await prisma.look.findFirst();
  if (existing) {
    const updated = await prisma.look.update({ where: { id: existing.id }, data: payload });
    console.log('✅ Updated existing Look:', updated.id);
  } else {
    const created = await prisma.look.create({ data: payload });
    console.log('✨ Created Look:', created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
