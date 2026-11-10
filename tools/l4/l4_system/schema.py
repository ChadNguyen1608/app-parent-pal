from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
CohortID = Literal["A0", "A1", "A2", "A3", "A4", "A5"]
Kind = Literal["functional", "negative", "authorization", "dependency", "regression"]
Disposition = Literal["repair", "owner", "research", "disagreement"]


class Record(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class Evidence(Record):
    source: Text
    start: int
    end: int


class Requirement(Record):
    id: Text
    behavior: Text
    kind: Kind
    sources: list[Evidence]


class DesignTest(Record):
    id: Text
    kind: Kind
    requirements: list[Text]
    setup: Text
    action: Text
    expected_output: Text
    sources: list[Evidence]


class QA(Record):
    requirements: list[Requirement]
    tests: list[DesignTest]


class Dependency(Record):
    source_module: Text
    target_module: Text
    type: Literal["F", "D", "P", "S", "O"]
    criticality: Literal["HARD", "SOFT"]
    verification: Literal["CONFIRMED", "CANDIDATE", "REJECTED"]
    required_for: Literal["BUILD", "TEST", "RELEASE", "RUN"]
    cohort_scope: list[CohortID]
    reason: Text
    evidence_refs: list[Evidence]
    workaround: Text


class Cohort(Record):
    cohort: CohortID
    applicability: Literal["APPLICABLE", "CONDITIONAL", "NOT_APPLICABLE", "UNKNOWN"]
    interaction_pattern: Text
    authorized_actor: Text
    approval_actor: Text
    data_scope: Text
    alternative_path: Text
    evidence_confidence: Text


class Authorization(Record):
    default: Literal["DENY"]
    check_before: list[Literal["read", "cache", "inference", "external_call", "write"]]
    rules: list[Text]


class Candidate(Record):
    id: Text
    title: Text
    parent_module: Text
    domain: Text
    group: Text
    primary_outcome: Text
    target_users: list[Text]
    user_value: Text
    trigger: Text
    preconditions: list[Text]
    inputs: list[Text]
    outputs: list[Text]
    primary_data_owner: Text
    data_classification: Text
    authorization: Authorization
    autonomy_permissions: Text
    age_variants: Text
    cohort_applicability: list[Cohort]
    main_flow: list[Text]
    alternative_flows: list[Text]
    failure_recovery: list[Text]
    acceptance_criteria: list[Text]
    dependencies: list[Dependency]
    execution_type: Literal["E0", "E1", "E2", "E3"]
    ai_cost_risk: Text
    research_refs: list[Text]
    source_trace: list[Evidence]
    review_issues: list[Text]
    definition_status: Literal["BASELINE_PROPOSED"]
    assessment_status: Literal["NOT_EVALUATED", "NEEDS_REVIEW"]
    delivery_status: Literal["NOT_PLANNED"]
    mvp_decision: Literal["NOT_DECIDED"]


class Design(Record):
    candidates: list[Candidate]


class Coverage(Record):
    test_id: Text
    candidate_ids: list[Text]
    status: Literal["covered", "gap", "external", "uncertain"]
    reason: Text
    sources: list[Evidence]


class Finding(Record):
    id: Text
    disposition: Disposition
    statement: Text
    counterexample: Text
    expected_output: Text
    proposed_action: Text
    sources: list[Evidence]


class Review(Record):
    coverage: list[Coverage]
    findings: list[Finding]


class BaselineMatch(Record):
    baseline_id: Text
    status: Literal["equivalent", "partial", "gap", "conflict"]
    test_ids: list[Text]
    reason: Text


class Comparison(Record):
    matches: list[BaselineMatch]
    findings: list[Finding]


class Decision(Record):
    finding_id: Text
    disposition: Disposition
    reason: Text


class Coordination(Record):
    decisions: list[Decision]


class ModelConfig(Record):
    name: Text
    context_tokens: Annotated[int, Field(gt=0)]
    output_tokens: Annotated[int, Field(gt=0)]
    input_usd_per_million: Annotated[float, Field(gt=0)]
    output_usd_per_million: Annotated[float, Field(gt=0)]


class Config(Record):
    max_repairs: Annotated[int, Field(ge=0, le=3)]
    budget_usd: Annotated[float, Field(gt=0, le=100)]
    max_calls: Annotated[int, Field(ge=1, le=50)]
    models: dict[Text, ModelConfig]


class Check(Record):
    code: str
    detail: str

