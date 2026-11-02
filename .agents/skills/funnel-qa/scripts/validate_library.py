"""Run the installed official validator, then check real library references/metadata."""
import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

NAMES = ('cookie-manager', 'gotooffer-tracking', 'swipe-interaction',
         'cloudflare-verification', 'offer-tab-router', 'funnel-qa',
         'affiliate-funnel-orchestrator')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--official-validator', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    codex_root = Path(os.environ.get('CODEX_HOME', Path.home() / '.codex'))
    validator = args.official_validator or codex_root / 'skills/.system/skill-creator/scripts/quick_validate.py'
    rows = []
    for name in NAMES:
        folder = root / name
        if importlib.util.find_spec('yaml') is None:
            row = {'skill': name, 'official': 'NOT_RUN', 'detail': 'PyYAML missing; install requirements-dev.txt'}
        elif validator.is_file():
            result = subprocess.run([sys.executable, str(validator), str(folder)], capture_output=True, text=True)
            row = {'skill': name, 'official': 'PASS' if result.returncode == 0 else 'FAIL',
                   'detail': (result.stdout + result.stderr).strip()}
        else:
            row = {'skill': name, 'official': 'NOT_RUN', 'detail': 'Installed official quick_validate.py not found'}
        text = (folder / 'SKILL.md').read_text(encoding='utf-8')
        missing = []
        # Follow the local Markdown resource graph, not only the entrypoint.
        for source in [folder / 'SKILL.md', *folder.glob('references/*.md')]:
            for target in re.findall(r'\]\(([^)]+)\)', source.read_text(encoding='utf-8')):
                if '://' in target or target.startswith('#'):
                    continue
                if not (source.parent / target.split('#')[0]).exists():
                    missing.append(f'{source.name}: {target}')
        row['references'] = 'FAIL' if missing else 'PASS'
        row['missing'] = missing
        try:
            import yaml
            ui = yaml.safe_load((folder / 'agents/openai.yaml').read_text(encoding='utf-8'))
            interface = ui.get('interface', {})
            row['metadata'] = 'PASS' if (25 <= len(interface.get('short_description', '')) <= 64
                and f'${name}' in interface.get('default_prompt', '')
                and ui.get('policy', {}).get('allow_implicit_invocation', True)) else 'FAIL'
        except ModuleNotFoundError as error:
            row['metadata'] = 'NOT_RUN'
            row['metadata_error'] = str(error)
        except Exception as error:
            row['metadata'] = 'FAIL'
            row['metadata_error'] = str(error)
        rows.append(row)
    report = {'official_validator': str(validator), 'results': rows,
              'note': 'Official frontmatter validation does not establish runtime or behavioral correctness.'}
    reports = root / 'funnel-qa/reports'
    reports.mkdir(parents=True, exist_ok=True)
    (reports / 'skills.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    for row in rows:
        print(f"{row['skill']}: official={row['official']} links={row['references']} metadata={row['metadata']}")
    return int(any(any(row[key] != 'PASS' for key in ('official', 'references', 'metadata')) for row in rows))

if __name__ == '__main__':
    sys.exit(main())
