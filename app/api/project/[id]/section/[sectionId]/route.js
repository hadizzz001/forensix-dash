import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id, sectionId } = params;

  if (!id || !sectionId) {
    return new Response(JSON.stringify({ error: "Missing id or sectionId" }), { status: 400 });
  }

  try {
    // Find the project
    const project = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    // Filter out the section
    const updatedSections = project.sections.filter((s) => s.id !== sectionId);

    // Update the project with the new sections array
    await prisma.project.update({
      where: { id: id },
      data: { sections: updatedSections },
    });

    return new Response(JSON.stringify({ message: "Section deleted" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error deleting section" }), { status: 500 });
  }
}
