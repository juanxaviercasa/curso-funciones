"""Read-only local PDF index. Requires pypdf; never extracts content into the app."""
import argparse
import json
import re
from pathlib import Path
from pypdf import PdfReader


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources-root', type=Path, default=Path.home() / 'Music')
    parser.add_argument('--out', type=Path, default=Path('.local-sources/preuniversity-pdf-index.json'))
    args = parser.parse_args()
    root = args.sources_root / 'api_reverse' / 'libros_descargados'
    terms = {'funciones': r'funci[oó]n|funciones', 'trigonometría': r'trigonom|seno|coseno|tangente',
             'exponencial/logaritmo': r'exponencial|logar[ií]tm', 'dominio/rango': r'dominio|rango'}
    records = []
    for grade in (3, 4, 5):
        path = root / 'Secundaria' / f'{grade}_Secundaria' / 'MATEMÁTICA TEXTO.pdf'
        if not path.is_file():
            records.append({'file': str(path.relative_to(root)), 'missing': True})
            continue
        reader = PdfReader(path)
        hits = {key: [] for key in terms}
        for index, page in enumerate(reader.pages):
            text = page.extract_text() or ''
            for key, pattern in terms.items():
                if re.search(pattern, text, re.IGNORECASE):
                    hits[key].append(index + 1)
        records.append({'file': path.relative_to(root).as_posix(), 'pages': len(reader.pages),
                        'pdf_author_metadata': str((reader.metadata or {}).get('/Author', 'No identificado')),
                        'topics_text_matches_pdf_pages': hits,
                        'rights': 'pending', 'math_review': 'pending',
                        'note': 'Páginas físicas del PDF, desde 1; coincidencia textual no certifica cobertura ni autoría.'})
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(records, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
