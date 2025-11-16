import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const projectId = params.id;
  const body = await req.json();

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      sections: {
        push: {
          id: crypto.randomUUID(),
          title: body.title,
          description: body.description,
          img: body.img
        }
      }
    }
  });

  return Response.json(updated);
}
