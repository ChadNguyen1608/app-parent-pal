"""CP-05: AI inference cost scenarios for Tier-3 E2 modules. ALL inputs are ASSUMPTIONS unless marked; no measured usage exists.

Formula (3.3 §5): monthly_cost = households x actions/household/month x calls/action x cost/call
Vendor list prices (retrieved 2026-11-14, web search; list prices are NOT app unit economics):
  Claude Haiku 5.5 (prompts <=100K tokens): $0.10 / MTok input, $0.50 / MTok output
  Claude Sonnet 5.5: $2 / MTok input, $10 / MTok output; Batch 50% off
FX: 1 USD = 26,000 VND (ASSUMPTION; interbank mid-market ~26,000-26,200 in early Nov 2026)
"""
import json, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
PRICE = {'haiku': (0.10, 0.50), 'sonnet': (2.0, 10.0)}
FX = 26000
SCEN = {'Low': 30, 'Base': 300, 'High': 3000}  # active households (pilot -> early launch) ASSUMPTION

# action: model, input tokens, output tokens, calls/action (incl. retries + output check), actions/household/month by scenario, success rate
ACTIONS = {
 'F04-G02-M01 schedule draft (Sonnet)': dict(module='F04-G02-M01', model='sonnet', tin=6000, tout=1500, calls=1.2, per_hh={'Low': 2, 'Base': 4, 'High': 8}, success=0.7,
   note='Rules prompt (spec-quy-tac-lap-lich) + profile + timetable; weekly replan + edits; 20% retry; success = parent accepts draft (unknown)'),
 'F04-G02-M01 schedule draft (Haiku alt)': dict(module='F04-G02-M01', model='haiku', tin=6000, tout=1500, calls=1.3, per_hh={'Low': 2, 'Base': 4, 'High': 8}, success=0.6,
   note='Same with cheaper model; lower assumed acceptance; quality unverified (MR-026)'),
 'F05-G01-M01 Pal message (Haiku)': dict(module='F05-G01-M01', model='haiku', tin=3000, tout=400, calls=1.25, per_hh={'Low': 20, 'Base': 60, 'High': 200}, success=0.8,
   note='System + memory + retrieved knowledge; +25% for output-validation call (OD-05) and retries'),
 'F05-G01-M01 Pal message (Sonnet alt)': dict(module='F05-G01-M01', model='sonnet', tin=3000, tout=400, calls=1.25, per_hh={'Low': 20, 'Base': 60, 'High': 200}, success=0.85,
   note='If Haiku quality insufficient in Vietnamese (MR-026)'),
 'F03-G05-M01 grounded recommendation (Haiku)': dict(module='F03-G05-M01', model='haiku', tin=4000, tout=600, calls=1.2, per_hh={'Low': 2, 'Base': 6, 'High': 15}, success=0.5,
   note='Retrieval context + profile; success = parent accepts suggestion (unknown)'),
}
HEAVY = 3.0  # p95 heavy household multiplier on actions (ASSUMPTION)


def cost_call(model, tin, tout):
    pi, po = PRICE[model]
    return tin / 1e6 * pi + tout / 1e6 * po


rows = []
for name, a in ACTIONS.items():
    cc = cost_call(a['model'], a['tin'], a['tout']) * a['calls']
    for s, hh in SCEN.items():
        n = a['per_hh'][s]
        per_hh = cc * n
        rows.append(dict(action=name, module=a['module'], model=a['model'], scenario=s, households=hh, actions_per_hh=n,
                         usd_per_action=round(cc, 5), usd_per_hh_month=round(per_hh, 4), vnd_per_hh_month=round(per_hh * FX),
                         vnd_p95_heavy_hh=round(per_hh * HEAVY * FX), usd_total_month=round(per_hh * hh, 2),
                         usd_per_successful_activity=round(cc / a['success'], 5), vnd_per_successful_activity=round(cc / a['success'] * FX),
                         note=a['note']))
# package-level (base mix: Sonnet schedule + Haiku Pal + Haiku recommendation)
pk = {}
mix = {'A (W1, Sonnet schedule)': ['F04-G02-M01 schedule draft (Sonnet)'],
       'A-lite (W1E1, no LLM)': [],
       'B (W2, Haiku Pal + recommendation)': ['F05-G01-M01 Pal message (Haiku)', 'F03-G05-M01 grounded recommendation (Haiku)'],
       'C (W1+W3, Sonnet schedule + Haiku Pal)': ['F04-G02-M01 schedule draft (Sonnet)', 'F05-G01-M01 Pal message (Haiku)']}
for p, acts in mix.items():
    pk[p] = {s: dict(vnd_per_hh_month=sum(r['vnd_per_hh_month'] for r in rows if r['action'] in acts and r['scenario'] == s),
                     usd_total_month=round(sum(r['usd_total_month'] for r in rows if r['action'] in acts and r['scenario'] == s), 2)) for s in SCEN}
ref = dict(econ_model_v1='mo-hinh-kinh-te-v1 (project doc, 29/10/2026): AI ~1,200 VND per free user/month and ~8,200 VND per paid user/month incl. 30% buffer (ASSUMPTION, not measured)')
json.dump(dict(assumptions=dict(prices=PRICE, fx=FX, scenarios=SCEN, heavy_multiplier=HEAVY, actions=ACTIONS), rows=rows, packages=pk, reference=ref),
          open(os.path.join(D, 'cost_scenarios.json'), 'w'), ensure_ascii=False, indent=1)
for r in rows:
    if r['scenario'] == 'Base': print(f"{r['action'][:44]:44} ${r['usd_per_action']:.5f}/action  {r['vnd_per_hh_month']:>6} VND/hh/mo  p95 {r['vnd_p95_heavy_hh']:>6}  per success {r['vnd_per_successful_activity']} VND")
for p, v in pk.items(): print(p, {s: (x['vnd_per_hh_month'], x['usd_total_month']) for s, x in v.items()})
