/* eslint-disable */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed data for Forensix — a firm that investigates financial irregularities
 * from Government Offices to Global Aid Agencies.
 *
 * NOTE: Images are intentionally left empty (per request). You will add them.
 */

const aboutData = {
  title: 'About Us',
  description:
    "Forensix is a specialized forensic investigation and financial integrity firm dedicated to uncovering, analyzing, and resolving financial irregularities across the public and international aid sectors. From government ministries and state-owned enterprises to NGOs, donor-funded programs, and global aid agencies, we deliver independent, evidence-driven investigations that restore accountability and protect public and donor resources. Our multidisciplinary team combines forensic accounting, fraud examination, data analytics, and legal expertise to trace complex transactions, expose misappropriation, and produce court-admissible findings. We work discreetly, ethically, and in strict compliance with international standards, partnering with institutions that demand the truth — because every missing dollar represents a service not delivered, a program not completed, and a community left behind.",
  img: [],
};

const hworkData = {
  title: 'How It Works',
  description:
    'Our investigative approach is structured, transparent, and built on international forensic standards. From the first engagement to the final report, every step is designed to uncover the truth, preserve evidence, and deliver findings that stand up in boardrooms, donor reviews, and courts of law.',
  data: [
    {
      title: '1. Engagement & Scoping',
      img: '',
    },
    {
      title: '2. Evidence Collection & Preservation',
      img: '',
    },
    {
      title: '3. Forensic Analysis & Fund Tracing',
      img: '',
    },
    {
      title: '4. Reporting & Recovery Support',
      img: '',
    },
  ],
};

const whyData = {
  title: 'Why Choose Us',
  description:
    'Governments, donors, and global aid agencies choose Forensix because financial irregularities demand more than an audit — they demand an investigation. We combine forensic rigor, sector experience, and absolute independence to deliver answers that truly matter.',
  data: [
    {
      title: 'Proven Expertise in Public Sector & Donor-Funded Investigations',
      img: '',
    },
    {
      title: 'Independent, Objective & Confidential',
      img: '',
    },
    {
      title: 'Court-Admissible, Evidence-Driven Findings',
      img: '',
    },
    {
      title: 'Global Standards, Local Understanding',
      img: '',
    },
  ],
};

// Hwork1 page is titled "Edit Mission" → Mission
const missionData = {
  title: 'Our Mission',
  description:
    'To safeguard public resources and donor funds by exposing financial irregularities wherever they occur — from government offices to global aid agencies — through independent, evidence-based forensic investigations that restore accountability, deter fraud, and strengthen institutional integrity.',
  data: [
    {
      title: 'Uncover Financial Irregularities with Precision',
      img: '',
    },
    {
      title: 'Protect Public and Donor Resources',
      img: '',
    },
    {
      title: 'Strengthen Accountability & Governance',
      img: '',
    },
  ],
};

// Look1 page is titled "Edit Vision" → Vision
const visionData = {
  title: 'Our Vision',
  description:
    'To be the most trusted forensic investigation partner across Africa and beyond — the firm that governments, donors, and global aid agencies turn to when the truth behind the numbers must be found. We envision a world where every public dollar and every aid contribution reaches its intended purpose, and where financial misconduct has nowhere to hide.',
  img: [],
};

// Why1 page is titled "Edit Values" → Values
const valuesData = {
  title: 'Our Core Values',
  description:
    'Our work touches public trust, donor confidence, and the lives of the communities they serve. These values guide every engagement, every report, and every interaction at Forensix.',
  data: [
    {
      title: 'Integrity',
      img: '',
    },
    {
      title: 'Independence',
      img: '',
    },
    {
      title: 'Confidentiality',
      img: '',
    },
    {
      title: 'Accuracy & Evidence-Based Rigor',
      img: '',
    },
    {
      title: 'Accountability',
      img: '',
    },
  ],
};

async function upsertFirst(modelName, model, payload) {
  const existing = await model.findFirst();
  if (existing) {
    const updated = await model.update({
      where: { id: existing.id },
      data: payload,
    });
    console.log(`✅ Updated existing ${modelName} (${existing.id})`);
    return updated;
  }
  const created = await model.create({ data: payload });
  console.log(`✨ Created ${modelName} (${created.id})`);
  return created;
}

async function main() {
  console.log('🌱 Seeding Forensix content...\n');

  await upsertFirst('About', prisma.about, aboutData);
  await upsertFirst('Hwork (How It Works)', prisma.hwork, hworkData);
  await upsertFirst('Why (Why Choose Us)', prisma.why, whyData);
  await upsertFirst('Hwork1 (Mission)', prisma.hwork1, missionData);
  await upsertFirst('Look1 (Vision)', prisma.look1, visionData);
  await upsertFirst('Why1 (Values)', prisma.why1, valuesData);

  console.log('\n🎉 Seeding complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
