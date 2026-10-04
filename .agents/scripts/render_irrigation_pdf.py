from pathlib import Path
import sys

import fitz


pdf_path = Path(sys.argv[1])
output_dir = Path(sys.argv[2])
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(pdf_path)
text_parts = []

for page_number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pixmap.save(output_dir / f"page-{page_number:02d}.png")
    text_parts.append(f"\n--- PAGE {page_number} ---\n{page.get_text()}")

(output_dir / "extracted.txt").write_text("".join(text_parts), encoding="utf-8")
print(f"Rendered {len(document)} pages to {output_dir}")
print(f"Extracted text: {output_dir / 'extracted.txt'}")