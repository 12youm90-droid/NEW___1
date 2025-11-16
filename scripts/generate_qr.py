#!/usr/bin/env python3
"""
Generate a PNG QR code for a given URL.
Usage:
  python3 scripts/generate_qr.py "https://example.com" out.png

Requires: pip install qrcode[pil]
"""
import sys

try:
    import qrcode
except Exception as e:
    print("Missing dependency 'qrcode'. Install with: pip install 'qrcode[pil]'\n", e)
    sys.exit(2)

if len(sys.argv) < 3:
    print('Usage: python3 scripts/generate_qr.py <URL> <OUT_PNG>')
    sys.exit(1)

url = sys.argv[1]
out_file = sys.argv[2]

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(out_file)
print(f'QR code saved to {out_file}')
