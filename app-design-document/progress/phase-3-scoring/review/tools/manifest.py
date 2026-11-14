"""CP-01: record blob SHAs of governing sources at HEAD and compare with remediation register pins."""
import subprocess, json, glob, os, re
os.chdir(subprocess.run(['git','rev-parse','--show-toplevel'],capture_output=True,text=True).stdout.strip())
A='documents/app-design-document/'
rank={
 1:[A+'Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md',A+'Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md',A+'Feature_3_2_L4_Owner_Decision_Register_INDEX.md'],
 2:sorted(set(glob.glob(A+'*APPROVED*.md'))-{A+'Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md',A+'Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md'})+['CLAUDE.md'],
 3:[A+'Product_Blueprint_03_2_Feature_Inventory_and_Scope.md'],
 4:sorted(glob.glob(A+'Feature_3_2_L4_Detailed_Review_Group_*_REVIEW.md'))+[A+'Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md',A+'Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md',A+'Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md'],
 5:[A+'Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md',A+'Feature_3_2_L4_20261114_Owner_Finding_Remediation_Supplemental_Manifest_REVIEW.md',A+'Feature_3_2_to_Phase_3_Execution_Tracker_REVIEW.md'],
 6:[A+'Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md',A+'Product_Blueprint_Master_Research_Backlog_v1_2.md'],
 7:[A+'Feature_3_3_106_L3_Preliminary_Value_Cost_Triage_REVIEW.md',A+'Feature_3_3_Initial_106_L3_Assessment_Registry_REVIEW.md','documents/app/spec-phuong-an-a-app-android.md','documents/app/ref-nhat-ky-test.md','prototype/README.md','documents/pal/spec-quy-tac-lap-lich.md'],
 8:[A+'Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md',A+'Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md'],
}
head=subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True).stdout.strip()
out=[]
for r,fs in rank.items():
    for f in fs:
        b=subprocess.run(['git','rev-parse',f'HEAD:{f}'],capture_output=True,text=True).stdout.strip()
        out.append(dict(rank=r,path=f,blob=b or 'SOURCE_UNAVAILABLE'))
reg=open(A+'Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md',encoding='utf-8').read()
pins=dict(re.findall(r'\]\(([^)]+\.md)\) \| `([0-9a-f]{40})`',reg))
cmp=[]
for f,b in pins.items():
    cur=next((o['blob'] for o in out if o['path']==A+f),None)
    cmp.append(dict(path=f,register_pin=b,head=cur,status='MATCH' if cur==b else ('NOT_IN_MANIFEST' if cur is None else 'NEWER_AT_HEAD')))
json.dump(dict(head=head,sources=out,register_pin_check=cmp),open(A+'phase-3-scoring-review/data/source_manifest.json','w'),indent=1)
print(head,len(out),'unavailable',[o['path'] for o in out if o['blob']=='SOURCE_UNAVAILABLE'])
for c in cmp: print(c['status'],c['path'][:70])
