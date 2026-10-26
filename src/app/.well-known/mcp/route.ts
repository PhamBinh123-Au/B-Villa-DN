import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/siteConfig';

export const dynamic = 'force-dynamic';

const MCP_SERVER_INFO = {
  name: 'b-villa-da-nang-mcp',
  version: '1.0.0',
  protocolVersion: '2024-11-05',
  description:
    'Model Context Protocol (MCP) server for B Villa Da Nang. Provides live tools to explore luxury villas, check availability, calculate rates, and query concierge details.',
  endpoints: {
    streamableHttp: 'https://b-villa-dn.vercel.app/.well-known/mcp',
    sse: 'https://b-villa-dn.vercel.app/api/mcp',
    docs: 'https://b-villa-dn.vercel.app/docs',
    manifest: 'https://b-villa-dn.vercel.app/.well-known/mcp',
  },
  capabilities: {
    tools: {
      listChanged: false,
    },
  },
};

const MCP_TOOLS = [
  {
    name: 'list_villas',
    description:
      'List all available luxury private pool villas at B Villa Da Nang with capacity, location, bedrooms, bathrooms, and starting rates.',
    inputSchema: {
      type: 'object',
      properties: {
        district: {
          type: 'string',
          enum: ['all', 'Son Tra', 'Ngu Hanh Son'],
          description: 'Filter by district in Da Nang (optional)',
        },
      },
    },
  },
  {
    name: 'get_villa_details',
    description:
      'Retrieve deep architectural details, bedroom configuration, pool specifications, address, and amenities for a specific villa.',
    inputSchema: {
      type: 'object',
      properties: {
        villa_id: {
          type: 'string',
          description:
            'The villa ID or code (e.g. "b1-villa-4pn", "b2-villa-4pn", "b3-villa-2pn", "b4-villa-4pn", or "B1", "B2", "B3", "B4")',
        },
      },
      required: ['villa_id'],
    },
  },
  {
    name: 'check_availability',
    description:
      'Check reservation availability for specified stay dates and villa selection.',
    inputSchema: {
      type: 'object',
      properties: {
        villa_id: {
          type: 'string',
          description: 'The villa ID or code',
        },
        check_in: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        check_out: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
      },
      required: ['villa_id', 'check_in', 'check_out'],
    },
  },
  {
    name: 'calculate_price',
    description:
      'Calculate the estimated total price in VND and USD for a stay based on villa, duration, and guests.',
    inputSchema: {
      type: 'object',
      properties: {
        villa_id: {
          type: 'string',
          description: 'The villa ID or code',
        },
        nights: {
          type: 'integer',
          description: 'Number of nights of the stay',
        },
        guests: {
          type: 'integer',
          description: 'Number of total guests',
        },
      },
      required: ['villa_id', 'nights'],
    },
  },
  {
    name: 'get_contact_info',
    description:
      'Get direct 24/7 concierge contact information, Hotline, WhatsApp link, Zalo link, and physical addresses.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function executeTool(name: string, args: Record<string, any> = {}) {
  switch (name) {
    case 'list_villas': {
      const filtered = siteConfig.villas.filter((v) => {
        if (!args.district || args.district === 'all') return true;
        return v.district.toLowerCase() === args.district.toLowerCase();
      });
      const result = filtered.map((v) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        nameVi: v.nameVi,
        district: v.district,
        bedrooms: v.bedrooms,
        bathrooms: v.bathrooms,
        maxGuests: v.maxGuests,
        poolType: v.poolType,
        location: v.location,
        basePriceVnd: v.bedrooms === 2 ? 1800000 : 3000000,
        basePriceUsd: v.bedrooms === 2 ? 72 : 120,
      }));
      return { villas: result, total: result.length };
    }

    case 'get_villa_details': {
      const queryId = (args.villa_id || '').toLowerCase().trim();
      const villa = siteConfig.villas.find(
        (v) =>
          v.id.toLowerCase() === queryId ||
          v.code.toLowerCase() === queryId ||
          v.id.toLowerCase().includes(queryId)
      );
      if (!villa) {
        return {
          error: `Villa '${args.villa_id}' not found. Available codes: B1, B2, B3, B4.`,
        };
      }
      return {
        villa: {
          id: villa.id,
          code: villa.code,
          name: villa.name,
          nameVi: villa.nameVi,
          district: villa.district,
          location: villa.location,
          mapUrl: villa.mapUrl,
          bedrooms: villa.bedrooms,
          bathrooms: villa.bathrooms,
          maxGuests: villa.maxGuests,
          maxAdults: villa.maxAdults,
          maxChildren: villa.maxChildren,
          poolType: villa.poolType,
          fullTitle: villa.fullTitle,
          basePriceVnd: villa.bedrooms === 2 ? 1800000 : 3000000,
          basePriceUsd: villa.bedrooms === 2 ? 72 : 120,
          amenities: [
            'Private Swimming Pool',
            'High-Speed Wi-Fi',
            'Full Kitchen & Refrigerator',
            'Garden BBQ Grill',
            'Air Conditioning in All Rooms',
            'Daily Housekeeping',
            'Free Private Parking',
          ],
        },
      };
    }

    case 'check_availability': {
      const queryId = (args.villa_id || '').toLowerCase().trim();
      const villa = siteConfig.villas.find(
        (v) =>
          v.id.toLowerCase() === queryId ||
          v.code.toLowerCase() === queryId ||
          v.id.toLowerCase().includes(queryId)
      );
      if (!villa) {
        return { error: `Villa '${args.villa_id}' not found.` };
      }
      return {
        villaId: villa.id,
        villaName: villa.name,
        checkIn: args.check_in,
        checkOut: args.check_out,
        isAvailable: true,
        status: 'Available for reservation inquiry',
        message:
          'Villa is open for booking. You may submit an inquiry or contact the concierge directly at +84 854 252 821.',
      };
    }

    case 'calculate_price': {
      const queryId = (args.villa_id || '').toLowerCase().trim();
      const villa = siteConfig.villas.find(
        (v) =>
          v.id.toLowerCase() === queryId ||
          v.code.toLowerCase() === queryId ||
          v.id.toLowerCase().includes(queryId)
      );
      const baseVnd = villa && villa.bedrooms === 2 ? 1800000 : 3000000;
      const baseUsd = villa && villa.bedrooms === 2 ? 72 : 120;
      const nights = Math.max(1, parseInt(args.nights, 10) || 1);
      const totalVnd = baseVnd * nights;
      const totalUsd = baseUsd * nights;

      return {
        villaId: villa ? villa.id : args.villa_id,
        nights,
        guests: args.guests || 'Not specified',
        nightlyRateVnd: baseVnd,
        nightlyRateUsd: baseUsd,
        totalEstimatedVnd: totalVnd,
        totalEstimatedUsd: totalUsd,
        currency: 'VND / USD',
        notes:
          'Rates include private swimming pool, daily housekeeping, Wi-Fi, and kitchen/BBQ amenities. Peak holiday dates may incur standard seasonal surcharges.',
      };
    }

    case 'get_contact_info': {
      return {
        brand: siteConfig.name,
        hotline: siteConfig.contact.phone,
        whatsapp: siteConfig.contact.whatsapp,
        zalo: siteConfig.social.zalo,
        email: siteConfig.contact.email,
        headquarters: siteConfig.contact.address,
        operatingHours: '24/7 Dedicated Concierge Support',
        officialChannels: {
          facebook: siteConfig.social.facebook,
          tiktok: siteConfig.social.tiktok,
        },
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// GET: Returns Manifest or handles SSE stream
export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') || '';

  // Streamable HTTP / Server-Sent Events (SSE) support
  if (accept.includes('text/event-stream')) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: endpoint\ndata: https://b-villa-dn.vercel.app/.well-known/mcp\n\n`
          )
        );
        controller.enqueue(
          encoder.encode(
            `event: message\ndata: ${JSON.stringify({
              jsonrpc: '2.0',
              method: 'serverInfo',
              params: MCP_SERVER_INFO,
            })}\n\n`
          )
        );
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Standard JSON Discovery Manifest
  return NextResponse.json(
    {
      ...MCP_SERVER_INFO,
      tools: MCP_TOOLS,
    },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}

// POST: Implements MCP JSON-RPC 2.0 protocol handshake & tool execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    // Validate JSON-RPC 2.0 structure
    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: id ?? null,
          error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
        },
        { status: 400 }
      );
    }

    // 1. Handshake: initialize
    if (method === 'initialize') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {
                listChanged: false,
              },
            },
            serverInfo: {
              name: MCP_SERVER_INFO.name,
              version: MCP_SERVER_INFO.version,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 2. Notification: notifications/initialized
    if (method === 'notifications/initialized') {
      return new NextResponse(null, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 3. Ping
    if (method === 'ping') {
      return NextResponse.json(
        { jsonrpc: '2.0', id, result: {} },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 4. Tools list
    if (method === 'tools/list') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            tools: MCP_TOOLS,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 5. Tool call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const output = executeTool(toolName, toolArgs);

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(output, null, 2),
              },
            ],
            isError: !!output.error,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Unhandled method
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error', data: err.message },
      },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
