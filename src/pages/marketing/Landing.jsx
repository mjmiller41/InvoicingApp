import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hammer, ArrowRight, Play, Check, FileText, Activity, Upload,
  Users, Building2, BellRing, CheckCircle2, Clock, Send, Download,
  Star, Plus, BadgeCheck, Trees, Anvil, PenTool, Ruler, Paintbrush, Drill,
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { Reveal } from '../../components/marketing/Reveal';
import { useInView } from '../../hooks/useInView';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function CountUp({ target, prefix = '', suffix = '' }) {
  const [ref, inView] = useInView({ threshold: 0.6 });
  const [count, setCount] = useState(prefersReduced ? target : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      setCount(cur);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

const CUSTOMERS = [
  { Icon: Trees, name: 'Oakline' },
  { Icon: Anvil, name: 'Iron&Co' },
  { Icon: PenTool, name: 'Jenkins' },
  { Icon: Ruler, name: 'Measure&Co' },
  { Icon: Paintbrush, name: 'Studio Maud' },
  { Icon: Drill, name: 'Northwood' },
];

export default function Landing() {
  return (
    <div className="bg-white text-slate-900 antialiased">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden grain">
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">

            {/* Left: copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Invoicing for makers &amp; trades
              </span>
              <h1 className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.02] text-slate-900">
                Get paid for<br />the work you<br />
                <span className="relative inline-block">
                  build.
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path d="M2 8C40 3 160 3 198 8" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-7 text-lg text-slate-600 max-w-md leading-relaxed">
                Billwright turns finished projects into sent invoices in seconds — then tracks every dollar from draft to deposit. Built for studios, builders, and independent makers.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-sm shadow-emerald-500/20 transition-colors"
                >
                  Start invoicing free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="#workflow"
                  className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-xl shadow-xs transition-colors"
                >
                  <Play className="h-4 w-4 text-emerald-600" />
                  See how it works
                </Link>
              </div>
              <p className="mt-5 text-xs font-medium text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No card required</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited clients</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free forever tier</span>
              </p>
            </div>

            {/* Right: floating product mock */}
            <div className="relative animate-float">
              <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-emerald-200/40 to-blue-200/30 blur-xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 h-10 border-b border-slate-100 bg-slate-50">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-3 text-[11px] font-mono text-slate-400">app.billwright.com</span>
                </div>
                <div className="p-5 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">Invoices</div>
                      <div className="text-[10px] text-slate-500">Monitor receivables &amp; payment status</div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                      <Plus className="h-3 w-3" />Create
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Collected</span>
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-1.5 text-xl font-extrabold text-slate-900">$2,862</div>
                      <div className="text-[9px] font-semibold text-emerald-600 mt-0.5">67% collection rate</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Outstanding</span>
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                          <Clock className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-1.5 text-xl font-extrabold text-slate-900">$777.60</div>
                      <div className="text-[9px] font-medium text-slate-500 mt-0.5">Sent &amp; pending</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
                    {[
                      { id: 'INV-1001', client: 'Sarah Jenkins Design', amount: '$2,862.00', status: 'Paid', cls: 'border-emerald-200 bg-emerald-100 text-emerald-800' },
                      { id: 'INV-1002', client: 'Oak & Iron Builders', amount: '$777.60', status: 'Sent', cls: 'border-blue-200 bg-blue-100 text-blue-800' },
                      { id: 'INV-1003', client: 'Sarah Jenkins Design', amount: '$648.00', status: 'Overdue', cls: 'border-rose-200 bg-rose-100 text-rose-800' },
                    ].map(({ id, client, amount, status, cls }) => (
                      <div key={id} className="flex items-center justify-between px-3.5 py-2.5">
                        <div>
                          <div className="text-[11px] font-bold font-mono text-slate-800">{id}</div>
                          <div className="text-[9px] text-slate-500">{client}</div>
                        </div>
                        <div className="text-[11px] font-bold text-slate-800">{amount}</div>
                        <span className={`inline-flex items-center gap-1 rounded-full border text-[9px] font-bold px-2 py-0.5 ${cls}`}>
                          <span className="h-1 w-1 rounded-full bg-current" />{status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating chip */}
              <div className="absolute -left-6 bottom-10 hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[10px] font-bold text-slate-900 leading-none">Payment received</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">INV-1001 · just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo Strip ── */}
      <section id="customers" className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by 4,000+ studios, shops &amp; sole traders
          </p>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6 items-center justify-items-center opacity-70">
            {CUSTOMERS.map(({ Icon, name }) => (
              <div key={name} className="flex items-center gap-2 font-extrabold text-slate-500">
                <Icon className="h-5 w-5" />{name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Everything in one place</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">From workbench to bank account</h2>
          <p className="mt-4 text-lg text-slate-600">A focused toolkit that does the billing busywork so you can stay on the tools.</p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {/* Big feature card — 2×2 */}
          <Reveal className="md:col-span-2 md:row-span-2 rounded-2xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm">
                <FileText className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Build &amp; send invoices in seconds</h3>
            </div>
            <p className="mt-3 text-slate-600 max-w-lg">Line items, taxes, deposits and discounts calculated live. Save a project as a template and reuse it for the next client.</p>
            <div className="mt-6 flex-1 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <span className="font-mono text-sm font-bold text-slate-800">INV-1004</span>
                  <span className="text-xs font-semibold text-slate-400">Draft</span>
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-slate-700">Walnut dining table — bespoke</span>
                    <span className="font-semibold text-slate-900">$2,400.00</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-slate-700">Finishing &amp; delivery</span>
                    <span className="font-semibold text-slate-900">$320.00</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50">
                    <span className="font-bold text-slate-900">Total due</span>
                    <span className="font-extrabold text-emerald-700">$2,720.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg shadow-sm">
                  <Send className="h-3.5 w-3.5" />Send invoice
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg">
                  <Download className="h-3.5 w-3.5" />Download PDF
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">Track every status</h3>
            <p className="mt-2 text-sm text-slate-600">Draft, Sent, Paid, Overdue — flip a status in one click and watch your totals update instantly.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-slate-200 bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1">Draft</span>
              <span className="rounded-full border border-blue-200 bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1">Sent</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1">Paid</span>
              <span className="rounded-full border border-rose-200 bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1">Overdue</span>
            </div>
          </Reveal>

          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
              <Upload className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">Import your back catalog</h3>
            <p className="mt-2 text-sm text-slate-600">Bring invoices and clients over from a spreadsheet or your old tool in a couple of clicks.</p>
          </Reveal>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-5">
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">Client address book</h3>
            <p className="mt-2 text-sm text-slate-600">Every client, contact and billing detail saved and ready to drop into the next invoice.</p>
          </Reveal>
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">Multiple businesses</h3>
            <p className="mt-2 text-sm text-slate-600">Run a side shop and a studio? Switch between business profiles without logging out.</p>
          </Reveal>
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <BellRing className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">Automatic reminders</h3>
            <p className="mt-2 text-sm text-slate-600">Polite nudges go out on overdue balances so you never have to send the awkward email.</p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 grid sm:grid-cols-3 gap-10 text-center">
          <Reveal>
            <div className="text-5xl font-extrabold tracking-tight text-emerald-400">
              <CountUp target={11} /> days
            </div>
            <p className="mt-2 text-sm font-medium text-slate-300">faster, on average, to get paid</p>
          </Reveal>
          <Reveal>
            <div className="text-5xl font-extrabold tracking-tight text-emerald-400">
              <CountUp target={38} />s
            </div>
            <p className="mt-2 text-sm font-medium text-slate-300">to draft and send your first invoice</p>
          </Reveal>
          <Reveal>
            <div className="text-5xl font-extrabold tracking-tight text-emerald-400">
              $<CountUp target={62} />M
            </div>
            <p className="mt-2 text-sm font-medium text-slate-300">billed through Billwright last year</p>
          </Reveal>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Three steps</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Bill a job before the dust settles</h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          <Reveal className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="font-mono text-sm font-bold text-emerald-600">01</span>
            <h3 className="mt-3 text-xl font-extrabold">Add the work</h3>
            <p className="mt-2 text-slate-600 text-sm">Pull a client from your address book, list what you made, and let totals tally themselves.</p>
            <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 bg-white rounded-full p-1" />
          </Reveal>
          <Reveal className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="font-mono text-sm font-bold text-emerald-600">02</span>
            <h3 className="mt-3 text-xl font-extrabold">Send it off</h3>
            <p className="mt-2 text-slate-600 text-sm">Email a clean, branded invoice or export a PDF. The status flips to Sent automatically.</p>
            <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 bg-white rounded-full p-1" />
          </Reveal>
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="font-mono text-sm font-bold text-emerald-600">03</span>
            <h3 className="mt-3 text-xl font-extrabold">Get paid</h3>
            <p className="mt-2 text-slate-600 text-sm">Watch receivables roll in on your dashboard and mark them paid the moment they land.</p>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
        <Reveal className="rounded-3xl border border-slate-200 bg-slate-50 grain p-10 md:p-16 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="flex gap-1 text-emerald-500 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
              "I went from chasing payments on sticky notes to knowing exactly what's owed at a glance. Billwright paid for itself in the first week."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-slate-950 font-extrabold text-sm">SJ</span>
              <div>
                <div className="font-bold text-slate-900">Sarah Jenkins</div>
                <div className="text-sm text-slate-500">Founder, Jenkins Design Studio</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-900">+$18k</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">recovered from overdue invoices</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">9 hrs</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">saved on admin every month</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">of jobs invoiced same-day</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">3 min</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">average time per invoice</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-emerald-500 px-8 py-16 md:py-20 text-center shadow-xl shadow-emerald-500/20">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(2,6,23,.35) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">Your next invoice is 38 seconds away</h2>
            <p className="mt-4 text-slate-900/80 text-lg max-w-xl mx-auto font-medium">
              Start free, keep your first three clients on us forever. Upgrade only when the workshop grows.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors"
              >
                Open the app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl transition-colors"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter variant="full" />
    </div>
  );
}
