import type { Metadata } from "next";
import { ProfileView } from "./ProfileView";

export const metadata: Metadata = { title: "My details — Brahman" };

export default function ProfilePage() {
  return <ProfileView />;
}
