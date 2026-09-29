"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, Gift } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { api } from "@/lib/api";

/* ─── Disposable / temp email domain blocklist ───────────────────────────── */
const BLOCKED_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","guerrillamail.info",
  "guerrillamail.biz","guerrillamail.de","guerrillamail.net","guerrillamail.org",
  "spam4.me","trashmail.com","trashmail.me","trashmail.net","trashmail.at",
  "trashmail.io","trashmail.xyz","dispostable.com","yopmail.com","yopmail.fr",
  "cool.fr.nf","jetable.fr.nf","nospam.ze.tc","nomail.xl.cx","mega.zik.dj",
  "speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf","monemail.fr.nf",
  "monmail.fr.nf","discard.email","spamgourmet.com","spamgourmet.net",
  "spamgourmet.org","spamspot.com","spamthisplease.com","0-mail.com",
  "0815.ru","0clickemail.com","10minutemail.com","10minutemail.net",
  "10minutemail.org","10minutemail.de","20minutemail.com","20minutemail.it",
  "33mail.com","binkmail.com","bobmail.info","chammy.info","deadaddress.com",
  "despam.it","discard.email","discardmail.com","discardmail.de","dodgeit.com",
  "dodgit.com","dontreg.com","dontsendmespam.de","e4ward.com","emailisvalid.com",
  "fakeinbox.com","filzmail.com","for4mail.com","getairmail.com","getonemail.com",
  "haltospam.com","ieatspam.eu","ieatspam.info","inboxclean.com","inboxclean.org",
  "jetable.com","jetable.net","jetable.org","kasmail.com","koszmail.pl",
  "kurzepost.de","landmail.co","letthemeatspam.com","lol.ovpn.to","lookugly.com",
  "lopl.co.cc","lortemail.dk","losemymail.com","maileater.com","mailexp.com",
  "mailguard.me","mailimperator.de","mailme.lv","mailnew.com","mailnull.com",
  "mailsiphon.com","mailslite.com","mailtemp.info","mailtome.de",
  "mailzilla.com","mbx.cc","meatismurder.net","mega.zik.dj","meinspam.info",
  "meltmail.com","messagebeamer.de","mezimages.net","moncourrier.fr.nf",
  "monemail.fr.nf","monmail.fr.nf","mt2009.com","mt2014.com","myspaceinc.com",
  "myspaceinc.net","myspaceinc.org","myspacepimpedup.com","mytempemail.com",
  "neomailbox.com","nepwk.com","nervmich.net","nervtmich.net","netmails.com",
  "netmails.net","neverbox.com","no-spam.ws","nobulk.com","noclickemail.com",
  "nomail2me.com","nomo.com","nonspam.eu","nonspammer.de","noref.in",
  "nospamfor.us","nospamthanks.info","notmailinator.com","notsharingmy.info",
  "nowmymail.com","nwldx.com","objectmail.com","obobbo.com","odnorazovoe.ru",
  "oneoffemail.com","onewaymail.com","onlatedotcom.info","online.ms",
  "pookmail.com","privacy.net","privatdemail.net","proxymail.eu","prtnx.com",
  "punkass.com","putthisinyourspamdatabase.com","putthisinyourspamdatabase.com",
  "rcpt.at","recode.me","rego.ltd","regspaces.tk","rejectmail.com",
  "rklips.com","rmqkr.net","rppkn.com","rtrtr.com","s0ny.net","safetymail.info",
  "safetypost.de","saynotospams.com","selfdestructingmail.com","sendspamhere.com",
  "sharklasers.com","shiftmail.com","shitmail.me","shitmail.org","shitware.nl",
  "shortmail.net","sibmail.com","skeefmail.com","slopsbox.com","smashmail.de",
  "snkmail.com","sofortmail.de","sogetthis.com","spamcorpse.com","spamdecoy.net",
  "spamex.com","spamfree24.de","spamfree24.eu","spamfree24.info","spamfree24.net",
  "spamfree24.org","spamgoes.in","spamgourmet.com","spamgourmet.net",
  "spamgourmet.org","spamherelots.com","spamhereplease.com","spamhole.com",
  "spamify.com","spaminator.de","spamkill.info","spaml.com","spaml.de",
  "spammotel.com","spamoff.de","spamslicer.com","spamspot.com",
  "spamsuite.com","spamthis.co.uk","spamthisplease.com","spamtrail.com",
  "speed.1s.fr","suremail.info","teewars.org","teleworm.com","teleworm.us",
  "tempalias.com","tempe-mail.com","tempemail.biz","tempemail.com","tempemail.net",
  "tempinbox.co.uk","tempinbox.com","tempmail.eu","tempmailer.de",
  "tempomail.fr","temporaryemail.net","temporaryemail.us","temporaryforwarding.com",
  "temporaryinbox.com","thanksnospam.com","thisisnotmyrealemail.com",
  "throwam.com","throwam.us","throwaway.email","tittbit.in","tmail.com",
  "tmailinator.com","toiea.com","tradermail.info","trash-mail.at","trash-mail.com",
  "trash-mail.de","trash-mail.io","trash-mail.me","trash2009.com","trashdevil.com",
  "trashdevil.de","trashemail.de","trashimail.com","trashmail.at","trashmail.com",
  "trashmail.io","trashmail.me","trashmail.net","trashmail.org","trashmail.xyz",
  "trbvm.com","trillianpro.com","turual.com","twinmail.de","tyldd.com",
  "uggsrock.com","umail.net","upliftnow.com","uplipht.com","veryrealemail.com",
  "viditag.com","viewcastmedia.com","viewcastmedia.net","viewcastmedia.org",
  "webemail.me","webm4il.info","wee.my","weg-werf-email.de","wetrainbayarea.com",
  "wetrainbayarea.org","wh4f.org","whyspam.me","willhackforfood.biz",
  "willselfdestruct.com","wilemail.com","winemaven.info","wronghead.com",
  "www.e4ward.com","xagloo.com","xemaps.com","xents.com","xmaily.com",
  "xoxy.net","yep.it","yogamaven.com","yopmail.com","yopmail.fr",
  "yourdomain.com","ypmail.webarnak.fr.eu.org","yuurok.com","zehnminuten.de",
  "zehnminutenmail.de","zippymail.info","zoaxe.com","zoemail.net","zoemail.org",
  "zomg.info","dMailinator.com","anonaddy.com","simplelogin.com","nada.email",
  "maildrop.cc","tmail.io","tmpmail.net","getnada.com","moakt.com",
  "spamgmail.com","bccto.me","dispostable.com","emailna.li","fakemailgenerator.com",
  "fleckens.hu","kurzepost.de","objectmail.com","prtnx.com","rcpt.at",
  "spamfree24.org","tempail.com","getonemail.net","spam4.me",
  "mohmal.com","mailnesia.com","discard.email","filzmail.com","airmail.cc",
  "crazymailing.com","harakirimail.com","jetable.fr.nf","kzccv.com",
  "mail.mezimages.net","mail.wtf","opentrash.com","rppkn.com",
  "sharklasers.com","spam.la","spoofmail.de","trbvm.com",
]);

function isBlockedEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return BLOCKED_DOMAINS.has(domain);
}

const STRENGTH = [
  { label: "8+ characters",    test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number",           test: (p: string) => /\d/.test(p) },
];

/* ─── Inner component (needs useSearchParams inside Suspense) ────────────── */
function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const refCode = params.get("ref") ?? "";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const supabase = createClient();

  // After signup, attempt to claim the referral
  useEffect(() => {
    if (newUserId && refCode) {
      api.referral.claim({ referee_id: newUserId, referral_code: refCode }).catch(() => null);
    }
  }, [newUserId, refCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Block temp/disposable emails
    if (isBlockedEmail(email)) {
      setError("Temporary or disposable email addresses are not allowed. Please use a real email.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
    } else {
      if (data.user?.id) setNewUserId(data.user.id);
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="space-y-8">
        <div>
          <div className="w-12 h-12 rounded-full bg-cream-300/10 border border-cream-300/20 flex items-center justify-center mb-6">
            <Check size={20} className="text-cream-300" />
          </div>
          <h2 className="font-display text-4xl font-light text-[#E8DDD0] tracking-tight">Check your email.</h2>
          <p className="text-[#6B6456] text-sm mt-3 leading-relaxed">
            We sent a confirmation link to <strong className="text-cream-300">{email}</strong>.
            Click it to activate your account and unlock your{" "}
            <strong className="text-cream-300">300 free credits</strong>.
          </p>
        </div>
        {refCode && (
          <p className="text-xs text-cream-400/70 bg-cream-300/5 border border-cream-300/10 rounded-xl px-4 py-3">
            🎁 Referral code applied — your friend earns 50 bonus credits when you verify.
          </p>
        )}
        <Link href="/login" className="text-xs text-[#3D3A33] hover:text-cream-300 transition">
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Heading */}
      <div>
        <h1 className="font-display text-5xl font-light text-[#E8DDD0] leading-[1.1] tracking-tight">
          {refCode ? "You were invited." : "Create your account."}
        </h1>
        <p className="text-[#6B6456] text-sm mt-3 tracking-wide">
          300 free credits included — no card needed
        </p>
      </div>

      {refCode && (
        <div className="flex items-center gap-2.5 border border-cream-300/20 bg-cream-300/5 rounded-xl px-4 py-3 text-xs text-cream-300/80">
          <Gift size={13} className="shrink-0 text-cream-300" />
          Referral code <strong className="font-mono">{refCode}</strong> applied ✓
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-6">

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-[#6B6456] tracking-[0.2em] uppercase block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="you@gmail.com"
            className="w-full bg-[#13120E] border border-[#2A2820] rounded-xl px-4 py-3.5 text-sm text-[#E8DDD0] placeholder:text-[#3D3A33] focus:outline-none focus:border-[#6B6456] transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-[#6B6456] tracking-[0.2em] uppercase block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full bg-[#13120E] border border-[#2A2820] rounded-xl px-4 py-3.5 pr-12 text-sm text-[#E8DDD0] placeholder:text-[#3D3A33] focus:outline-none focus:border-[#6B6456] transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3D3A33] hover:text-[#6B6456] transition"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password && (
            <div className="flex gap-4 pt-1">
              {STRENGTH.map(({ label, test }) => (
                <p key={label} className={`text-[10px] flex items-center gap-1 transition ${test(password) ? "text-cream-400" : "text-[#3D3A33]"}`}>
                  <Check size={9} className={test(password) ? "opacity-100" : "opacity-0"} />
                  {label}
                </p>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400/80 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cream-300 text-[#0A0905] py-4 rounded-2xl text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-50 flex items-center justify-center gap-2 tracking-wide"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Creating account…" : "Create account — free"}
        </button>
      </form>

      <p className="text-[#3D3A33] text-xs tracking-wide">
        Already have an account?{" "}
        <Link href="/login" className="text-cream-300 hover:text-cream-200 transition">
          Sign in
        </Link>
      </p>
    </div>
  );
}

/* ─── Page wrapper (Suspense required for useSearchParams in Next.js 14) ── */
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-neutral-500 text-sm text-center py-10">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
