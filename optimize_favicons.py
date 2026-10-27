#!/usr/bin/env python3
"""
Optimize favicon images for web deployment
"""
from PIL import Image
import os

# Input files
logo_path = "public/photos/Logo-icon.png"
favicon_jpeg = "public/favicon.jpeg"

# Load the logo
logo = Image.open(logo_path)

# Generate optimized favicon sizes
sizes = [16, 32, 48, 64, 128, 192, 512]

print("Generating optimized favicons...")

# Create apple-touch-icon (180x180)
apple_icon = logo.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save("public/apple-touch-icon.png", optimize=True, quality=85)
print(f"✓ Created apple-touch-icon.png (180x180)")

# Create android-chrome icons
for size in [192, 512]:
    android_icon = logo.resize((size, size), Image.Resampling.LANCZOS)
    android_icon.save(f"public/android-chrome-{size}x{size}.png", optimize=True, quality=85)
    print(f"✓ Created android-chrome-{size}x{size}.png")

# Create standard favicon.png (32x32)
favicon_32 = logo.resize((32, 32), Image.Resampling.LANCZOS)
favicon_32.save("public/favicon.png", optimize=True, quality=90)
print(f"✓ Created favicon.png (32x32)")

# Create multi-resolution favicon.ico
favicon_16 = logo.resize((16, 16), Image.Resampling.LANCZOS)
favicon_32 = logo.resize((32, 32), Image.Resampling.LANCZOS)
favicon_48 = logo.resize((48, 48), Image.Resampling.LANCZOS)
favicon_16.save("public/favicon.ico", format='ICO',
                sizes=[(16, 16), (32, 32), (48, 48)],
                append_images=[favicon_32, favicon_48])
print(f"✓ Created optimized favicon.ico (16x16, 32x32, 48x48)")

# Create site.webmanifest
manifest = {
    "name": "Biochemical and Environmental Research Lab (BCER Lab)",
    "short_name": "BCER Lab",
    "icons": [
        {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#166534",
    "background_color": "#ffffff",
    "display": "standalone"
}

import json
with open("public/site.webmanifest", "w") as f:
    json.dump(manifest, f, indent=2)
print(f"✓ Created site.webmanifest")

# File size report
print("\n=== File Size Report ===")
for filename in ["favicon.ico", "favicon.png", "apple-touch-icon.png",
                 "android-chrome-192x192.png", "android-chrome-512x512.png"]:
    filepath = f"public/{filename}"
    if os.path.exists(filepath):
        size_kb = os.path.getsize(filepath) / 1024
        print(f"{filename}: {size_kb:.1f} KB")

print("\n✅ All favicons optimized successfully!")
