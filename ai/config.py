"""Dehqon AI uchun barcha umumiy konfiguratsiya qiymatlari."""  # Ushbu modul AI pipeline va mobil eksport uchun yagona sozlama manbaidir.

from __future__ import annotations  # Python 3.12 da zamonaviy type hint sintaksisini yoqadi.

import os  # Foydalanuvchi kompyuteridagi muhit o'zgaruvchilarini o'qish uchun kerak.
from pathlib import Path  # Windows va boshqa tizimlarda xavfsiz fayl yo'llarini yaratadi.

PROJECT_ROOT = Path(__file__).resolve().parent.parent  # Loyiha ildiz papkasini ai/ papkasidan hisoblaydi.
AI_DIR = PROJECT_ROOT / "ai"  # AI kodlari, modellar va konfiguratsiyalar joylashadigan papkani belgilaydi.
DATA_DIR = PROJECT_ROOT / "data"  # Dataset va mahalliy JSON ma'lumotlari uchun umumiy papkani belgilaydi.
MODEL_DIR = AI_DIR / "models"  # O'qitilgan Keras va TensorFlow Lite modellarining papkasini belgilaydi.
DATASET_DIR = Path(os.getenv("DEHQON_DATASET_DIR", str(DATA_DIR / "plantvillage" / "color")))  # Dataset yo'lini muhit orqali almashtirishga imkon beradi.
MODEL_DIR.mkdir(parents=True, exist_ok=True)  # Model saqlash papkasini birinchi ishga tushishda avtomatik yaratadi.

IMAGE_SIZE = (224, 224)  # MobileNetV3 uchun standart kirish rasm o'lchamini belgilaydi.
IMAGE_CHANNELS = 3  # Model RGB rasmlardan foydalanishini bildiradi.
BATCH_SIZE = int(os.getenv("DEHQON_BATCH_SIZE", "32"))  # Bir qadamda o'qiladigan rasmlar sonini sozlaydi.
EPOCHS = int(os.getenv("DEHQON_EPOCHS", "12"))  # Model o'qitish davrlari sonini sozlaydi.
VALIDATION_SPLIT = float(os.getenv("DEHQON_VALIDATION_SPLIT", "0.2"))  # Datasetning tekshiruv uchun ajratiladigan ulushini belgilaydi.
SEED = int(os.getenv("DEHQON_SEED", "42"))  # Dataset bo'linishini takrorlanadigan qiladi.
MODEL_NAME = os.getenv("DEHQON_MODEL_NAME", "plant_disease")  # Model fayllari uchun umumiy nomni belgilaydi.
BACKBONE_NAME = "MobileNetV3Small"  # Transfer learning uchun ishlatiladigan TensorFlow arxitekturasini belgilaydi.
TENSORFLOW_VERSION = "2.21.0"  # Loyihada kutilayotgan TensorFlow versiyasini hujjatlashtiradi.

KERAS_MODEL_PATH = MODEL_DIR / f"{MODEL_NAME}.keras"  # To'liq Keras modelining saqlash yo'lini belgilaydi.
TFLITE_MODEL_PATH = MODEL_DIR / f"{MODEL_NAME}.tflite"  # Offline mobil inference uchun TFLite yo'lini belgilaydi.
CLASS_NAMES_PATH = MODEL_DIR / "class_names.txt"  # Model sinflari tartibi yoziladigan fayl yo'lini belgilaydi.

JSON_DATA_DIR = Path(os.getenv("DEHQON_JSON_DATA_DIR", str(DATA_DIR)))  # Yangilanadigan JSON ma'lumotlari papkasini sozlaydi.
DISEASE_DATA_PATH = JSON_DATA_DIR / "disease_data.json"  # Kasallik va davolash ma'lumotlari uchun JSON yo'lini belgilaydi.
IRRIGATION_DATA_PATH = JSON_DATA_DIR / "irrigation_data.json"  # Sug'orish qoidalari uchun JSON yo'lini belgilaydi.
SUBSIDY_DATA_PATH = JSON_DATA_DIR / "subsidy_data.json"  # Subsidiyalar bazasi uchun JSON yo'lini belgilaydi.
ALERTS_DATA_PATH = JSON_DATA_DIR / "disease_alerts.json"  # Yangi kasallik ogohlantirishlari uchun JSON yo'lini belgilaydi.

SUPPORTED_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")  # Dataset qabul qiladigan rasm formatlarini belgilaydi.
MIN_CONFIDENCE = float(os.getenv("DEHQON_MIN_CONFIDENCE", "0.60"))  # Ishonch past bo'lganda natijani ehtiyotkor ko'rsatish chegarasini belgilaydi.
OFFLINE_MODEL_ENABLED = os.getenv("DEHQON_OFFLINE_MODEL_ENABLED", "true").lower() == "true"  # Offline model ishlatilishini muhit orqali yoqadi yoki o'chiradi.
