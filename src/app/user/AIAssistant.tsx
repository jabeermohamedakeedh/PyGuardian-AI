import { useState, useRef, useEffect } from "react";
import { Bot, Send, RefreshCw, ThumbsUp, ThumbsDown, Copy, Check, User, Trash2 } from "lucide-react";
import { authFetch } from "../shared/api";

interface Msg {
  id?: number;
  role: string;
  content: string;
  timestamp: string;
  feedback?: string | null;
}

export function AIAssistant({ user }: { user?: any }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyErrorKey, setCopyErrorKey] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState<number | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ index: number; text: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackNoticeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (feedbackNoticeTimeoutRef.current) clearTimeout(feedbackNoticeTimeoutRef.current);
    };
  }, []);

  // Load chat history from DB on mount
  useEffect(() => {
    if (!user?.id) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your PyGuardian AI Assistant. Ask me anything about Python! 🐍",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null
      }]);
      setLoading(false);
      return;
    }

    authFetch(`http://127.0.0.1:8000/api/chat/${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const loaded: Msg[] = data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            feedback: m.feedback ?? null
          }));
          setMessages(loaded);
        } else {
          setMessages([{
            role: "assistant",
            content: "Hello! I'm your PyGuardian AI Assistant. Ask me anything about Python! 🐍",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            feedback: null
          }]);
        }
      })
      .catch(() => {
        setMessages([{
          role: "assistant",
          content: "Hello! I'm your PyGuardian AI Assistant. Ask me anything about Python! 🐍",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          feedback: null
        }]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  async function saveMessage(role: string, content: string): Promise<{ id: number; created_at: string; feedback: string | null } | null> {
    if (!user?.id) return null;
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, role, content })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch { /* silent — chat still works offline */ }
    return null;
  }

  async function handleCopy(text: string, key: string) {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setCopyErrorKey(null);

    let success = false;
    try {
      if (navigator?.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      // Fallback for environments where navigator.clipboard is unavailable or rejected
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopiedKey(key);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedKey(prev => (prev === key ? null : prev));
      }, 2000);
    } else {
      setCopyErrorKey(key);
      errorTimeoutRef.current = setTimeout(() => {
        setCopyErrorKey(prev => (prev === key ? null : prev));
      }, 2500);
    }
  }

  async function handleFeedback(index: number, feedbackType: "positive" | "negative") {
    const targetMsg = messages[index];
    if (!targetMsg || targetMsg.role !== "assistant") return;

    // Prevent duplicate submission
    if (targetMsg.feedback === feedbackType) return;
    if (submittingFeedback === index) return;

    setSubmittingFeedback(index);
    const previousFeedback = targetMsg.feedback;

    // Optimistically update message in state
    setMessages(prev =>
      prev.map((m, idx) => (idx === index ? { ...m, feedback: feedbackType } : m))
    );

    if (feedbackNoticeTimeoutRef.current) clearTimeout(feedbackNoticeTimeoutRef.current);
    const noticeText = feedbackType === "positive" ? "Helpful · Thank you!" : "Recorded · Thank you!";
    setFeedbackNotice({ index, text: noticeText });
    feedbackNoticeTimeoutRef.current = setTimeout(() => {
      setFeedbackNotice(prev => (prev?.index === index ? null : prev));
    }, 2500);

    // Persist to backend if message has a DB id
    if (targetMsg.id && user?.id) {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/api/chat/${targetMsg.id}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: feedbackType })
        });
        if (!res.ok) {
          throw new Error("Failed to record feedback on server");
        }
      } catch {
        // Rollback optimistic state on failure
        setMessages(prev =>
          prev.map((m, idx) => (idx === index ? { ...m, feedback: previousFeedback } : m))
        );
        setFeedbackNotice({ index, text: "Failed to record feedback" });
        feedbackNoticeTimeoutRef.current = setTimeout(() => {
          setFeedbackNotice(prev => (prev?.index === index ? null : prev));
        }, 2500);
      } finally {
        setSubmittingFeedback(null);
      }
    } else {
      setSubmittingFeedback(null);
    }
  }

  async function send(text?: string) {
    const msg = text ?? input;
    if (!msg.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Msg = { role: "user", content: msg, timestamp: time };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Save user message to DB
    await saveMessage("user", msg);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await authFetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();

      // Save AI reply to DB to get its persisted ID
      const savedReply = await saveMessage("assistant", data.reply);

      const aiMsg: Msg = {
        id: savedReply?.id,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Msg = {
        role: "assistant",
        content: "Sorry, I couldn't reach the backend server. Please make sure it's running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setTyping(false);
    }
  }

  async function clearHistory() {
    if (!user?.id) return;
    try {
      await authFetch(`http://127.0.0.1:8000/api/chat/${user.id}`, { method: "DELETE" });
    } catch { }
    setMessages([{
      role: "assistant",
      content: "Chat history cleared! Ask me anything about Python! 🐍",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      feedback: null
    }]);
  }

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : null;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b border-[#E2E8F0] px-8 py-5 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#0F172A]">PyGuardian AI Assistant</div>
              <div className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Online · Python Expert
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              {user?.id && (
                <button onClick={clearHistory} title="Clear chat history"
                  className="w-9 h-9 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#64748B] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => send("Help me understand how to analyse Python code issues")}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#94A3B8] text-sm">Loading chat history…</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "assistant" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant"
                  ? <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md"><Bot className="w-4 h-4 text-white" /></div>
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                      {userInitials ? <span className="text-white text-xs font-bold">{userInitials}</span> : <User className="w-4 h-4 text-white" />}
                    </div>
                }
                <div className={`max-w-xl flex flex-col gap-1 ${msg.role === "assistant" ? "items-end" : "items-start"}`}>
                  <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-tl-sm shadow-sm"}`}>
                    {msg.content.includes("```") ? (
                      <div className="space-y-3">
                        {msg.content.split("```").map((part, pi) => {
                          if (pi % 2 === 1) {
                            const langMatch = part.match(/^([a-zA-Z0-9_-]+)\r?\n/);
                            const lang = langMatch ? langMatch[1] : "python";
                            const codeBody = part.replace(/^[a-zA-Z0-9_-]*\r?\n/, "");
                            const codeKey = `code-${i}-${pi}`;
                            const isCodeCopied = copiedKey === codeKey;
                            const isCodeError = copyErrorKey === codeKey;

                            return (
                              <div key={pi} className="bg-[#0F172A] rounded-lg p-4 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-slate-400 font-mono">{lang}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(codeBody, codeKey)}
                                    title={
                                      isCodeCopied
                                        ? "Copied code!"
                                        : isCodeError
                                        ? "Failed to copy"
                                        : "Copy code"
                                    }
                                    aria-label="Copy code snippet"
                                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                                  >
                                    {isCodeCopied ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[11px] text-emerald-400 font-sans font-medium">Copied</span>
                                      </>
                                    ) : isCodeError ? (
                                      <span className="text-[11px] text-red-400 font-sans font-medium">Failed</span>
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <pre className="text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">{codeBody}</pre>
                              </div>
                            );
                          }
                          return part ? <div key={pi} className="whitespace-pre-line">{part}</div> : null;
                        })}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{msg.content}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs text-[#94A3B8]">{msg.timestamp}</span>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5">
                        {/* Copy Entire Response */}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, `msg-${i}`)}
                          title={
                            copiedKey === `msg-${i}`
                              ? "Copied message!"
                              : copyErrorKey === `msg-${i}`
                              ? "Failed to copy"
                              : "Copy message"
                          }
                          aria-label="Copy assistant message"
                          className="w-5 h-5 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                        >
                          {copiedKey === `msg-${i}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <div className="h-3 w-[1px] bg-[#E2E8F0]" />
                        {/* Thumbs Up Feedback */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(i, "positive")}
                          disabled={msg.feedback === "positive" || submittingFeedback === i}
                          title={msg.feedback === "positive" ? "Marked as helpful" : "Helpful response"}
                          aria-label="Mark as helpful"
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            msg.feedback === "positive"
                              ? "text-green-600 bg-green-50 ring-1 ring-green-500/20 cursor-default"
                              : "text-[#94A3B8] hover:text-green-600 hover:bg-green-50/50"
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        {/* Thumbs Down Feedback */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(i, "negative")}
                          disabled={msg.feedback === "negative" || submittingFeedback === i}
                          title={msg.feedback === "negative" ? "Marked as unhelpful" : "Needs improvement"}
                          aria-label="Mark as unhelpful"
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            msg.feedback === "negative"
                              ? "text-red-600 bg-red-50 ring-1 ring-red-500/20 cursor-default"
                              : "text-[#94A3B8] hover:text-red-600 hover:bg-red-50/50"
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        {feedbackNotice?.index === i && (
                          <span className="text-[11px] font-medium text-slate-500 ml-1">
                            {feedbackNotice.text}
                          </span>
                        )}
                        {copyErrorKey === `msg-${i}` && (
                          <span className="text-[11px] font-medium text-red-500 ml-1">
                            Failed to copy
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1"><Bot className="w-4 h-4 text-white" /></div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#E2E8F0] p-6 bg-white flex-shrink-0">
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about Python, code issues, best practices…"
              className="flex-1 h-12 px-5 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            <button onClick={() => send()} disabled={!input.trim()}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {["How do I fix a syntax error?", "Explain SQL injection", "What is code complexity?", "Best practices for Python"].map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] rounded-lg transition-colors font-medium">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
