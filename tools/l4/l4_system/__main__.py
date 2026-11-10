import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from .agents import LiveAgents, OUTPUT
from .mock import MockAgents
from .report import render
from .run import Budget, cross_module, run_module, write_json
from .schema import Config
from .sources import DESIGN_DIR, HOME, MODULE


async def run(args, config, destination):
    backend = MockAgents() if args.mode == "mock" else LiveAgents()
    budget = Budget(config, backend)
    try:
        states = [await run_module(args.repo, args.pilot_root, destination / module, module, budget)
                  for module in args.module]
    finally:
        await backend.close()
    cross = cross_module(states)
    status = ("owner_review" if all(s["status"] == "owner_review" for s in states)
              else "stopped")
    write_json(destination / "summary.json", {
        "mode": args.mode, "status": status, "modules": args.module,
        "budget_usd": config.budget_usd, "accounted_usd": float(budget.total),
        "product_tests_executed": 0, "cross_module": cross,
    })
    (destination / "report.md").write_text(render(states, cross, args.mode, budget.total, status),
                                          encoding="utf-8")
    print(f"Báo cáo: {destination / 'report.md'}")
    return 0 if status == "owner_review" else 2


def main():
    parser = argparse.ArgumentParser(description="Rà soát thiết kế L4 của Parent-Pal.")
    parser.add_argument("--module", required=True, nargs="+")
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--pilot-root", type=Path, required=True)
    parser.add_argument("--mode", choices=["mock", "openai"], default="mock")
    parser.add_argument("--config", type=Path, default=HOME / "config.example.json")
    parser.add_argument("--out", type=Path, default=HOME / "runs")
    args = parser.parse_args()
    if not all(MODULE.fullmatch(module) for module in args.module) or len(set(args.module)) != len(args.module):
        parser.error("Mã L3 phải đúng mẫu Fxx-Gyy-Mzz và không trùng.")
    for root in (args.repo, args.pilot_root):
        if args.out.resolve().is_relative_to((root / DESIGN_DIR).resolve()):
            parser.error("Thư mục báo cáo phải nằm ngoài tài liệu thiết kế.")
    try:
        config = Config.model_validate_json(args.config.read_text(encoding="utf-8"))
        if set(config.models) != set(OUTPUT):
            raise ValueError("Cần cấu hình model cho đủ năm lượt thực thi.")
        destination = args.out / f"{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}-{uuid4().hex[:8]}"
        destination.mkdir(parents=True)
        write_json(destination / "config.json", config.model_dump())
        return asyncio.run(run(args, config, destination))
    except (OSError, ValueError, RuntimeError, ImportError) as error:
        parser.exit(2, f"Dừng do lỗi thiết lập ({type(error).__name__}): {error}\n")


if __name__ == "__main__":
    raise SystemExit(main())

