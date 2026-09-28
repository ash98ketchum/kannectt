"use client";

import { useState, useRef } from "react";
import { Upload, Plus, Trash2, Eye, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Target = { id: string; mail: string; company: string; type: "recruiter" | "careers" };
type Preview = { to: string; subject: string; body: string; status: string };

export default function SendPage() {
  const [resumeName, setResumeName]   = useState<string | null>(null);
  const [targets, setTargets]         = useState<Target[]>([]);
  const [newMail, setNewMail]         = useState("");
  const [newCompany, setNewCompany]   = useState("");
  const [newType, setNewType]         = useState<"recruiter" | "careers">("recruiter");
  const [previews, setPreviews]       = useState<Preview[]>([]);
  const [loading, setLoading]         = useState(false);
  const [step, setStep]               = useState<"form" | "preview">("form");
  const fileRef = useRef<HTMLInputElement>(null);

  const addTarget = () => {
    if (!newMail) return;
    setTargets(t => [...t, {
      id: Date.now().toString(), mail: newMail,
      company: newCompany || newMail.split("@")[1].split(".")[0],
      type: newType,
    }]);
    setNewMail(""); setNewCompany("");
  };

  const removeTarget = (id: string) => setTargets(t => t.filter(x => x.id !== id));

  const dryRun = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setPreviews(targets.map(t => ({
      to: t.mail,
      subject: `Application for Forward Deployed Engineer at ${t.company}`,
      body: `Hi Hiring Team,\n\nI am reaching out to express my interest in the Forward Deployed Engineer role at ${t.company}...\n\n[Full personalised email will appear here after LLM generation]\n\nBest regards,\nAnirudh Chauhan`,
      status: "preview",
    })));
    setStep("preview");
    setLoading(false);
  };

  const creditCost = targets.length * 3;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Send Emails</h1>
        <p className="text-neutral-400 text-sm mt-1">Upload resume, add targets, preview then send.</p>
      </div>

      {step === "form" && (
        <div className="space-y-6">
          {/* Resume upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume</label>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => setResumeName(e.target.files?.[0]?.name ?? null)} />
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition",
                resumeName ? "border-green-800 bg-green-950/20" : "border-neutral-800 hover:border-neutral-600"
              )}
            >
              {resumeName ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <FileText size={16} /> {resumeName}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={20} className="text-neutral-600" />
                  <p className="text-sm text-neutral-500">Drop your resume PDF or click to browse</p>
                </div>
              )}
            </div>
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

            {/* Target list */}
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

          {/* Actions */}
          {targets.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <button onClick={dryRun} disabled={loading}
                className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg text-sm hover:border-neutral-500 transition disabled:opacity-40">
                <Eye size={14} />
                {loading ? "Generating previews..." : "Dry run — preview emails"}
              </button>
              <span className="text-xs text-neutral-500">
                {targets.length} email{targets.length > 1 ? "s" : ""} · {creditCost} credits
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preview step */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">{previews.length} email{previews.length > 1 ? "s" : ""} ready to send</p>
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
            <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition">
              <Send size={14} />
              Send all · {creditCost} credits
            </button>
            <p className="text-xs text-neutral-500">Resume will be attached automatically</p>
          </div>
        </div>
      )}
    </div>
  );
}
