"""CP-01: extract 106-L3 census from Inventory 3.2-R1 (deterministic)."""
import re, json, collections, subprocess, sys, os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
INV=os.path.join(ROOT,'Product_Blueprint_03_2_Feature_Inventory_and_Scope.md')
t=open(INV,encoding='utf-8').read()
mods={}
for line in t.split('\n'):
    if not line.startswith('|'): continue
    for mid,name in re.findall(r'`(F\d{2}-G\d{2}-M\d{2})` ([^→`|—]+?)\s*(?:→|—|\|)',line):
        mods.setdefault(mid,name.strip())
# group exec/cost
gexec={}
for line in t.split('\n'):
    m=re.match(r'\| \*\*`(F\d{2}-G\d{2})`\*\* ([^|]+)\|.*\| (E\d(?:[/–-]E\d)*[^|]*?) / (Low|Medium|High|[^|]+?) \|',line)
    if m: gexec[m.group(1)]=dict(group_name=m.group(2).strip(),exec=m.group(3).strip(),ai_cost=m.group(4).strip())
ux={}
for g,*c in re.findall(r'^\| `(F\d{2}-G\d{2})` \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|',t,re.M):
    ux[g]=[x.strip() for x in c]
r1=set(re.findall(r'↳ \*\*`F\d{2}-G\d{2}`\*\* — L3 bổ sung 3.2-R1 \| `(F\d{2}-G\d{2}-M\d{2})`',t))
rows=[]
for mid in sorted(mods):
    g=mid[:7]
    rows.append(dict(module_id=mid,name=mods[mid],group=g,domain=mid[:3],group_name=gexec.get(g,{}).get('group_name'),
        exec_32=('UNSET_R1' if mid in r1 else gexec.get(g,{}).get('exec')),ai_cost_32=('UNSET_R1' if mid in r1 else gexec.get(g,{}).get('ai_cost')),
        ux_32=ux.get(g),r1_added=mid in r1))
dom=collections.Counter(r['domain'] for r in rows)
check=dict(l3=len(rows),groups=len({r['group'] for r in rows}),domains=dict(sorted(dom.items())),
  missing_group_meta=[r['module_id'] for r in rows if not r['group_name']],missing_ux=[r['module_id'] for r in rows if not r['ux_32']],r1_added=sorted(r1),
  expected={'F01':13,'F02':12,'F03':14,'F04':15,'F05':12,'F06':13,'F07':15,'F08':12})
check['pass']=check['l3']==106 and check['groups']==51 and check['domains']==check['expected']
json.dump(rows,open(os.path.join(ROOT,'phase-3-scoring-review','data','inventory_106.json'),'w'),ensure_ascii=False,indent=1)
print(json.dumps(check,ensure_ascii=False,indent=1))
sys.exit(0 if check['pass'] else 1)
