import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Upload, FileSearch, Bot, BarChart3, History,
  Settings, HelpCircle, LogOut, Shield, Bell, Search,
  AlertTriangle, AlertCircle, CheckCircle2, X, Copy, Download,
  Trash2, Filter, Send, Zap, Lock, Activity, Target,
  ArrowRight, Eye, EyeOff, BookOpen, MessageSquare, Video,
  ThumbsUp, ThumbsDown, RefreshCw, ChevronDown, Menu, Key,
  User, FileText, TrendingUp, TrendingDown, Star, Check, Info,
  Palette, Database, Users, ServerCrash, Cpu, Globe,
  UserCheck, UserX, MoreHorizontal, ShieldCheck, ShieldAlert,
  BarChart2, ClipboardList, Crown, Sliders
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


import { Severity, SEV_CFG, SeverityBadge, ScoreRing, ProgressBar, Toggle } from '../shared/helpers';

export function AnalysisResults() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("latestAnalysis");
    if (raw) {
      try {
        setAnalysisData(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

  const analysisOptions = analysisData?.options || { quality: true, security: true, complexity: true };
  const issuesList = analysisData?.issues || [];
  const aiSummary = analysisData?.summary || "";

  const tabs = [
    { id: "overview", label: "Overview", count: issuesList.length },
    analysisOptions.quality ? { id: "quality", label: "Quality", count: issuesList.filter((i: any) => i.category === "quality").length } : null,
    analysisOptions.security ? { id: "security", label: "Security", count: issuesList.filter((i: any) => i.category === "security").length } : null,
    analysisOptions.complexity ? { id: "complexity", label: "Complexity", count: issuesList.filter((i: any) => i.category === "complexity").length } : null,
    { id: "ai", label: "AI Suggestions", count: null },
  ].filter(Boolean) as any[];

  const filtered = activeTab === "overview" || activeTab === "ai" ? issuesList : issuesList.filter((i: any) => i.category === activeTab);

  const criticalCount  = issuesList.filter((i: any) => i.severity === "Critical").length;
  const highCount      = issuesList.filter((i: any) => i.severity === "High").length;
  const mediumLowCount = issuesList.filter((i: any) => i.severity === "Medium" || i.severity === "Low").length;

  // If no real analysis data, show a clear "no data" state
  if (!analysisData) {
    return (
      <div className="p-8 min-h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
          <FileSearch className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-3">No analysis results yet</h2>
        <p className="text-[#64748B] text-sm max-w-md leading-relaxed">
          Upload a Python file first to see your analysis results here. The full breakdown of quality, security, and complexity issues will appear after your first scan.
        </p>
      </div>
    );
  }

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PyGuardian AI - Code Analysis", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Total issues summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Issues Found: ${issuesList.length}`, 14, 65);
    doc.text(`Critical Issues: ${criticalCount}`, 14, 72);
    doc.text(`High Issues: ${highCount}`, 14, 79);
    doc.text(`Medium/Low Issues: ${mediumLowCount}`, 14, 86);

    // AI Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI Analysis", 14, 105);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const splitSummary = doc.splitTextToSize(aiSummary, pageWidth - 28);
    doc.text(splitSummary, 14, 113);

    const yPos = 115 + (splitSummary.length * 5);

    // Issues Table
    autoTable(doc, {
      startY: yPos + 10,
      head: [['Severity', 'Category', 'File', 'Line', 'Title']],
      body: issuesList.map((i: any) => [
        i.severity,
        i.category.toUpperCase(),
        i.file,
        i.line.toString(),
        i.title
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', textColor: [255, 255, 255] },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const text = data.cell.text[0];
          if (text === 'Critical') data.cell.styles.fillColor = [239, 68, 68];
          else if (text === 'High') data.cell.styles.fillColor = [249, 115, 22];
          else if (text === 'Medium') data.cell.styles.fillColor = [245, 158, 11];
          else data.cell.styles.fillColor = [59, 130, 246];
        }
      }
    });

    // Detailed Findings
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Detailed Findings & Recommendations", 14, 20);

    let currentY = 30;
    issuesList.forEach((issue: any, index: number) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${index + 1}. ${issue.title} [${issue.severity}]`, 14, currentY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`File: ${issue.file} | Line: ${issue.line} | Tool: ${issue.tool}`, 14, currentY + 5);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);

      const descLines = doc.splitTextToSize(`Description: ${issue.description}`, pageWidth - 28);
      doc.text(descLines, 14, currentY + 12);

      const recLines = doc.splitTextToSize(`Recommendation: ${issue.recommendation}`, pageWidth - 28);
      doc.setTextColor(21, 128, 61); // green-700
      doc.text(recLines, 14, currentY + 14 + (descLines.length * 5));

      currentY += 22 + (descLines.length * 5) + (recLines.length * 5);
    });

    doc.save("PyGuardian_Analysis_Report.pdf");
  };

  return (
    <div className="p-8 space-y-8 min-h-full">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[#0F172A]">Analysis Results</h1><p className="text-[#64748B] text-sm mt-1">Analyzed just now</p></div>
        <button onClick={handleExportPDF} className="flex items-center gap-2 h-10 px-5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"><Download className="w-4 h-4" /> Export PDF</button>
      </div>

      {/* Issues Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        {[{ label: "Total Issues", value: issuesList.length.toString(), color: "text-[#0F172A]", bg: "bg-slate-50" }, { label: "Critical", value: criticalCount.toString(), color: "text-red-600", bg: "bg-red-50" }, { label: "High", value: highCount.toString(), color: "text-orange-600", bg: "bg-orange-50" }, { label: "Medium & Low", value: mediumLowCount.toString(), color: "text-amber-600", bg: "bg-amber-50" }].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-[#E2E8F0] p-4 text-center`}><div className={`text-3xl font-bold ${color} mb-1`}>{value}</div><div className="text-xs text-[#64748B] font-medium">{label}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="border-b border-[#E2E8F0] px-6 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`py-4 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-[#64748B] hover:text-[#0F172A]"}`}>
              {t.label}
              {t.count !== null && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === t.id ? "bg-blue-100 text-blue-700" : "bg-[#F1F5F9] text-[#64748B]"}`}>{t.count}</span>}
            </button>
          ))}
        </div>
        {activeTab === "ai" ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>
              <div><h4 className="font-bold text-[#0F172A] mb-1">PyGuardian AI Analysis</h4><p className="text-sm text-[#64748B] leading-relaxed">{aiSummary}</p></div>
            </div>
            {issuesList.map((issue: any) => (
              <div key={issue.id} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-3 mb-2"><SeverityBadge severity={issue.severity as Severity} /><span className="text-sm font-semibold text-[#0F172A]">{issue.title}</span><code className="text-xs font-mono text-[#64748B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded">{issue.file}:{issue.line}</code></div>
                <p className="text-sm text-[#64748B] leading-relaxed">{issue.recommendation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filtered.map((issue: any) => (
              <div key={issue.id} className="p-5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex-shrink-0">{issue.severity === "Critical" ? <AlertTriangle className="w-5 h-5 text-red-500" /> : issue.severity === "High" ? <AlertTriangle className="w-5 h-5 text-orange-500" /> : issue.severity === "Medium" ? <AlertCircle className="w-5 h-5 text-amber-500" /> : <Info className="w-5 h-5 text-blue-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1"><span className="font-semibold text-[#0F172A] text-sm">{issue.title}</span><SeverityBadge severity={issue.severity as Severity} /><span className="text-xs px-2 py-0.5 bg-[#F1F5F9] rounded-full text-[#64748B] font-mono">{issue.tool}</span></div>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono mb-2"><span>{issue.file}</span><span>•</span><span>Line {issue.line}</span></div>
                    <p className="text-sm text-[#64748B] leading-relaxed">{issue.description}</p>
                    {expandedIssue === issue.id && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-800">Recommendation</span></div>
                        <p className="text-sm text-green-700 leading-relaxed">{issue.recommendation}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                    className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200">
                    {expandedIssue === issue.id ? "Hide Fix" : "Quick Fix"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
