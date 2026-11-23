import { useState } from "react";
import {
  BookOpen,
  MessageSquare,
  ChevronDown,
  Shield,
  FileText,
  ExternalLink,
  Copy,
  Check,
  X,
  Mail,
  Bot,
  AlertCircle,
  Info,
  Terminal,
  HelpCircle,
  ArrowRight,
  Code2,
} from "lucide-react";
import { FAQ_ITEMS } from "../shared/constants";

interface HelpCenterProps {
  onNavigate?: (tab: string) => void;
}

export function HelpCenter({ onNavigate }: HelpCenterProps = {}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeModal, setActiveModal] = useState<
    "docs" | "tools" | "guides" | "assistant" | "support" | "community" | null
  >(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("pygurdian@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const resourceCards = [
    {
      id: "docs" as const,
      icon: BookOpen,
      label: "API Documentation",
      desc: "Interactive OpenAPI & Swagger specs",
      color: "text-blue-600",
      bg: "bg-blue-50",
      actionText: "View Documentation",
    },
    {
      id: "tools" as const,
      icon: Shield,
      label: "Tool References",
      desc: "Pylint, Bandit & Radon guides",
      color: "text-purple-600",
      bg: "bg-purple-50",
      actionText: "View Tool Guides",
    },
    {
      id: "assistant" as const,
      icon: Bot,
      label: "AI Support Chat",
      desc: "Instant code & security assistance",
      color: "text-green-600",
      bg: "bg-green-50",
      actionText: "Open AI Assistant",
    },
    {
      id: "guides" as const,
      icon: FileText,
      label: "User Guide",
      desc: "Step-by-step analysis workflow",
      color: "text-amber-600",
      bg: "bg-amber-50",
      actionText: "Read User Guide",
    },
  ];

  return (
    <div className="p-8 max-w-5xl space-y-8 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Help Center</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Documentation, tool references, and technical support
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceCards.map(({ id, icon: Icon, label, desc, color, bg, actionText }) => (
          <button
            key={id}
            onClick={() => setActiveModal(id)}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left hover:shadow-md hover:border-blue-300 transition-all shadow-sm group flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-sm font-bold text-[#0F172A] mb-1">{label}</div>
              <div className="text-xs text-[#64748B] leading-relaxed">{desc}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#0F172A]">Frequently Asked Questions</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Common questions about analysis, security metrics, and data retention
            </p>
          </div>
          <HelpCircle className="w-5 h-5 text-[#94A3B8]" />
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={i} className="px-6">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-blue-600 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">{q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""
                    }`}
                />
              </button>
              {openFaq === i && (
                <div className="pb-5 -mt-2">
                  <p className="text-sm text-[#64748B] leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support & Community Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 text-center relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <h3 className="text-white font-bold text-xl mb-2">Still need help?</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Reach out to our technical administration team via email or consult the built-in AI
            Assistant for 24/7 automated code remediation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveModal("support")}
              className="flex items-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/20"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </button>
            <button
              onClick={() => setActiveModal("community")}
              className="flex items-center gap-2 h-10 px-5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <span>Join Community</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                Unavailable
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────── */}

      {/* 1. DOCUMENTATION MODAL */}
      {activeModal === "docs" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">PyGuardian AI Documentation</h3>
                  <p className="text-xs text-[#64748B]">System architecture and interactive API specs</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Platform Architecture
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  PyGuardian AI provides an enterprise static code analysis and security engine for
                  Python codebases. It combines three deterministic linters with Google Gemini AI
                  insights:
                </p>
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="text-xs font-bold text-[#0F172A]">Pylint</div>
                    <div className="text-[11px] text-[#64748B]">Quality (0–100%)</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="text-xs font-bold text-[#0F172A]">Bandit</div>
                    <div className="text-[11px] text-[#64748B]">Security (0–100%)</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="text-xs font-bold text-[#0F172A]">Radon</div>
                    <div className="text-[11px] text-[#64748B]">Complexity (0–100%)</div>
                  </div>
                </div>
              </div>

              {/* Live Interactive API Docs */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-900">
                      Interactive Backend API Documentation
                    </h5>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      The FastAPI backend serves full interactive Swagger UI documentation, allowing
                      you to explore schemas, test endpoints, and inspect authentication contracts.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="http://127.0.0.1:8000/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Swagger UI (/docs)
                  </a>
                  <a
                    href="http://127.0.0.1:8000/redoc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open ReDoc (/redoc)
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Core Backend Endpoints
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="p-2.5 flex items-center justify-between bg-slate-50">
                    <span className="font-mono font-semibold text-purple-700">POST /api/analyze</span>
                    <span className="text-[#64748B]">Executes Pylint, Bandit & Radon scan</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="font-mono font-semibold text-green-700">POST /api/analyses/save</span>
                    <span className="text-[#64748B]">Persists results to database history</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-slate-50">
                    <span className="font-mono font-semibold text-blue-700">POST /api/chat</span>
                    <span className="text-[#64748B]">AI Assistant conversational support</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="font-mono font-semibold text-amber-700">GET /api/users/me</span>
                    <span className="text-[#64748B]">Active user profile and subscription plan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOOL REFERENCES MODAL */}
      {activeModal === "tools" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Analysis Engines & Tools</h3>
                  <p className="text-xs text-[#64748B]">
                    Authoritative documentation for PyGuardian linters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Pylint */}
              <div className="p-4 border border-[#E2E8F0] rounded-xl hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Pylint</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                        Quality Engine
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      Checks PEP 8 compliance, identifies programming errors, warns about unused
                      variables, and suggests refactoring for cleaner, idiomatic Python code.
                    </p>
                  </div>
                  <a
                    href="https://pylint.pycqa.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Bandit */}
              <div className="p-4 border border-[#E2E8F0] rounded-xl hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Bandit</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                        Security Engine
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      Designed by the Python Security Foundation to find common security issues (e.g.,
                      SQL injection, hardcoded passwords, unsafe deserialization, shell injections) by
                      processing Abstract Syntax Trees (AST).
                    </p>
                  </div>
                  <a
                    href="https://bandit.readthedocs.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Radon */}
              <div className="p-4 border border-[#E2E8F0] rounded-xl hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Radon</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
                        Complexity Engine
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      Computes Cyclomatic Complexity (McCabe), raw structural metrics (LOC, LLOC, SLOC,
                      comments), and Maintainability Index scores to pinpoint difficult-to-maintain
                      code.
                    </p>
                  </div>
                  <a
                    href="https://radon.readthedocs.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. USER GUIDE MODAL */}
      {activeModal === "guides" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">PyGuardian User Guide</h3>
                  <p className="text-xs text-[#64748B]">Step-by-step workflow for scanning code</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A]">Upload or Paste Python Code</h5>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Navigate to <strong>Upload Code</strong>. Drag & drop a `.py` file (up to 1MB)
                      or paste Python code into the built-in syntax-highlighted editor.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A]">Configure Analysis Categories</h5>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Select which categories to run: Quality (Pylint), Security (Bandit), and Complexity
                      (Radon). Click <strong>Run Analysis</strong> to process the script.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A]">Review Independent Scores</h5>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Inspect independent Quality, Security, and Complexity scores (0–100%) and examine
                      line-by-line issue cards with severity ratings and fix suggestions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0F172A]">Export PDF Reports & Remediation</h5>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      Export reports as PDF or CSV from <strong>Reports</strong>. Use the{" "}
                      <strong>AI Assistant</strong> to generate refactored code snippets.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  Video tutorials are currently in production. This interactive text guide and the FAQ
                  provide complete documentation.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI SUPPORT ASSISTANT MODAL */}
      {activeModal === "assistant" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">AI Support Assistant</h3>
                  <p className="text-xs text-[#64748B]">Real-time Python code analysis chat</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#64748B]">
              <p className="leading-relaxed">
                PyGuardian AI features an integrated coding assistant powered by Google Gemini. You can
                ask it to:
              </p>
              <ul className="space-y-2 list-disc list-inside text-[#0F172A] font-medium">
                <li>Explain complex Bandit security alerts (e.g. SQL injection, AST findings)</li>
                <li>Refactor Pylint style warnings and code smells into clean code</li>
                <li>Suggest algorithmic optimizations to lower Radon cyclomatic complexity</li>
              </ul>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-[11px]">
                Available 24/7 directly inside your PyGuardian workspace.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              {onNavigate && (
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate("assistant");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Launch AI Assistant
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTACT SUPPORT MODAL */}
      {activeModal === "support" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Technical Support</h3>
                  <p className="text-xs text-[#64748B]">Contact the PyGuardian team</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#64748B] leading-relaxed">
                For administrative assistance, account inquiries, or bug reports, you can contact our
                support team directly at the configured system email address:
              </p>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-mono text-xs font-semibold text-[#0F172A] truncate">
                    pygurdian@gmail.com
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E2E8F0] hover:bg-slate-100 rounded-lg text-xs font-medium text-[#0F172A] transition-colors flex-shrink-0 shadow-sm"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="mailto:pygurdian@gmail.com?subject=PyGuardian%20AI%20Support%20Request"
                  className="flex items-center justify-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Open in Default Email Client
                </a>

                {onNavigate && (
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      onNavigate("assistant");
                    }}
                    className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-green-600" />
                    Ask AI Assistant Instead
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMMUNITY STATUS MODAL */}
      {activeModal === "community" && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Community Forums</h3>
                  <p className="text-xs text-[#64748B]">Platform availability notice</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" />
                Feature Currently Unavailable
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                There is currently no external public community forum, Discord server, or public chat
                room hosted for this deployment of PyGuardian AI.
              </p>
              <p className="text-xs text-[#64748B] leading-relaxed">
                For assistance, please contact the administrator via the support action or use the
                in-app AI Assistant for instant code troubleshooting.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => setActiveModal("support")}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
