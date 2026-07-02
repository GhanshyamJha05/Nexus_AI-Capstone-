import { SimulationWorkspace } from "@/components/simulation/simulation-workspace";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Simulation Workspace" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SimulationPage({ params }: PageProps) {
  const { id } = await params;
  return <SimulationWorkspace simulationId={parseInt(id)} />;
}
