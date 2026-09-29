"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Plus, Trash2, Eye, Send, FileText, Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { SendResult, ResumeMetadata } from "@/types";

type Target = { id: string; mail: string; company: string; type: "recruiter" | "careers" };

const DEFAULT_TEMPLATE = `Hi {{RECRUITER_NAME}},

I am reaching out to express my interest in engineering opportunities at {{COMPANY_NAME}}.

{{COMPANY_HIGHLIGHT}}

I'd love to connect and learn more about what you're building.

Best regards,
[Your Name]`;

export default function SendPage() {
  // Auth
  const [userId, setUserId]               = useState<string | null>(null);
  const [balance, setBalance]             = useState<number | null>(null);

  // Resume state
  const [savedResume, setSavedResume]     = useState<ResumeMetadata | null>(null);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Email compose
  const [template, setTemplate]           = useState(DEFAULT_TEMPLATE);
  const [targets, setTargets]             = useState<Target[]>([]);
  const [newMail, setNewMail]             = useState("");
  const [newCompany, setNewCompany]       = useState("");
  const [newType, setNewType]             = useState<"recruiter" | "careers">("recruiter");

  // Flow
  const [previews, setPreviews]           = useState<SendResult[]>([]);
  const [loading, setLoading]             = useState(false);
  const [sending, setSending]             = useState(false);
  const [step, setStep]                   = useState<"form" | "preview" | "done">("form");
  const [error, setError]                 = useState<string | null>(null);

  // ── Boot: load user, balance, saved resume ──────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);

      // Load balance
      (api.credits.balance(uid) as Promise<{ balance: number }>)
        .then(r => setBalance(r.balance))
        .catch(() => null);

      // Load saved resume (may 404 if none yet)
      api.profile.getResume(uid)
        .then(r => setSavedResume(r as ResumeMetadata))
        .catch(() => null);
    });
  }, []);

  // ── Resume actions ───────────────────────────────────────────────────────
  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setNewResumeFile(file); setResumeError(null); }
  };

  const saveResume = async () => {
    if (!userId || !newResumeFile) return;
    setUploadingResume(true); setResumeError(null);
    try {
      const meta = await api.profile.uploadResume(userId, newResumeFile);
      setSavedResume(meta);
      setNewResumeFile(null);
    } catch (e: unknown) {
      setResumeError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingResume(false);
    }
  };

  const removeResume = async () => {
    if (!userId) return;
    await api.profile.deleteResume(userId).catch(() => null);
    setSavedResume(null);
    setNewResumeFile(null);
  };

  // ── Targets ──────────────────────────────────────────────────────────────
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

  // ── Dry run ──────────────────────────────────────────────────────────────
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

  // ── Execute send ─────────────────────────────────────────────────────────
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

      // Prefer saved resume (storage path), fall back to new file upload
      if (savedResume) {
        form.append("resume_url", savedResume.path);
      } else if (newResumeFile) {
        form.append("resume", newResumeFile);
      }

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
  const hasResume  = !!savedResume || !!newResumeFile;
  const hasEnough  = balance !== null && balance >= creditCost;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Send Emails</h1>
          <p className="text-cream-300/55 text-sm mt-1">Upload resume · add targets · preview · send.</p>
        </div>
        {balance !== null && (
          <div className="text-right">
            <p className="text-2xl font-bold">{balance}</p>
            <p className="text-xs text-cream-300/40">credits</p>
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

          {/* Resume section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume (PDF)</label>

            {savedResume ? (
              /* Saved resume card */
              <div className="flex items-center gap-3 border border-green-800 bg-green-900/20/20 rounded-xl px-4 py-3">
                <FileText size={16} className="text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-300 font-medium truncate">{savedResume.filename}</p>
                  <p className="text-xs text-green-700">Saved · reused automatically across sends</p>
                </div>
                <a href={savedResume.signed_url} target="_blank" rel="noreferrer"
                  className="text-xs text-green-500 underline hover:text-green-300 transition">
                  Preview
                </a>
                <button onClick={removeResume}
                  className="text-cream-300/30 hover:text-red-400 transition ml-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Upload area */
              <>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={handleResumeSelect} />
                <div
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition",
                    newResumeFile ? "border-blue-800 bg-blue-950/20" : "border-cream-300/[0.08] hover:border-neutral-600"
                  )}
                >
                  {newResumeFile ? (
                    <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
                      <FileText size={16} /> {newResumeFile.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={20} className="text-cream-300/30" />
                      <p className="text-sm text-cream-300/40">Drop PDF or click to browse</p>
                      <p className="text-xs text-neutral-700">Save once · reuse in every send</p>
                    </div>
                  )}
                </div>
                {newResumeFile && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveResume}
                      disabled={uploadingResume}
                      className="flex items-center gap-2 text-xs bg-[#1A1915] hover:bg-neutral-700 border border-cream-300/[0.12] px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                    >
                      {uploadingResume
                        ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                        : <><Check size={12} /> Save resume</>}
                    </button>
                    <span className="text-xs text-cream-300/30">or it will be attached once without saving</span>
                  </div>
                )}
                {resumeError && <p className="text-xs text-red-400">{resumeError}</p>}
              </>
            )}
          </div>

          {/* Template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email template</label>
            <p className="text-xs text-cream-300/30">
              Placeholders:{" "}
              {["{{RECRUITER_NAME}}", "{{COMPANY_NAME}}", "{{COMPANY_HIGHLIGHT}}"].map(p => (
                <code key={p} className="text-cream-300/40 mr-2">{p}</code>
              ))}
            </p>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              rows={8}
              className="w-full bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2.5 text-sm text-cream-200 focus:outline-none focus:border-neutral-500 font-mono resize-y"
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
                className="flex-1 bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2 text-sm placeholder:text-cream-300/30 focus:outline-none focus:border-neutral-500"
              />
              <input
                value={newCompany} onChange={e => setNewCompany(e.target.value)}
                placeholder="Company name"
                className="w-36 bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2 text-sm placeholder:text-cream-300/30 focus:outline-none focus:border-neutral-500"
              />
              <select
                value={newType} onChange={e => setNewType(e.target.value as "recruiter" | "careers")}
                className="bg-[#13120E] border border-cream-300/[0.12] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              >
                <option value="recruiter">Recruiter</option>
                <option value="careers">Careers</option>
              </select>
              <button onClick={addTarget}
                className="bg-[#1A1915] hover:bg-neutral-700 border border-cream-300/[0.12] rounded-lg px-3 py-2 transition">
                <Plus size={16} />
              </button>
            </div>

            {targets.length > 0 && (
              <div className="border border-cream-300/[0.08] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-300/[0.08] bg-cream-300/[0.02]">
                      <th className="text-left px-4 py-2.5 text-xs text-cream-300/40 font-medium">Email</th>
                      <th className="text-left px-4 py-2.5 text-xs text-cream-300/40 font-medium">Company</th>
                      <th className="text-left px-4 py-2.5 text-xs text-cream-300/40 font-medium">Type</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map(t => (
                      <tr key={t.id} className="border-b border-cream-300/[0.08]/50 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-xs text-cream-200">{t.mail}</td>
                        <td className="px-4 py-2.5 text-cream-300/55">{t.company}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs border border-cream-300/[0.12] rounded px-2 py-0.5 text-cream-300/55">{t.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => removeTarget(t.id)} className="text-cream-300/30 hover:text-red-400 transition">
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
                className="flex items-center gap-2 border border-cream-300/[0.12] px-4 py-2 rounded-lg text-sm hover:border-cream-300/25 transition disabled:opacity-40">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                {loading ? "Generating previews…" : "Preview emails"}
              </button>
              <span className={cn(
                "text-xs",
                !hasEnough && balance !== null ? "text-yellow-500" : "text-cream-300/40"
              )}>
                {targets.length} email{targets.length > 1 ? "s" : ""} · {creditCost} credits
                {!hasResume && " · no resume attached"}
                {!hasEnough && balance !== null && " · insufficient credits"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-cream-300/55">{previews.length} email{previews.length > 1 ? "s" : ""} ready</p>
            <button onClick={() => setStep("form")} className="text-xs text-cream-300/40 hover:text-cream-200 underline">
              Edit targets
            </button>
          </div>

          {previews.map((p, i) => (
            <div key={i} className="border border-cream-300/[0.08] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-cream-300/[0.08] bg-cream-300/[0.02] flex items-center justify-between">
                <div>
                  <p className="text-xs text-cream-300/40">To</p>
                  <p className="text-sm font-mono text-cream-200">{p.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cream-300/40">Subject</p>
                  <p className="text-sm text-cream-200">{p.subject}</p>
                </div>
              </div>
              <pre className="px-4 py-4 text-xs text-cream-300/55 whitespace-pre-wrap font-sans leading-relaxed">{p.body}</pre>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button
              onClick={executeSend}
              disabled={sending || !hasEnough}
              className="flex items-center gap-2 bg-cream-300 text-[#0A0905] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-40"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "Sending…" : `Send all · ${creditCost} credits`}
            </button>
            {!hasEnough && balance !== null && (
              <a href="/credits" className="text-xs text-yellow-400 underline">Need more credits</a>
            )}
            {hasResume && (
              <p className="text-xs text-cream-300/30 flex items-center gap-1">
                <FileText size={11} />
                {savedResume?.filename ?? newResumeFile?.name} will be attached
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === "done" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {previews.filter(p => p.status === "sent").length}/{previews.length} emails sent ✓
          </h2>
          <div className="space-y-2">
            {previews.map((p, i) => (
              <div key={i} className="flex items-center gap-3 border border-cream-300/[0.08] rounded-lg px-4 py-3 text-sm">
                <span className={cn("w-2 h-2 rounded-full shrink-0",
                  p.status === "sent" ? "bg-green-500" : "bg-red-500")} />
                <span className="font-mono text-cream-200 truncate">{p.to}</span>
                <span className="ml-auto text-cream-300/40 text-xs truncate max-w-xs">{p.subject}</span>
                <span className={cn("text-xs shrink-0", p.status === "sent" ? "text-green-400" : "text-red-400")}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setStep("form"); setTargets([]); setPreviews([]); setError(null); }}
            className="border border-cream-300/[0.12] px-4 py-2 rounded-lg text-sm hover:border-cream-300/25 transition"
          >
            Send another batch
          </button>
        </div>
      )}
    </div>
  );
}
