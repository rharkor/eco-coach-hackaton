"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <Link href="/chat">
      <Button>Start</Button>
    </Link>
  );
}
