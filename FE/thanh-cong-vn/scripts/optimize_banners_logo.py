import os
import shutil
from PIL import Image

ASSETS_DIR = r"d:\ThanhCong_Web\FE\thanh-cong-vn\src\assets"

# 1. Logo
logo_path = os.path.join(ASSETS_DIR, "logo.webp")
logo_orig_path = os.path.join(ASSETS_DIR, "logo-original.webp")

if not os.path.exists(logo_orig_path):
    shutil.copy2(logo_path, logo_orig_path)
    print(f"Backed up logo to {logo_orig_path}")

img_logo = Image.open(logo_orig_path)
w, h = img_logo.size
target_w = 200
target_h = round(h * (target_w / w))
img_logo_resized = img_logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
img_logo_resized.save(logo_path, "WEBP", quality=80, method=6)
logo_size_kb = os.path.getsize(logo_path) / 1024
print(f"logo.webp resized to {target_w}x{target_h}: {logo_size_kb:.2f} KB")

# Also update public/logo.webp
public_logo = r"d:\ThanhCong_Web\FE\thanh-cong-vn\public\logo.webp"
shutil.copy2(logo_path, public_logo)

# 2. Banners
banners = ["Banner_1_mobile", "Banner_2_mobile", "Banner_3_mobile"]
for b in banners:
    orig_file = os.path.join(ASSETS_DIR, f"{b}.webp")
    backup_file = os.path.join(ASSETS_DIR, f"{b}-original.webp")
    if not os.path.exists(backup_file):
        shutil.copy2(orig_file, backup_file)

    img_banner = Image.open(backup_file)
    # Save with quality ~72
    img_banner.save(orig_file, "WEBP", quality=72, method=6)
    size_kb = os.path.getsize(orig_file) / 1024
    print(f"{b}.webp recompressed (q=72): {size_kb:.2f} KB (was {os.path.getsize(backup_file)/1024:.2f} KB)")
