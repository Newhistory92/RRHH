import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
 console.log(`Fetching details for employee ID: ${id}`); // Debugging log
  try {
    const res = await fetch(`http://127.0.0.1:8000/employee/${encodeURIComponent(id)}`, {
      // No cache: siempre queremos el detalle actual
      cache: 'no-store',
    });

    const text = await res.text();
    // Propagar el status del backend para debugging más claro
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 502 },
    );
  }
}

