import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { action } = (await req.json()) as { action: string };

  // Simulate an API call or action
  if (action === "super-ecolo") {
    process.exit(0);
  }
  return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
}
