"""Inventario offline. No ejecuta código de las fuentes ni descarga recursos."""
import argparse
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources-root', type=Path, default=Path.home() / 'Music')
    args = parser.parse_args()
    root = args.sources_root.resolve()
    project = Path(__file__).resolve().parents[1]
    output = project / '.local-sources'
    output.mkdir(exist_ok=True)
    summary = {'sources_present': {}, 'catalogs': {}, 'pdfs': {}}
    for name in ('funciones', 'api_reverse'):
        summary['sources_present'][name] = (root / name).is_dir()
    for name in ('catalogo_apps_interactivas.csv', 'catalogo_apps_interactivas_secundaria.csv'):
        source = root / 'api_reverse' / name
        if not source.is_file():
            summary['catalogs'][name] = {'missing': True}
            continue
        with source.open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream, delimiter=';'))
        ids = [row['ID_App'] for row in rows]
        summary['catalogs'][name] = {
            'rows': len(rows), 'unique_ids': len(set(ids)),
            'subjects': dict(Counter(row['Materia'] for row in rows)),
            'note': 'URLs inventariadas; disponibilidad y permisos no verificados',
        }
    files = []
    pdf_root = root / 'api_reverse' / 'libros_descargados'
    for source in sorted(pdf_root.rglob('*')):
        if not source.is_file() or source.suffix.lower() != '.pdf':
            continue
        digest = hashlib.sha256()
        with source.open('rb') as stream:
            signature = stream.read(5)
            digest.update(signature)
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        files.append({'path': source.relative_to(pdf_root).as_posix(),
                      'bytes': source.stat().st_size, 'sha256': digest.hexdigest(),
                      'pdf_header': signature == b'%PDF-',
                      'status': 'draft', 'rights': 'pending', 'math_review': 'pending'})
    summary['pdfs'] = {
        'files': len(files), 'unique_sha256': len({item['sha256'] for item in files}),
        'bytes': sum(item['bytes'] for item in files),
        'invalid_headers': sum(not item['pdf_header'] for item in files),
        'categories': dict(Counter(item['path'].split('/')[0] for item in files)),
        'note': 'Firma y hash no verifican integridad completa, títulos ni derechos',
    }
    (output / 'pdf-inventory.json').write_text(json.dumps(files, ensure_ascii=False, indent=2), encoding='utf-8')
    (output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
