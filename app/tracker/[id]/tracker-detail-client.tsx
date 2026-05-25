"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  LinkIcon,
  Loader2,
  MapPin,
  NotebookText,
  Pencil,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackerApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TrackerEntry, TrackerEntryPayload, TrackerStatus, User } from "@/lib/types";

const statuses: TrackerStatus[] = [
  "applied",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

const statusLabels: Record<TrackerStatus, string> = {
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

const statusStyles: Record<TrackerStatus, string> = {
  applied: "bg-blue-50 text-blue-700 ring-blue-200",
  assessment: "bg-amber-50 text-amber-700 ring-amber-200",
  interview: "bg-violet-50 text-violet-700 ring-violet-200",
  offer: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  ghosted: "bg-slate-100 text-slate-600 ring-slate-200",
  withdrawn: "bg-slate-100 text-slate-600 ring-slate-200",
};

type TrackerEditForm = {
  job_title: string;
  company_name: string;
  job_url: string;
  platform: string;
  location: string;
  job_type: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  applied_date: string;
  deadline: string;
  application_status: TrackerStatus;
  task_link: string;
  task_deadline: string;
  interview_date: string;
  interview_type: string;
  notes: string;
};

function humanizeDate(value?: string | null, withTime = false) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function formatSalary(entry: TrackerEntry) {
  const min = entry.salary_min;
  const max = entry.salary_max;
  if (min == null && max == null) return "Not listed";
  const currency = entry.currency ? ` ${entry.currency}` : "";
  if (min != null && max != null) return `${min.toLocaleString()}-${max.toLocaleString()}${currency}`;
  if (min != null) return `From ${min.toLocaleString()}${currency}`;
  return `Up to ${max?.toLocaleString()}${currency}`;
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function toApiDateTime(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function entryToForm(entry: TrackerEntry): TrackerEditForm {
  return {
    job_title: entry.job_title ?? "",
    company_name: entry.company_name ?? "",
    job_url: entry.job_url ?? "",
    platform: entry.platform ?? "",
    location: entry.location ?? "",
    job_type: entry.job_type ?? "",
    salary_min: entry.salary_min == null ? "" : String(entry.salary_min),
    salary_max: entry.salary_max == null ? "" : String(entry.salary_max),
    currency: entry.currency ?? "BDT",
    applied_date: toDateInputValue(entry.applied_date),
    deadline: toDateInputValue(entry.deadline),
    application_status: entry.application_status,
    task_link: entry.task_link ?? "",
    task_deadline: toDateInputValue(entry.task_deadline),
    interview_date: toDateTimeInputValue(entry.interview_date),
    interview_type: entry.interview_type ?? "",
    notes: entry.notes ?? "",
  };
}

function cleanPayload(form: TrackerEditForm): TrackerEntryPayload {
  const payload: TrackerEntryPayload = {
    job_title: form.job_title.trim(),
    company_name: form.company_name.trim(),
    application_status: form.application_status,
  };

  const assign = <K extends keyof TrackerEntryPayload>(key: K, value: TrackerEntryPayload[K]) => {
    if (value !== undefined && value !== "") payload[key] = value;
  };

  assign("job_url", form.job_url.trim());
  assign("platform", form.platform.trim());
  assign("location", form.location.trim());
  assign("job_type", form.job_type.trim());
  assign("currency", form.currency.trim());
  assign("applied_date", form.applied_date);
  assign("deadline", form.deadline);
  assign("task_link", form.task_link.trim());
  assign("task_deadline", form.task_deadline);
  assign("interview_date", toApiDateTime(form.interview_date));
  assign("interview_type", form.interview_type.trim());
  assign("notes", form.notes.trim());

  if (form.salary_min) payload.salary_min = Number(form.salary_min);
  if (form.salary_max) payload.salary_max = Number(form.salary_max);

  return payload;
}

function StatusBadge({ status }: { status: TrackerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">{value || "Not set"}</p>
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  disabled,
}: {
  value: TrackerStatus;
  onChange: (value: TrackerStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      aria-label="Update application status"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as TrackerStatus)}
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {statusLabels[status]}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function NotesBody({ notes }: { notes?: string | null }) {
  const lines = useMemo(
    () =>
      (notes ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [notes],
  );

  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No job description or requirements were saved for this entry.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-700">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <div key={`${line}-${index}`} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <p>{bullet[1]}</p>
            </div>
          );
        }

        const isHeading = line.length <= 80 && /:$/u.test(line);
        return isHeading ? (
          <h3 key={`${line}-${index}`} className="pt-2 text-base font-bold text-slate-900">
            {line.replace(/:$/u, "")}
          </h3>
        ) : (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function TrackerDetailClient() {
  return (
    <ProtectedRoute allowedRoles={["job_seeker"]}>
      {(user) => <TrackerDetailContent user={user} />}
    </ProtectedRoute>
  );
}

function TrackerDetailContent({ user }: { user: User }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const entryId = params.id;
  const [entry, setEntry] = useState<TrackerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const data = await trackerApi.get(entryId);
        if (!cancelled) setEntry(data);
      } catch {
        if (!cancelled) {
          toast.error("Could not load tracker details.");
          router.replace("/tracker");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [entryId, router]);

  async function handleStatusChange(status: TrackerStatus) {
    if (!entry) return;
    const previous = entry;
    setEntry({ ...entry, application_status: status });
    setStatusSaving(true);

    try {
      const updated = await trackerApi.updateStatus(entry.id, status);
      setEntry(updated);
      toast.success("Status updated.");
    } catch {
      setEntry(previous);
      toast.error("Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry || !window.confirm("Delete this tracker entry?")) return;
    setDeleting(true);
    try {
      await trackerApi.remove(entry.id);
      toast.success("Tracker entry deleted.");
      router.replace("/tracker");
    } catch {
      toast.error("Could not delete tracker entry.");
      setDeleting(false);
    }
  }

  return (
    <AppShell
      user={user}
      title="Saved Job Details"
      description="Review the saved role, application timeline, and the full job description you captured."
    >
      {loading || !entry ? (
        <div className="space-y-5">
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="skeleton h-96 w-full rounded-2xl" />
            <div className="skeleton h-96 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Link
            href="/tracker"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tracker
          </Link>

          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-blue-500 to-violet-500" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={entry.application_status} />
                  {entry.platform ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {entry.platform}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                  {entry.job_title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    {entry.company_name}
                  </span>
                  {entry.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {entry.location}
                    </span>
                  ) : null}
                  {entry.job_type ? (
                    <span className="inline-flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-violet-600" />
                      {entry.job_type}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                {entry.job_url ? (
                  <Button asChild className="bg-slate-900 hover:bg-slate-800">
                    <a href={entry.job_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Original Job
                    </a>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Update Job
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Entry
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <NotebookText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Job Description & Requirements</h2>
                  <p className="text-sm text-slate-500">Pulled from your saved notes field.</p>
                </div>
              </div>
              <NotesBody notes={entry.notes} />
            </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Pipeline</h2>
                <div className="mt-4">
                  <NativeSelect
                    value={entry.application_status}
                    onChange={handleStatusChange}
                    disabled={statusSaving}
                  />
                </div>
                {entry.application_status === "offer" ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                    Congratulations. This one deserves a careful decision pass.
                  </div>
                ) : null}
              </section>

              <div className="grid gap-3">
                <DetailItem icon={CalendarDays} label="Applied Date" value={humanizeDate(entry.applied_date)} />
                <DetailItem icon={Clock3} label="Deadline" value={humanizeDate(entry.deadline)} />
                <DetailItem icon={FileText} label="Salary" value={formatSalary(entry)} />
                <DetailItem icon={LinkIcon} label="Task Link" value={entry.task_link} />
                <DetailItem icon={Clock3} label="Task Deadline" value={humanizeDate(entry.task_deadline)} />
                <DetailItem icon={Video} label="Interview" value={humanizeDate(entry.interview_date, true)} />
                <DetailItem icon={CheckCircle2} label="Interview Type" value={entry.interview_type} />
              </div>
            </aside>
          </div>

          {isEditOpen ? (
            <EditTrackerModal
              entry={entry}
              onClose={() => setIsEditOpen(false)}
              onSaved={(updated) => {
                setEntry(updated);
                setIsEditOpen(false);
                toast.success("Tracker entry updated.");
              }}
            />
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

function EditTrackerModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: TrackerEntry;
  onClose: () => void;
  onSaved: (entry: TrackerEntry) => void;
}) {
  const [form, setForm] = useState(() => entryToForm(entry));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof TrackerEditForm>(key: K, value: TrackerEditForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await trackerApi.update(entry.id, cleanPayload(form));
      onSaved(updated);
    } catch {
      toast.error("Could not update tracker entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Update saved job</h2>
            <p className="text-sm text-slate-500">Edit application details, dates, links, and saved description.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Close update form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-73px)] overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job Title">
              <Input required value={form.job_title} onChange={(event) => update("job_title", event.target.value)} />
            </Field>
            <Field label="Company Name">
              <Input
                required
                value={form.company_name}
                onChange={(event) => update("company_name", event.target.value)}
              />
            </Field>
            <Field label="Job URL">
              <Input value={form.job_url} onChange={(event) => update("job_url", event.target.value)} />
            </Field>
            <Field label="Platform">
              <Input value={form.platform} onChange={(event) => update("platform", event.target.value)} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(event) => update("location", event.target.value)} />
            </Field>
            <Field label="Job Type">
              <Input value={form.job_type} onChange={(event) => update("job_type", event.target.value)} />
            </Field>
            <Field label="Status">
              <NativeSelect
                value={form.application_status}
                onChange={(value) => update("application_status", value)}
              />
            </Field>
            <Field label="Currency">
              <Input value={form.currency} onChange={(event) => update("currency", event.target.value)} />
            </Field>
            <Field label="Salary Min">
              <Input
                type="number"
                value={form.salary_min}
                onChange={(event) => update("salary_min", event.target.value)}
              />
            </Field>
            <Field label="Salary Max">
              <Input
                type="number"
                value={form.salary_max}
                onChange={(event) => update("salary_max", event.target.value)}
              />
            </Field>
            <Field label="Applied Date">
              <Input
                type="date"
                value={form.applied_date}
                onChange={(event) => update("applied_date", event.target.value)}
              />
            </Field>
            <Field label="Deadline">
              <Input type="date" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </Field>
            <Field label="Task Link">
              <Input value={form.task_link} onChange={(event) => update("task_link", event.target.value)} />
            </Field>
            <Field label="Task Deadline">
              <Input
                type="date"
                value={form.task_deadline}
                onChange={(event) => update("task_deadline", event.target.value)}
              />
            </Field>
            <Field label="Interview Date">
              <Input
                type="datetime-local"
                value={form.interview_date}
                onChange={(event) => update("interview_date", event.target.value)}
              />
            </Field>
            <Field label="Interview Type">
              <Input
                value={form.interview_type}
                onChange={(event) => update("interview_type", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Job Description & Requirements">
                <Textarea
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  className="min-h-64"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
