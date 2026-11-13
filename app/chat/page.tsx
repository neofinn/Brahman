import { Suspense } from "react";
import type { Metadata } from "next";
import { Chat } from "./Chat";

export const metadata: Metadata = { title: "Ask Brahman" };

export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}
