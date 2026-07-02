import { SettingsPage } from "@/components/dashboard/settings-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function Settings() {
  return <SettingsPage />;
}
