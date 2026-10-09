import os
import re
import json

base_dir = r"d:\ThanhCong_Web\FE\thanh-cong-vn"
src_dir = os.path.join(base_dir, "src")
results = []

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css', '.html')):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_dir).replace('\\', '/')
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                for idx, line in enumerate(f, start=1):
                    match = re.search(r'https?://[^\s\'"`]+cdn4s[^\s\'"`]+', line)
                    if match:
                        clean_url = match.group(0).rstrip(';,")\'')
                        results.append({
                            "file": rel_path,
                            "line": idx,
                            "url": clean_url
                        })

# Check index.html too
idx_path = os.path.join(base_dir, "index.html")
if os.path.exists(idx_path):
    with open(idx_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f, start=1):
            match = re.search(r'https?://[^\s\'"`]+cdn4s[^\s\'"`]+', line)
            if match:
                clean_url = match.group(0).rstrip(';,")\'')
                results.append({
                    "file": "index.html",
                    "line": idx,
                    "url": clean_url
                })

print(json.dumps(results, indent=2, ensure_ascii=False))
