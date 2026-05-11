import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const collections = [
  ['project', prisma.project],
  ['blog', prisma.blog],
  ['order', prisma.order],
  ['work', prisma.work],
  ['banner', prisma.banner],
  ['about', prisma.about],
  ['aboutBanner', prisma.aboutBanner],
  ['look', prisma.look],
  ['why', prisma.why],
  ['hwork', prisma.hwork],
  ['availableDate', prisma.availableDate],
  ['appointment', prisma.appointment],
  ['look1', prisma.look1],
  ['why1', prisma.why1],
  ['hwork1', prisma.hwork1],
  ['team', prisma.team],
  ['part', prisma.part],
];

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}


function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value & 0xffff, 0);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

function getDosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  const now = new Date();
  const { dosDate, dosTime } = getDosDateTime(now);
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, 'utf8');
    const dataBuffer = Buffer.from(file.content, 'utf8');
    const checksum = crc32(dataBuffer);

    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(dataBuffer.length),
      uint32(dataBuffer.length),
      uint16(nameBuffer.length),
      uint16(0),
      nameBuffer,
    ]);

    localParts.push(localHeader, dataBuffer);

    centralParts.push(Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(dataBuffer.length),
      uint32(dataBuffer.length),
      uint16(nameBuffer.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      nameBuffer,
    ]));

    offset += localHeader.length + dataBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function getBackupFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `mongodb-backup-${timestamp}.zip`;
}

export async function GET() {
  try {
    const files = await Promise.all(collections.map(async ([name, model]) => {
      const rows = await model.findMany();
      const content = JSON.stringify(rows, null, 2);

      return {
        name: `${name}.json`,
        content,
      };
    }));

    const zip = createZip(files);

    return new Response(zip, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${getBackupFileName()}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Backup export failed:', error);

    return new Response(JSON.stringify({ error: 'Failed to export backup' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}