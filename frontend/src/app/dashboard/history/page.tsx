import { SimulationHistory } from "@/components/dashboard/simulation-history";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Simulation History" };

export default function HistoryPage() {
  return <SimulationHistory />;
}
