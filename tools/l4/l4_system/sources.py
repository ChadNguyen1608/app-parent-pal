import hashlib
import json
import re
from pathlib import Path

from .schema import Evidence

HOME = Path(__file__).resolve().parents[1]
MODULE = re.compile(r"F\d{2}-G\d{2}-M\d{2}")
DESIGN_DIR = Path("documents/app-design-document")


class Sources:
    def __init__(self, root: Path, pilot_root: Path, module: str):
        self.manifest = json.loads((HOME / "sources.json").read_text(encoding="utf-8"))
        self.documents = {}
        self.primary = {}
        self.method = {}
        self.comparison = {}
        self.baseline = {}
        self.module = module
        for path in self.manifest["canonical"]:
            self.load(root, path, self.primary)
        inventory_path = next(path for path in self.primary if "Blueprint_03_2_" in path)
        inventory = self.primary[inventory_path]["lines"]
        section = "\n".join(inventory).partition("## 4. Feature Inventory")[2].split("\n## 5.", 1)[0]
        table_rows = [row for row in section.splitlines() if row.startswith("|")]
        self.inventory = {m.group(1) for row in table_rows for m in re.finditer(
            r"\x60(F\d{2}-G\d{2}-M\d{2})\x60", row)}
        self.research = set(re.findall(r"\bMR-\d{3}\b", "\n".join(
            line for path, doc in self.primary.items() if "Master_Research" in path
            for line in doc["lines"] if re.match(r"^\|\s*[\x60*]*MR-\d{3}\b", line))))
        if not MODULE.fullmatch(module) or module not in self.inventory:
            raise ValueError("L3 không có trong bảng Blueprint 3.2.")
        for path in self.manifest["method"]:
            self.load(pilot_root, path, self.method)
        for item in self.manifest["owner"]:
            self.load(pilot_root, item["path"], self.primary, item["ranges"])
        if module in self.manifest["modules"]:
            self.load_baseline(pilot_root, self.manifest["modules"][module])
        self.load_regression(root)

    def load_regression(self, root):
        path = f"tools/l4/regression/{self.module}.json"
        target = (root / path).resolve()
        if not target.is_relative_to((root / "tools/l4/regression").resolve()):
            raise ValueError("Baseline hồi quy nằm ngoài thư mục được phép.")
        if not target.is_file():
            return
        raw = target.read_text(encoding="utf-8-sig")
        cases = json.loads(raw)
        if not isinstance(cases, list) or not cases:
            raise ValueError("Baseline hồi quy phải là mảng ca kiểm thử có nội dung.")
        for item in cases:
            fields = {"id", "setup_and_action", "expected_output"}
            if (not isinstance(item, dict) or item.keys() != fields
                    or not all(isinstance(v, str) and v.strip() for v in item.values())
                    or not re.fullmatch(r"REG-\d{3,}", item["id"]) or item["id"] in self.baseline):
                raise ValueError("Baseline hồi quy thiếu trường, sai định dạng hoặc trùng ID.")
            self.baseline[item["id"]] = {**item, "source": path, "line": 1}
        self.documents[path] = hashlib.sha256(raw.encode()).hexdigest()


    def load(self, root, path, destination, ranges=None):
        relative = Path(path)
        target = (root / relative).resolve()
        if not target.is_relative_to((root / DESIGN_DIR).resolve()) or relative.suffix != ".md":
            raise ValueError("Nguồn nằm ngoài danh sách tài liệu thiết kế.")
        lines = target.read_text(encoding="utf-8-sig").splitlines()
        digest = hashlib.sha256("\n".join(lines).encode()).hexdigest()
        self.documents[path] = digest
        visible = (set(range(1, len(lines) + 1)) if ranges is None else
                   {i for start, end in ranges for i in range(start, end + 1)})
        if not visible.issubset(range(1, len(lines) + 1)):
            raise ValueError("Trích đoạn quyết định vượt phạm vi tài liệu.")
        destination[path] = {"lines": lines, "visible": visible}

    def load_baseline(self, root, item):
        patterns = [
            (self.manifest["legacy"], "TC-L4-", 3, 4),
            (item["review"], "MP-", 2, 3),
            (self.manifest["p5_registry"], "MP-", 2, 3),
        ]
        for (path, prefix, setup, expected), count in zip(patterns, item["counts"], strict=True):
            self.load(root, path, self.comparison)
            found = 0
            for number, line in enumerate(self.comparison[path]["lines"], 1):
                cells = line.split("|")
                if len(cells) < 6 or not line.startswith("|"):
                    continue
                case = cells[1].strip(" \x60")
                if not re.fullmatch(prefix + item["letter"] + r"\d{2}", case):
                    continue
                if not cells[setup].strip() or not cells[expected].strip() or case in self.baseline:
                    raise ValueError(f"Dòng hồi quy thiếu dữ liệu hoặc bị trùng ({case}).")
                self.baseline[case] = {
                    "setup_and_action": cells[setup].strip(), "expected_output": cells[expected].strip(),
                    "source": path, "line": number,
                }
                found += 1
            if found != count:
                raise ValueError(f"Số test tại {path} khác snapshot đã kiểm tra ({found}/{count}).")
        self.load(root, self.manifest["p5_contract"], self.comparison)

    def render(self, collection):
        return {path: "\n".join(f"{i}: {line}" for i, line in enumerate(doc["lines"], 1)
                               if i in doc["visible"] and line.strip())
                for path, doc in collection.items()}

    def evidence_valid(self, evidence: Evidence, authoritative=True):
        docs = self.primary | self.method
        if not authoritative:
            docs = docs | self.comparison
        doc = docs.get(evidence.source)
        if not doc or not (1 <= evidence.start <= evidence.end <= len(doc["lines"])):
            return False
        return (all(i in doc["visible"] for i in range(evidence.start, evidence.end + 1))
                and any(doc["lines"][i - 1].strip() for i in range(evidence.start, evidence.end + 1)))

