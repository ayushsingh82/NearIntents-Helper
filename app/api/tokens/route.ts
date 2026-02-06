import { NextResponse } from 'next/server';

const TOKENS_URL = 'https://1click.chaindefuser.com/v0/tokens';

export async function GET() {
  try {
    const res = await fetch(TOKENS_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
