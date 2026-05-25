"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Filter,
  Loader2,
  MapPin,
  NotebookPen,
  Plus,
  Search,
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
import type {
  TrackerEntry,
  TrackerEntryPayload,
  TrackerFilters,
  TrackerSortField,
  TrackerSortOrder,
  TrackerStatus,
  User,
} from "@/lib/types";

const statuses: TrackerStatus[] = [
  "applied",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

const statusStyles: Record<TrackerStatus, string> = {
  applied: "bg-blue-50 text-blue-700 ring-blue-200",
  assessment: "bg-amber-50 text-amber-700 ring-amber-200",
  interview: "bg-violet-50 text-violet-700 ring-violet-200",
  offer: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  ghosted: "bg-slate-100 text-slate-600 ring-slate-200",
  withdrawn: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusLabels: Record<TrackerStatus, string> = {
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

type TrackerFormState = {
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

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): TrackerFormState => ({
  job_title: "",
  company_name: "",
  job_url: "",
  platform: "",
  location: "",
  job_type: "",
  salary_min: "",
  salary_max: "",
  currency: "BDT",
  applied_date: today(),
  deadline: "",
  application_status: "applied",
  task_link: "",
  task_deadline: "",
  interview_date: "",
  interview_type: "",
  notes: "",
});

function humanizeDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function toApiDateTime(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function formatSalary(entry: TrackerEntry) {
  const min = entry.salary_min;
  const max = entry.salary_max;
  if (min == null && max == null) return null;
  const currency = entry.currency ? ` ${entry.currency}` : "";
  if (min != null && max != null) return `${min.toLocaleString()}-${max.toLocaleString()}${currency}`;
  if (min != null) return `From ${min.toLocaleString()}${currency}`;
  return `Up to ${max?.toLocaleString()}${currency}`;
}

function cleanPayload(form: TrackerFormState): TrackerEntryPayload {
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

function NativeSelect({
  value,
  onChange,
  children,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function TrackerClient() {
  return (
    <ProtectedRoute allowedRoles={["job_seeker"]}>
      {(user) => <TrackerContent user={user} />}
    </ProtectedRoute>
  );
}

function TrackerContent({ user }: { user: User }) {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | TrackerStatus>("all");
  const [platformFilter, setPlatformFilter] = useState("");
  const [sort, setSort] = useState<TrackerSortField>("created_at");
  const [order, setOrder] = useState<TrackerSortOrder>("desc");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filters = useMemo<TrackerFilters>(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      platform: platformFilter.trim() || undefined,
      sort,
      order,
    }),
    [order, platformFilter, sort, statusFilter],
  );

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const data = await trackerApi.list(filters);
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) {
          setEntries([]);
          toast.error("Could not load tracker entries.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function upsertEntry(entry: TrackerEntry) {
    setEntries((current) => {
      const exists = current.some((item) => String(item.id) === String(entry.id));
      if (exists) {
        return current.map((item) => (String(item.id) === String(entry.id) ? entry : item));
      }
      return [entry, ...current];
    });
  }

  return (
    <AppShell
      user={user}
      title=""
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-blue-500 to-violet-500" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application pipeline</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {entries.length} tracked {entries.length === 1 ? "role" : "roles"} across active searches.
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_120px]">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <NativeSelect
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as "all" | TrackerStatus)}
                className="pl-9"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value)}
                placeholder="Platform"
                className="pl-9"
              />
            </div>
            <NativeSelect
              aria-label="Sort tracker entries"
              value={sort}
              onChange={(value) => setSort(value as TrackerSortField)}
            >
              <option value="created_at">Recently added</option>
              <option value="applied_date">Applied date</option>
              <option value="deadline">Deadline</option>
            </NativeSelect>
            <NativeSelect
              aria-label="Sort order"
              value={order}
              onChange={(value) => setOrder(value as TrackerSortOrder)}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </NativeSelect>
          </div>
        </section>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="skeleton h-5 w-2/5" />
                <div className="skeleton mt-3 h-4 w-3/5" />
                <div className="skeleton mt-5 h-8 w-28 rounded-full" />
              </div>
            ))}
          </div>
        ) : entries.length ? (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <TrackerCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <NotebookPen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">No tracker entries yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Add the jobs you are applying to and keep deadlines, task links, interviews, and notes in one place.
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        )}
      </div>

      {isAddOpen ? (
        <TrackerFormModal
          title="Add tracked job"
          submitLabel="Create Entry"
          initialForm={emptyForm()}
          onClose={() => setIsAddOpen(false)}
          onSubmit={async (form) => {
            const created = await trackerApi.create(cleanPayload(form));
            upsertEntry(created);
            setIsAddOpen(false);
            toast.success("Job added to tracker.");
          }}
        />
      ) : null}

    </AppShell>
  );
}

function TrackerCard({ entry }: { entry: TrackerEntry }) {
  const salary = formatSalary(entry);

  return (
    <Link
      href={`/tracker/${entry.id}`}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">
            {entry.job_title} <span className="font-semibold text-slate-400">-</span> {entry.company_name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {entry.platform ? <span>{entry.platform}</span> : null}
            {entry.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {entry.location}
              </span>
            ) : null}
            {salary ? <span>{salary}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {entry.applied_date ? <span>Applied: {humanizeDate(entry.applied_date)}</span> : null}
            {entry.deadline ? <span>Deadline: {humanizeDate(entry.deadline)}</span> : null}
            {entry.interview_date ? (
              <span className="text-violet-700">Interview: {humanizeDate(entry.interview_date)}</span>
            ) : null}
            {entry.task_deadline ? (
              <span className="text-amber-700">Task due: {humanizeDate(entry.task_deadline)}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={entry.application_status} />
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition-colors group-hover:bg-emerald-600">
            Details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrackerFormModal({
  title,
  submitLabel,
  initialForm,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initialForm: TrackerFormState;
  onClose: () => void;
  onSubmit: (form: TrackerFormState) => Promise<void>;
}) {
  const [form, setForm] = useState(initialForm);
  const [showOptional, setShowOptional] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof TrackerFormState>(key: K, value: TrackerFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      toast.error("Could not save tracker entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">Only job title and company are required.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Close modal"
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
          </div>

          <button
            type="button"
            onClick={() => setShowOptional((value) => !value)}
            className="mt-5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            {showOptional ? "Hide optional fields" : "Show optional fields"}
          </button>

          {showOptional ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              <Field label="Currency">
                <Input value={form.currency} onChange={(event) => update("currency", event.target.value)} />
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
              <div className="sm:col-span-2">
                <Field label="Notes">
                  <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} />
                </Field>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
