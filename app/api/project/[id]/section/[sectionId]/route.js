import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ==========================
//        PATCH SECTION
// ==========================
export async function PATCH(req, { params }) {
  const { id, sectionId } = params;

  if (!id || !sectionId) {
    return new Response(JSON.stringify({ error: "Missing id or sectionId" }), { status: 400 });
  }

  try {
    const body = await req.json(); // fields to update

    // Fetch project
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    // Find the section
    const sectionIndex = project.sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      return new Response(JSON.stringify({ error: "Section not found" }), { status: 404 });
    }

    // Update section (merge old + new)
    const updatedSection = {
      ...project.sections[sectionIndex],
      ...body,
    };

    // Replace in array
    const updatedSections = [...project.sections];
    updatedSections[sectionIndex] = updatedSection;

    // Save update
    await prisma.project.update({
      where: { id },
      data: { sections: updatedSections },
    });

    return new Response(JSON.stringify({ message: "Section updated", section: updatedSection }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error updating section" }), { status: 500 });
  }
}

// ==========================
//        DELETE SECTION
// ==========================
export async function DELETE(req, { params }) {
  const { id, sectionId } = params;

  if (!id || !sectionId) {
    return new Response(JSON.stringify({ error: "Missing id or sectionId" }), { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    }

    const updatedSections = project.sections.filter(s => s.id !== sectionId);

    await prisma.project.update({
      where: { id },
      data: { sections: updatedSections },
    });

    return new Response(JSON.stringify({ message: "Section deleted" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error deleting section" }), { status: 500 });
  }
}
