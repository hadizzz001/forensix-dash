import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

 
 

// Delete Project API
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await prisma.work.delete({ where: { id } });

    return new Response(JSON.stringify({ message: 'Project deleted successfully' }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete project' }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}






export async function GET(request, { params }) {
  const { id } = params;

  try {
    const categories1 = await prisma.work.findUnique({
      where: { id },
    });

    if (!categories1) {
      return new Response(JSON.stringify({ message: 'No blog found for the specified ID.' }), {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    return new Response(JSON.stringify(categories1), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}

// Update Blog API / Submit feedback
export async function PATCH(request, { params }) {
  const { id } = params;
  const { feedback } = await request.json(); // Only expecting feedback

  try {
    // Fetch the existing work item first
    const existing = await prisma.work.findUnique({ where: { id } });

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Work item not found' }), {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Merge feedback into existing data object
    const updatedData = { ...existing.data, feedback };

    const updatedWork = await prisma.work.update({
      where: { id },
      data: { data: updatedData }, // Only update the data field
    });

    return new Response(JSON.stringify(updatedWork), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error('Error updating work:', error);
    return new Response(JSON.stringify({ error: 'Failed to update work' }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
