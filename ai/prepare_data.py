"""PlantVillage datasetini tekshirish va sinflar manifestini yaratish moduli."""  # Modulning vazifasini qisqa tushuntiradi.

from __future__ import annotations  # Python 3.12 type hintlarini kechiktirib baholashga imkon beradi.

from collections import Counter  # Har bir sinfdagi rasmlar sonini hisoblash uchun ishlatiladi.
from pathlib import Path  # Windows va boshqa tizimlar uchun xavfsiz yo'llar bilan ishlaydi.

from ai.config import CLASS_NAMES_PATH, DATASET_DIR, SUPPORTED_IMAGE_EXTENSIONS  # Markaziy loyiha sozlamalarini olib kiradi.

EXPECTED_CLASS_COUNT = 38  # PlantVillage ishlatilayotgan bo'lsa, kutiladigan sinflar sonini belgilaydi.
IMAGE_EXTENSIONS = set(SUPPORTED_IMAGE_EXTENSIONS)  # Konfiguratsiyadagi barcha rasm formatlarini qabul qiladi.


def _dataset_error(dataset_dir: Path) -> FileNotFoundError:  # Noto'g'ri dataset yo'li uchun tushunarli xato tayyorlaydi.
    message = (  # Foydalanuvchiga muammoni qanday tuzatishni ko'rsatadigan matnni yig'adi.
        f"Dataset topilmadi: {dataset_dir}\n"  # Haqiqiy tekshirilgan yo'lni ko'rsatadi.
        "Yechim: 38 ta sinf papkasini loyiha ichidagi "  # Kerakli papka tuzilmasini tushuntiradi.
        "data/plantvillage/color/ manziliga joylang yoki DEHQON_DATASET_DIR muhit o'zgaruvchisini sozlang."  # Alternativ yo'lni ko'rsatadi.
    )  # Xato matnini yakunlaydi.
    return FileNotFoundError(message)  # Tayyorlangan xato obyektini qaytaradi.


def _image_count(folder: Path) -> int:  # Berilgan sinf papkasidagi rasmlar sonini hisoblaydi.
    return sum(1 for file in folder.rglob("*") if file.is_file() and file.suffix.lower() in IMAGE_EXTENSIONS)  # Faqat qo'llab-quvvatlanadigan fayllarni sanaydi.


def find_classes(dataset_dir: Path = DATASET_DIR, expected_count: int | None = EXPECTED_CLASS_COUNT) -> list[str]:  # Datasetdagi sinf nomlarini topadi va tekshiradi.
    if not dataset_dir.exists():  # Dataset manzili mavjudligini tekshiradi.
        raise _dataset_error(dataset_dir)  # Yo'l yo'q bo'lsa, yechim ko'rsatilgan xatoni chiqaradi.
    if not dataset_dir.is_dir():  # Ko'rsatilgan yo'l papka ekanini tekshiradi.
        raise NotADirectoryError(f"Dataset papka emas: {dataset_dir}")  # Fayl berilgan bo'lsa, tushunarli xato chiqaradi.
    classes = [folder.name for folder in sorted(dataset_dir.iterdir()) if folder.is_dir() and _image_count(folder) > 0]  # Rasmli papkalarni alifbo tartibida yig'adi.
    if not classes:  # Hech qanday rasmli sinf topilgan-topilmaganini tekshiradi.
        raise ValueError(f"Dataset ichida rasmli sinf papkalari topilmadi: {dataset_dir}")  # Bo'sh dataset uchun xato chiqaradi.
    if expected_count is not None and len(classes) != expected_count:  # Topilgan sinflar sonini kutilgan 38 bilan solishtiradi.
        raise ValueError(  # Noto'g'ri sinf soni uchun batafsil diagnostika chiqaradi.
            f"{len(classes)} ta sinf topildi, {expected_count} ta kutilgan: {dataset_dir}\n"  # Haqiqiy va kutilgan sonni ko'rsatadi.
            "Yechim: barcha PlantVillage sinf papkalarini data/plantvillage/color/ ichiga joylang."  # Tuzatish yo'lini ko'rsatadi.
        )  # Sinflar soni xatosini yakunlaydi.
    return classes  # Tekshiruvdan o'tgan sinf nomlarini qaytaradi.


def summarize(dataset_dir: Path = DATASET_DIR, expected_count: int | None = EXPECTED_CLASS_COUNT) -> Counter[str]:  # Har bir sinfdagi rasm sonini hisoblaydi.
    counts: Counter[str] = Counter()  # Natijalarni saqlash uchun bo'sh hisoblagich yaratadi.
    for class_name in find_classes(dataset_dir, expected_count):  # Faqat tekshiruvdan o'tgan sinflarni aylanadi.
        counts[class_name] = _image_count(dataset_dir / class_name)  # Har bir sinfning rasm sonini saqlaydi.
    return counts  # Hisoblangan natijalarni qaytaradi.


def main() -> None:  # Dataset diagnostikasini ishga tushiradi.
    classes = find_classes()  # Datasetdan 38 ta sinf nomini oladi.
    counts = summarize()  # Har bir sinf bo'yicha rasm statistikasini hisoblaydi.
    CLASS_NAMES_PATH.write_text("\n".join(classes) + "\n", encoding="utf-8")  # Model chiqish indekslari bilan bir xil manifest yaratadi.
    print(f"Dataset: {DATASET_DIR}")  # Tekshirilgan dataset yo'lini chiqaradi.
    print(f"{len(classes)} ta sinf topildi.")  # Siniar sonini chiqaradi.
    for class_name, count in counts.items():  # Har bir sinf statistikasini aylanadi.
        print(f"- {class_name}: {count} ta rasm")  # Sinf va rasm sonini chiqaradi.
    print(f"Sinf ro'yxati saqlandi: {CLASS_NAMES_PATH}")  # Manifest saqlangan joyni chiqaradi.


if __name__ == "__main__":  # Fayl to'g'ridan-to'g'ri ishga tushirilganini tekshiradi.
    main()  # Dataset diagnostikasini bajaradi.
