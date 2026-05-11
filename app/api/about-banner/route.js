import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_ABOUT_BANNER = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80';

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function getOrCreateAboutBanner() {
  const currentBanner = await prisma.aboutBanner.findFirst();

  if (currentBanner) {
    return currentBanner;
  }

  return prisma.aboutBanner.create({
    data: { img: DEFAULT_ABOUT_BANNER },
  });
}


export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const banner = await getOrCreateAboutBanner();

    return new Response(JSON.stringify(banner), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error fetching about banner:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch about banner' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const img = Array.isArray(body.img) ? body.img[0] : body.img;

    if (!img) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const currentBanner = await getOrCreateAboutBanner();
    const updatedBanner = await prisma.aboutBanner.update({
      where: { id: currentBanner.id },
      data: { img },
    });

    return new Response(JSON.stringify(updatedBanner), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error updating about banner:', error);
    return new Response(JSON.stringify({ error: 'Failed to update about banner' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}