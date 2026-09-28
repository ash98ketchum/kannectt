export type EmailTarget = {
  mail: string;
  company?: string;
  type: "recruiter" | "careers";
};

export type SendResult = {
  to: string;
  company: string;
  subject: string;
  body: string;
  status: "sent" | "failed" | "preview";
  error?: string;
};

export type ContactPublic = {
  id: string;
  name: string;
  title: string;
  company: string;
  department: string;
  location: string;
  seniority: string;
  masked_email: string;
  unlock_cost: number;
  is_unlocked: boolean;
  email?: string; // only present after unlock
};

export type CreditPackage = "starter" | "pro" | "power";

export type CreditOrder = {
  id: string;
  package: string;
  credits: number;
  amount_usd_cents: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
};

export type ResumeMetadata = {
  path: string;
  filename: string;
  signed_url: string;
};
