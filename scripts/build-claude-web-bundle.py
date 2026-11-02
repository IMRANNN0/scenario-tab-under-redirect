"""Build a Claude upload ZIP from the canonical component skills."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent.parent
name = 'affiliate-funnel-claude'
skill = root / 'claude-web' / name / 'SKILL.md'
components = root / '.agents' / 'skills'
names = ('affiliate-funnel-orchestrator', 'cloudflare-verification', 'cookie-manager',
         'funnel-qa', 'gotooffer-tracking', 'offer-tab-router', 'swipe-interaction')
output = root / 'releases' / f'{name}.zip'
output.parent.mkdir(parents=True, exist_ok=True)

def add(archive, file, target):
    info = ZipInfo(target.as_posix(), date_time=(2020, 1, 1, 0, 0, 0))
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, file.read_bytes())

with ZipFile(output, 'w') as archive:
    add(archive, skill, Path(name) / 'SKILL.md')
    for folder in names:
        for file in sorted((components / folder).rglob('*')):
            if file.is_file() and 'reports' not in file.relative_to(components).parts:
                add(archive, file, Path(name) / 'components' / file.relative_to(components))
    for filename in ('package.json', 'package-lock.json', 'requirements-dev.txt'):
        add(archive, components / filename, Path(name) / 'components' / filename)
print(f'Built {output}')
