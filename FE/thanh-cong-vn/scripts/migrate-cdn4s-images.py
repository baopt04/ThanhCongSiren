import os
import urllib.request
import urllib.parse
from PIL import Image
import io

BASE_DIR = r"d:\ThanhCong_Web\FE\thanh-cong-vn"
ASSETS_DIR = os.path.join(BASE_DIR, "src", "assets", "images")

TASKS = [
    # Projects
    {
        "group": "projects",
        "name": "sapa-thuy-dien",
        "url": "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-lap-dat-tai-nha-dieu-hanh-thuy-dien-sapa.jpg"
    },
    {
        "group": "projects",
        "name": "nha-may-thuy-dien",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/nha-may-thuy-dien.jpg"
    },
    {
        "group": "projects",
        "name": "bao-dong-nha-may",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/bao-dong-nha-may-1.jpg"
    },
    {
        "group": "projects",
        "name": "khai-thac-khoang-san",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/khai-thac-khoang-san.jpg"
    },

    # Products (Fallbacks & Cart)
    {
        "group": "products",
        "name": "coi-quay-tay-lk100a",
        "url": "https://cdn0344.cdn4s.com/media/2020/11/coi-quay-tay-lk100a.jpg"
    },
    {
        "group": "products",
        "name": "coi-quay-tay-lkfx200",
        "url": "https://cdn0344.cdn4s.com/media/2020/11/coi-quay-tay-lkfx200.jpg"
    },
    {
        "group": "products",
        "name": "coi-quay-tay-lk100",
        "url": "https://cdn0344.cdn4s.com/media/2020/11/lk-100.jpg"
    },
    {
        "group": "products",
        "name": "coi-quay-tay-lk120a",
        "url": "https://cdn0344.cdn4s.com/media/2020/11/coi-quay-tay-lk120a.jpg"
    },
    {
        "group": "products",
        "name": "quat-pin-bf50",
        "url": "https://cdn0344.cdn4s.com/thumbs/2026/quat-gio-chay-bang-pin-bf50/quat-gio-chay-bang-pin-bf50_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "may-thoi-khi-esv280",
        "url": "https://cdn0344.cdn4s.com/thumbs/2020/11/lk-esv280_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "may-thoi-khi-esv230",
        "url": "https://cdn0344.cdn4s.com/thumbs/2020/11/lk-esv230-2_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "may-thoi-khi-ap-luc-nuoc",
        "url": "https://cdn0344.cdn4s.com/thumbs/2020/11/may-thoi-khi-bang-ap-luc-nuoc_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "dem-cuu-ho-14x10x35m",
        "url": "https://cdn0344.cdn4s.com/thumbs/2022/m%20h%C6%A1i%20cnch/14x10x35m/dem-cuu-ho-14x10x35m_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "dem-hoi-cuu-ho-5x4x25m",
        "url": "https://cdn0344.cdn4s.com/thumbs/2022/m%20h%C6%A1i%20cnch/5x4x2%2C5m/dem-hoi-cuu-ho-5x4x25m_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "dem-hoi-cuu-ho-8x6x25",
        "url": "https://cdn0344.cdn4s.com/thumbs/2022/m%20h%C6%A1i%20cnch/8x6x2%2C5m/dem-hoi-cuu-ho-8x6x25_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "phao-cuu-sinh",
        "url": "https://cdn0344.cdn4s.com/thumbs/2020/11/phao-cuu-sinh_thumb_350.jpg"
    },
    {
        "group": "products",
        "name": "coi-hu-song-hinh",
        "url": "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-lap-tai-nha-may-thuy-dien-song-hinh.jpg"
    },

    # News
    {
        "group": "news",
        "name": "mo-hinh-to-lien-gia",
        "url": "https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/hien/mo-hinh-to-lien-gia-an-toan-pccc.jpg"
    },

    # About
    {
        "group": "about",
        "name": "bao-dong-thanh-pho",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/bao-dong-thanh-pho.jpg"
    },
    {
        "group": "about",
        "name": "san-golf",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/san-golf.jpg"
    },
    {
        "group": "about",
        "name": "may-thoi-khi-cuu-ho",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/may-thoi-khi-cuu-ho.jpg"
    },
    {
        "group": "about",
        "name": "khach-hang-noi-ve",
        "url": "https://cdn0344.cdn4s.com/media/bv-gioi-thieu/coi-hu-bao-dong-khach-hang-noi-ve.jpg"
    }
]

def download_image(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

def process_task(task):
    group_dir = os.path.join(ASSETS_DIR, task["group"])
    os.makedirs(group_dir, exist_ok=True)

    url = task["url"]
    print(f"Downloading [{task['group']}] {task['name']} from {url}...")
    try:
        data = download_image(url)
    except Exception as e:
        print(f"  ERROR downloading {url}: {e}")
        return False

    try:
        img = Image.open(io.BytesIO(data))
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")

        orig_w, orig_h = img.size
        aspect = orig_h / orig_w

        for target_w in (360, 720):
            target_h = max(1, round(target_w * aspect))
            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            out_filename = f"{task['name']}-{target_w}.webp"
            out_path = os.path.join(group_dir, out_filename)
            resized.save(out_path, "WEBP", quality=75, method=6)
            size_kb = os.path.getsize(out_path) / 1024
            print(f"  -> Saved {out_filename}: {target_w}x{target_h} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"  ERROR processing {task['name']}: {e}")
        return False

def main():
    success_count = 0
    fail_count = 0
    for task in TASKS:
        ok = process_task(task)
        if ok:
            success_count += 1
        else:
            fail_count += 1
    print(f"\nCompleted! Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
