"""
Automated Test Runner for BagheTwin Prototype
Executes backend pytest suites and frontend build checks.
"""

import sys
import subprocess
from pathlib import Path


def run_tests():
    root_dir = Path(__file__).resolve().parent.parent
    print("==================================================")
    print("  RUNNING BAGHETWIN COMPLETE VERIFICATION SUITE   ")
    print("==================================================")

    # 1. Backend Pytest
    print("\n[Step 1/2] Running Backend Unit & Integration Tests (pytest)...")
    pytest_res = subprocess.run(
        [sys.executable, "-m", "pytest", "backend/tests/", "-v"],
        cwd=str(root_dir)
    )
    if pytest_res.returncode != 0:
        print("\nBackend tests failed!")
        sys.exit(pytest_res.returncode)

    # 2. Frontend Build
    print("\n[Step 2/2] Running Frontend TypeScript Typecheck & Build...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_res = subprocess.run(
        [npm_cmd, "run", "build"],
        cwd=str(root_dir / "frontend")
    )
    if frontend_res.returncode != 0:
        print("\nFrontend build failed!")
        sys.exit(frontend_res.returncode)

    print("\n==================================================")
    print("  ALL TESTS & BUILDS PASSED SUCCESSFULLY! (100%)  ")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
