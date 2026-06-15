import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Hammer, Building2, ArrowRight, Check, Minus, ChevronDown } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { Reveal } from '../../components/marketing/Reveal';

const PLANS = {
  solo:     { monthly: 0,  annual: 0  },
  studio:   { monthly: 18, annual: 14 },
  workshop: { monthly: 42, annual: 34 },
};

const COMPARISON = [
  ['Business entities',        '1',   '5',   '∞'  ],
  ['Clients',                  '∞',   '∞',   '∞'  ],
  ['Invoices per month',       '5',   '25',  '∞'  ],
  ['PDF export',               true,  true,  true ],
  ['Status dashboard',         true,  true,  true ],
  ['Custom branding & logo',   false, true,  true ],
  ['Email send invoices',      false, true,  true ],
  ['Spreadsheet import/export',false, true,  true ],
  ['Recurring invoices',       false, true,  true ],
  ['Team members',             false, false, '5'  ],
  ['Revenue & tax reports',    false, false, true ],
];

const FAQS = [
  ['Is there really a free plan?',
   'Yes. The Solo plan is free forever — unlimited clients, 5 invoices a month, and 1 business entity. No card required to start.'],
  ['Can I switch plans later?',
   'Anytime, in one click. Upgrades are prorated and downgrades take effect at the end of your billing cycle.'],
  ['What counts as an invoice?',
   'Any invoice sent or saved in a calendar month. Drafts don\'t count. The monthly count resets on the 1st; Workshop has no cap.'],
  ['What happens when my trial ends?',
   'Your data stays put. If you do nothing, the account simply drops to the free Solo plan — nothing is deleted.'],
  ['Can I run more than one business?',
   'Solo covers one business. Studio supports up to five. Workshop removes the cap entirely so you can manage unlimited businesses from one account.'],
  ['How do I get my old invoices in?',
   'Studio and Workshop include a spreadsheet importer that brings your existing invoices and clients across in a couple of clicks.'],
];

function CmpCell({ value }) {
  if (value === true)  return <Check className="h-4 w-4 text-emerald-500 inline" />;
  if (value === false) return <Minus className="h-4 w-4 text-slate-300 inline" />;
  return <span className="font-bold text-slate-800">{value}</span>;
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-bold text-slate-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const price = (key) => PLANS[key][annual ? 'annual' : 'monthly'];

  return (
    <div className="bg-white text-slate-900 antialiased">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden grain">
        <div className="pointer-events-none absolute -top-28 right-10 h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Simple, honest pricing
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.03]">
            Pay for the workshop,<br />not the paperwork
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">
            Start free and stay free until you grow. No setup fees, no per-invoice charges, cancel any time.
          </p>

          {/* Billing toggle */}
          <div className="mt-9 inline-flex items-center gap-3">
            <span className={`text-sm font-semibold transition-colors ${annual ? 'text-slate-500' : 'text-slate-900'}`}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((a) => !a)}
              className={`relative h-7 w-12 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                annual ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  annual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${annual ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            <span className="ml-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Solo */}
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                <User className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Solo</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">For sole traders sending the occasional invoice.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold tracking-tight">${price('solo')}</span>
              <span className="mb-1.5 text-sm font-semibold text-slate-500">/mo</span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">Free forever</p>
            <Link
              to="/app"
              className="mt-6 flex items-center justify-center w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl shadow-xs transition-colors"
            >
              Get started
            </Link>
            <ul className="mt-7 space-y-3 text-sm">
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">1 business entity</b></span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">Unlimited clients</b></span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">5 invoices</b> per month</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">PDF export</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Status tracking dashboard</span></li>
            </ul>
          </Reveal>

          {/* Studio (popular) */}
          <Reveal className="relative rounded-2xl border-2 border-emerald-500 bg-white p-7 shadow-xl shadow-emerald-500/10 lg:-mt-3">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 shadow-sm whitespace-nowrap">
              Most popular
            </span>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm">
                <Hammer className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Studio</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">For growing shops and design studios billing every week.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold tracking-tight">${price('studio')}</span>
              <span className="mb-1.5 text-sm font-semibold text-slate-500">/mo</span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {annual ? 'billed annually' : 'billed monthly'}
            </p>
            <Link
              to="/app"
              className="mt-6 flex items-center justify-center gap-1.5 w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-3 rounded-xl shadow-sm transition-colors"
            >
              Start 14-day trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <ul className="mt-7 space-y-3 text-sm">
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Up to <b className="text-slate-900">5 business entities</b></span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">25 invoices</b> per month</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Everything in Solo, plus:</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Custom branding &amp; logo</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Email send invoices</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Spreadsheet import/export</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Recurring invoices</span></li>
            </ul>
          </Reveal>

          {/* Workshop */}
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-emerald-400">
                <Building2 className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Workshop</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">For multi-business operators and small teams.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold tracking-tight">${price('workshop')}</span>
              <span className="mb-1.5 text-sm font-semibold text-slate-500">/mo</span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {annual ? 'billed annually' : 'billed monthly'}
            </p>
            <Link
              to="/app"
              className="mt-6 flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-sm transition-colors"
            >
              Start 14-day trial
            </Link>
            <ul className="mt-7 space-y-3 text-sm">
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">Unlimited</b> business entities</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600"><b className="text-slate-900">Unlimited</b> invoices</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Everything in Studio, plus:</span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Up to <b className="text-slate-900">5 team members</b></span></li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><span className="text-slate-600">Revenue &amp; tax reports</span></li>
            </ul>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">All plans include a 14-day money-back guarantee. Prices in USD.</p>
      </section>

      {/* ── Feature comparison ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">Compare every feature</h2>
        </Reveal>
        <Reveal className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-6 py-4 font-bold text-slate-700">Feature</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-center">Solo</th>
                <th className="px-6 py-4 font-bold text-emerald-700 text-center bg-emerald-50/60">Studio</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-center">Workshop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON.map(([feature, solo, studio, workshop]) => (
                <tr key={feature} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-semibold text-slate-700">{feature}</td>
                  <td className="px-6 py-3.5 text-center"><CmpCell value={solo} /></td>
                  <td className="px-6 py-3.5 text-center bg-emerald-50/40"><CmpCell value={studio} /></td>
                  <td className="px-6 py-3.5 text-center"><CmpCell value={workshop} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">Questions, answered</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map(([question, answer]) => (
            <Reveal key={question}>
              <FaqItem question={question} answer={answer} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Still on sticky notes and spreadsheets?
            </h2>
            <p className="mt-4 text-slate-300 text-lg max-w-lg mx-auto">
              Spin up your free account and send a real invoice before your coffee gets cold.
            </p>
            <Link
              to="/app"
              className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors"
            >
              Open the app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter variant="condensed" />
    </div>
  );
}
