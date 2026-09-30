import { PrismaClient } from '@prisma/client';
import { PAGE_BANNERS } from '../../constants';

const prisma = new PrismaClient();

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const banners = await prisma.pageBanner.findMany({ select: { page: true, img: true } });

    // The About banner used to live in its own collection; keep showing it until one is saved here.
    if (!banners.some((banner) => banner.page === 'about')) {
      const aboutBanner = await prisma.aboutBanner.findFirst();

      if (aboutBanner?.img) {
        banners.push({ page: 'about', img: aboutBanner.img });
      }
    }

    return new Response(JSON.stringify(banners), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error fetching page banners:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch page banners' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const img = Array.isArray(body.img) ? body.img[0] : body.img;

    if (!PAGE_BANNERS.some(({ page }) => page === body.page)) {
      return new Response(JSON.stringify({ error: 'Unknown page' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!img) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const updatedBanner = await prisma.pageBanner.upsert({
      where: { page: body.page },
      update: { img },
      create: { page: body.page, img },
    });

    return new Response(JSON.stringify(updatedBanner), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error updating page banner:', error);
    return new Response(JSON.stringify({ error: 'Failed to update page banner' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
