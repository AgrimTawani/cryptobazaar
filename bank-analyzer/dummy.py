import opendataloader_pdf
import tempfile

print("Building font cache...")
with tempfile.TemporaryDirectory() as temp_out_dir:
    try:
        # Create a minimal dummy PDF
        with open("dummy.pdf", "wb") as f:
            f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj 4 0 obj<</Length 21>>stream\nBT /F1 24 Tf 100 700 Td (Hello) Tj ET\nendstream\nendobj xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000109 00000 n\n0000000203 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n274\n%%EOF\n")
        opendataloader_pdf.convert(
            input_path="dummy.pdf",
            output_dir=temp_out_dir,
            format="json"
        )
        print("Font cache built successfully!")
    except Exception as e:
        print(f"Error building font cache: {e}")
