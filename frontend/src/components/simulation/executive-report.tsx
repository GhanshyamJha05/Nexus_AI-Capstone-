"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle,
  BarChart3,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";
import { confidenceToColor, riskToColor, cn } from "@/lib/utils";
import type { Report, Simulation } from "@/lib/types";

interface Props {
  simulation: Simulation;
}

export function ExecutiveReport({ simulation }: Props) {
  const [report, setReport] = useState<Report | null>(
    simulation.reports?.[0] ?? null
  );
  const [downloading, setDownloading] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generate(simulation.id),
    onSuccess: (resp) => {
      setReport(resp.data);
      toast.success("Executive report generated");
    },
    onError: () => toast.error("Failed to generate report"),
  });

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const url = reportsApi.getPdfUrl(simulation.id, report.id);
      const token = localStorage.getItem("nexus_access_token");
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("PDF generation failed");
      const blob = await resp.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `nexus-report-${simulation.id}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (simulation.status !== "completed") {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-text-muted text-sm">
          Executive report will be available once the simulation completes.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass rounded-2xl p-12 text-center space-y-4">
        <FileText className="w-12 h-12 text-text-muted mx-auto" />
        <div>
          <p className="text-text-primary font-medium">No report generated yet</p>
          <p className="text-text-muted text-sm mt-1">
            Generate a structured executive report from the simulation results.
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
        >
          Generate Executive Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Actions bar */}
      <div className="flex items-center justify-between glass rounded-xl p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-text-primary">{report.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
          >
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      {report.executive_summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Executive Summary
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {report.executive_summary}
          </p>
        </motion.div>
      )}

      {/* Key Findings */}
      {report.key_findings && report.key_findings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Key Findings
          </h3>
          <div className="space-y-3">
            {report.key_findings.map((finding, i) => (
              <div
                key={i}
                className="flex gap-4 p-3 rounded-xl bg-background/50"
              >
                <div className="flex-shrink-0 text-xs font-bold uppercase text-text-muted w-24 pt-0.5">
                  {finding.domain}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">{finding.finding}</p>
                </div>
                <div className="flex-shrink-0 text-xs font-bold">
                  <span className={confidenceToColor(finding.confidence)}>
                    {Math.round(finding.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Recommendations
          </h3>
          <ol className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm text-text-secondary">{rec.action}</p>
                  <span
                    className={cn(
                      "text-xs font-medium mt-0.5 inline-block",
                      rec.priority === "high" ? "text-error" : "text-warning"
                    )}
                  >
                    {rec.priority} priority
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* Risk Assessment */}
      {report.risk_assessment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Risk Assessment
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-text-secondary">Overall Risk:</span>
            <span
              className={cn(
                "text-sm font-bold capitalize px-3 py-1 rounded-lg",
                riskToColor(report.risk_assessment.level)
              )}
            >
              {report.risk_assessment.level}
            </span>
          </div>
          {report.risk_assessment.key_uncertainties.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">
                Key Uncertainties
              </p>
              <ul className="space-y-1">
                {report.risk_assessment.key_uncertainties.map((u, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-text-muted">•</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Confidence Overview */}
      {report.confidence_overview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Confidence by Domain
          </h3>
          <div className="space-y-2">
            {Object.entries(report.confidence_overview.by_agent).map(
              ([agent, confidence]) => (
                <div key={agent} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted capitalize w-28 flex-shrink-0">
                    {agent.replace("_", " ")}
                  </span>
                  <div className="flex-1 bg-card rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        confidence >= 0.7
                          ? "bg-success"
                          : confidence >= 0.5
                          ? "bg-accent"
                          : "bg-warning"
                      )}
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold w-10 text-right",
                      confidenceToColor(confidence)
                    )}
                  >
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Methodology */}
      {report.methodology && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Methodology
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">{report.methodology}</p>
        </motion.div>
      )}
    </div>
  );
}
