"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { cn, confidenceToColor } from "@/lib/utils";
import type { CausalNode, Simulation } from "@/lib/types";
import { X } from "lucide-react";

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  trigger: { bg: "#00D9FF15", border: "#00D9FF", text: "#00D9FF" },
  effect: { bg: "#7C3AED15", border: "#7C3AED", text: "#c4b5fd" },
  stakeholder: { bg: "#22c55e15", border: "#22c55e", text: "#86efac" },
  factor: { bg: "#f59e0b15", border: "#f59e0b", text: "#fcd34d" },
};

function CausalGraphNode({ data }: NodeProps) {
  const colors = NODE_COLORS[data.type] ?? NODE_COLORS.effect;
  return (
    <div
      className="px-3 py-2 rounded-xl border text-center max-w-[160px] cursor-pointer"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <p className="text-xs font-semibold" style={{ color: colors.text }}>
        {data.label}
      </p>
      <p className="text-[10px] opacity-60 mt-0.5 capitalize" style={{ color: colors.text }}>
        {data.type}
      </p>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  causal: CausalGraphNode,
};

function layoutNodes(
  nodes: CausalNode[]
): Array<{ id: string; x: number; y: number }> {
  const COLS = 4;
  const H_GAP = 220;
  const V_GAP = 120;

  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  const effectNodes = nodes.filter((n) => n.type === "effect");
  const stakeholderNodes = nodes.filter((n) => n.type === "stakeholder");
  const factorNodes = nodes.filter((n) => n.type === "factor");

  const result: Array<{ id: string; x: number; y: number }> = [];

  const addGroup = (group: CausalNode[], rowStart: number) => {
    group.forEach((n, i) => {
      result.push({ id: n.id, x: (i % COLS) * H_GAP, y: rowStart + Math.floor(i / COLS) * V_GAP });
    });
    return rowStart + Math.ceil(group.length / COLS) * V_GAP + 40;
  };

  let y = 0;
  y = addGroup(triggerNodes, y);
  y = addGroup(effectNodes, y);
  y = addGroup(stakeholderNodes, y);
  addGroup(factorNodes, y);

  return result;
}

interface Props {
  simulation: Simulation;
}

export function CausalGraphView({ simulation }: Props) {
  const [selectedNode, setSelectedNode] = useState<CausalNode | null>(null);

  const graph = simulation.causal_graph;

  const rfNodes: Node[] = useMemo(() => {
    if (!graph) return [];
    const positions = layoutNodes(graph.nodes);
    return graph.nodes.map((n) => {
      const pos = positions.find((p) => p.id === n.id) ?? { x: 0, y: 0 };
      return {
        id: n.id,
        type: "causal",
        position: { x: pos.x, y: pos.y },
        data: { ...n, onSelect: setSelectedNode },
      };
    });
  }, [graph]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!graph) return [];
    return graph.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.direction === "positive",
      style: {
        stroke:
          e.direction === "positive"
            ? "#00D9FF"
            : e.direction === "negative"
            ? "#ef4444"
            : "#f59e0b",
        opacity: Math.max(0.3, e.strength),
        strokeWidth: 1 + e.strength,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color:
          e.direction === "positive"
            ? "#00D9FF"
            : e.direction === "negative"
            ? "#ef4444"
            : "#f59e0b",
      },
      labelStyle: { fill: "#94a3b8", fontSize: 10 },
      labelBgStyle: { fill: "#111111", fillOpacity: 0.9 },
    }));
  }, [graph]);

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [edges, , onEdgesChange] = useEdgesState(rfEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const original = graph?.nodes.find((n) => n.id === node.id);
      setSelectedNode(original ?? null);
    },
    [graph]
  );

  if (simulation.status !== "completed" || !graph) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-text-muted text-sm">
          {simulation.status === "running" || simulation.status === "pending"
            ? "Causal graph is being constructed..."
            : "No causal graph available."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="glass rounded-xl p-3 mb-4 flex items-center gap-4 flex-wrap text-xs">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full border"
              style={{ background: colors.bg, borderColor: colors.border }}
            />
            <span className="capitalize text-text-secondary">{type}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-px bg-accent" />
            <span className="text-text-muted">positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-px bg-error" />
            <span className="text-text-muted">negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-px bg-warning" />
            <span className="text-text-muted">uncertain</span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="h-[600px] rounded-2xl border border-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1f1f1f"
          />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) =>
              NODE_COLORS[(node.data as CausalNode).type]?.border ?? "#1f1f1f"
            }
            maskColor="#05050580"
          />
        </ReactFlow>
      </div>

      {/* Node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-12 right-0 w-72 glass rounded-2xl p-5 shadow-glow z-20"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{
                    color: NODE_COLORS[selectedNode.type]?.text ?? "#f8fafc",
                  }}
                >
                  {selectedNode.label}
                </p>
                <p className="text-xs text-text-muted capitalize">{selectedNode.type}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary mb-3">{selectedNode.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Confidence</span>
              <span className={confidenceToColor(selectedNode.confidence)}>
                {Math.round(selectedNode.confidence * 100)}%
              </span>
            </div>
            {selectedNode.domain && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-text-muted">Domain</span>
                <span className="text-text-secondary capitalize">{selectedNode.domain}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
