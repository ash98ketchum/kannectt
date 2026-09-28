"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Plus, Trash2, Eye, Send, FileText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { SendResult } from "@/types";

type Target = { id: string; mail: string; company: string; type: "recruiter" | "careers" };

const DEFAULT_TEMPLATE = `Hi {{RECRUITER_NAME}},

I am reaching out to express my interest in engineering opportunities at {{COMPANY_NAME}}.

{{COMPANY_HIGHLIGHT}}

I'd love to connect and learn more about what you're building.

Best regards,
[Your Name]`;

export default function SendPage() {
  const [resumeFile, setResumeFile]   = useState<File | null>(null);
  const [template, setTemplate]       = useState(DEFAULT_TEMPLATE);
  const [targets, setTargets]         = useState<Target[]>([]);
  const [newMail, setNewMail]         = useState("");
  const [newCompany, setNewCompany]   = useState("");
  const [newType, setNewType]         = useState<"recruiter" | "careers">("recruiter");
  const [previews, setPreviews]       = useState<SendResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [sending, setSending]         = useState(false);
  const [step, setStep]               = useState<"form" | "preview" | "done">("form");
  const [error, setError]             = useState<string | null>(null);
  const [balance, setBalance]         = useState<number | null>(null);
  const [userId, setUserId]           = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load current user + credit balance
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      (api.credits.balance(data.user.id) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);
    });
  }, []);

  const addTarget = () => {
    if (!newMail.trim()) return;
    setTargets(t => [...t, {
      id: Date.now().toString(),
      mail: newMail.trim(),
      company: newCompany.trim() || newMail.split("@")[1]?.split(".")[0] || "",
      type: newType,
    }]);
    setNewMail(""); setNewCompany("");
  };

  const removeTarget = (id: string) => setTargets(t => t.filter(x => x.id !== id));

  const dryRun = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.send.dryRun({
        targets: targets.map(({ mail, company, type }) => ({ mail, company, type })),
        template,
      }) as { results: SendResult[] };
      setPreviews(res.results);
      setStep("preview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  const executeSend = async () => {
    if (!userId) { setError("Not signed in"); return; }
    setSending(true); setError(null);
    try {
      const form = new FormData();
      form.append("template", template);
      form.append("targets_json", JSON.stringify(
        targets.map(({ mail, company, type }) => ({ mail, company, type }))
      ));
      form.append("user_id", userId);
      if (resumeFile) form.append("resume", resumeFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/send/execute`,
        { method: "POST", body: form }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const data = await res.json() as { results: SendResult[]; credits_remaining: number };
      setPreviews(data.results);
      setBalance(data.credits_remaining);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const creditCost = targets.length * 3;
  const hasEnough  = balance !== null && balance >= creditCost;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Send Emails</h1>
          <p className="text-neutral-400 text-sm mt-1">Upload resume, add targets, preview then send.</p>
        </div>
        {balance !== null && (
          <div className="text-right">
            <p className="text-2xl font-bold">{balance}</p>
            <p className="text-xs text-neutral-500">credits</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-red-900 bg-red-950/50 rounded-lg px-4 py-3 text-sm text-red-400">
          <AlertCircle size={14} /> {error}
          {error.includes("Insufficient") && (
            <a href="/credits" className="ml-auto underline text-red-300">Buy credits</a>
          )}
        </div>
      )}

      {/* ── FORM ── */}
      {step === "form" && (
        <div className="space-y-6">
          {/* Resume upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume (PDF)</label>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => setResumeFile(e.target.files?.[0] ?? null)} />
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition",
                resumeFile ? "border-green-800 bg-green-950/20" : "border-neutral-800 hover:border-neutral-600"
              )}
            >
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <FileText size={16} /> {resumeFile.name}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={20} className="text-neutral-600" />
                  <p className="text-sm text-neutral-500">Drop your resume PDF or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email template</label>
            <p className="text-xs text-neutral-600">Use <code className="text-neutral-500">{"{{RECRUITER_NAME}}"}</code>, <code className="text-neutral-500">{"{{COMPANY_NAME}}"}</code>, <code className="text-neutral-500">{"{{COMPANY_HIGHLIGHT}}"}</code></p>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              rows={8}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-mono resize-y"
            />
          </div>

          {/* Add targets */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Email targets</label>
            <div className="flex gap-2">
              <input
                value={newMail} onChange={e => setNewMail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTarget()}
                placeholder="recruiter@company.com"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
              <input
                value={newCompany} onChange={e => setNewCompany(e.target.value)}
                placeholder="Company name"
                className="w-36 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
              <select
                value={newType} onChange={e => setNewType(e.target.value as "recruiter" | "careers")}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              >
                <option value="recruiter">Recruiter</option>
                <option value="careers">Careers</option>
              </select>
              <button onClick={addTarget}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-3 py-2 transition">
                <Plus size={16} />
              </button>
            </div>

            {targets.length > 0 && (
              <div className="border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/50">
                      <th className="text-left px-4 py-2.5 text-xs text-neutral-500 font-medium">Email</th>
                      <th className="text-left px-4 py-2.5 text-xs text-neutral-500 font-medium">Company</th>
                      <th className="text-left px-4 py-2.5 text-xs text-neutral-500 font-medium">Type</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map(t => (
                      <tr key={t.id} className="border-b border-neutral-800/50 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-xs text-neutral-300">{t.mail}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{t.company}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs border border-neutral-700 rounded px-2 py-0.5 text-neutral-400">{t.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => removeTarget(t.id)} className="text-neutral-600 hover:text-red-400 transition">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {targets.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <button onClick={dryRun} disabled={loading}
                className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg text-sm hover:border-neutral-500 transition disabled:opacity-40">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                {loading ? "Generating previews…" : "Dry run — preview emails"}
              </button>
              <span className={cn("text-xs", !hasEnough && balance !== null ? "text-yellow-500" : "text-neutral-500")}>
                {targets.length} email{targets.length > 1 ? "s" : ""} · {creditCost} credits
                {!hasEnough && balance !== null && " · insufficient"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">{previews.length} email{previews.length > 1 ? "s" : ""} ready to review</p>
            <button onClick={() => setStep("form")} className="text-xs text-neutral-500 hover:text-neutral-300 transition underline">
              Edit targets
            </button>
          </div>

          {previews.map((p, i) => (
            <div key={i} className="border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500">To</p>
                  <p className="text-sm font-mono text-neutral-300">{p.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Subject</p>
                  <p className="text-sm text-neutral-300">{p.subject}</p>
                </div>
              </div>
              <pre className="px-4 py-4 text-xs text-neutral-400 whitespace-pre-wrap font-sans leading-relaxed">{p.body}</pre>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button
              onClick={executeSend}
              disabled={sending || !hasEnough}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-40"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "Sending…" : `Send all · ${creditCost} credits`}
            </button>
            {!hasEnough && balance !== null && (
              <a href="/credits" className="text-xs text-yellow-400 underline">Need more credits</a>
            )}
            <p className="text-xs text-neutral-500">Resume will be attached automatically</p>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === "done" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {previews.filter(p => p.status === "sent").length} / {previews.length} sent ✓
          </h2>
          <div className="space-y-2">
            {previews.map((p, i) => (
              <div key={i} className="flex items-center gap-3 border border-neutral-800 rounded-lg px-4 py-3 text-sm">
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  p.status === "sent" ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="font-mono text-neutral-300 truncate">{p.to}</span>
                <span className="ml-auto text-neutral-500">{p.subject}</span>
                <span className={cn("text-xs", p.status === "sent" ? "text-green-400" : "text-red-400")}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setStep("form"); setTargets([]); setPreviews([]); }}
            className="border border-neutral-700 px-4 py-2 rounded-lg text-sm hover:border-neutral-500 transition"
          >
            Send another batch
          </button>
        </div>
      )}
    </div>
  );
}
