import argparse
import json
import os
import sys

# Add project root so `src` package can be imported when running from scripts/
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.wide_deep import get_default_experiments, run_wide_deep_cv


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Wide & Deep 5-fold benchmark on MovieLens 100K")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/ml-100k",
        help="Path to ML-100K directory containing u.data/u.user/u.item/u.genre and u1..u5 folds",
    )
    parser.add_argument(
        "--experiments",
        nargs="+",
        default=["baseline", "improved"],
        choices=["baseline", "improved"],
        help="Experiments to run",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        help="Device override (e.g. cpu, cuda). Default: auto",
    )
    parser.add_argument(
        "--save-json",
        type=str,
        default="tmp_wide_deep_results.json",
        help="Output path for JSON summary",
    )

    args = parser.parse_args()

    experiments = get_default_experiments()
    all_results = {}

    for exp_name in args.experiments:
        config = experiments[exp_name]
        summary = run_wide_deep_cv(
            data_dir=args.data_dir,
            config=config,
            seed=args.seed,
            device=args.device,
        )
        all_results[exp_name] = summary

    with open(args.save_json, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)

    print(f"\nSaved summary JSON -> {args.save_json}")


if __name__ == "__main__":
    main()
