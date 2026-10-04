"""Dehqon AI modelini web preview uchun HTTP orqali ishlatadigan server."""  # Server vazifasini qisqacha hujjatlashtiradi.

from __future__ import annotations  # Python 3.12 type hintlarini kechiktirib baholashga imkon beradi.

import json  # JSON javoblarini yaratish uchun ishlatiladi.
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer  # Oddiy ko'p oqimli HTTP serverni beradi.
from io import BytesIO  # Yuklangan rasm baytlarini xotirada o'qish uchun kerak.
from pathlib import Path  # Fayllarni o'qish va ma'lumotlar bazasini topish uchun kerak.
from urllib.parse import parse_qs  # So'rov yo'lidagi query parametrlarini o'qiydi.


if __package__ in (None, ""):
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np  # Rasm matritsasini TensorFlow kirishiga aylantiradi.
import tensorflow as tf  # O'qitilgan Keras modelini inference uchun yuklaydi.
from PIL import Image  # Yuklangan rasmni ochadi va RGB formatga o'tkazadi.

from ai.config import CLASS_NAMES_PATH, IMAGE_SIZE, KERAS_MODEL_PATH  # Model va sinf konfiguratsiyasini olib kiradi.

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DISEASE_DATA = json.loads((DATA_DIR / "disease_data.json").read_text(encoding="utf-8"))

MODEL = tf.keras.models.load_model(KERAS_MODEL_PATH)  # Modelni server ishga tushganda bir marta xotiraga yuklaydi.
CLASS_NAMES = CLASS_NAMES_PATH.read_text(encoding="utf-8").splitlines()  # Model indekslarini sinf nomlari bilan bog'laydi.
MIN_RELIABLE_CONFIDENCE = 0.60  # Internet va telefon rasmlaridagi tabiiy farqlarni hisobga oladi.
MIN_RELIABLE_MARGIN = 0.10  # Birinchi va ikkinchi natija orasidagi yetarli farqni belgilaydi.


def _clean_label(value: str) -> str:
    return value.replace("_", " ").replace("___", " ").replace("__", " ").replace("(", " ").replace(")", " ").replace("  ", " ").strip()


def _translate_class_name(class_name: str) -> tuple[str, str]:
    record = DISEASE_DATA.get(class_name, {})
    plant_raw, _, disease_raw = class_name.partition("___")
    plant = record.get("plant") or _clean_label(plant_raw)
    disease = record.get("disease") or _clean_label(disease_raw or plant_raw)
    if plant_raw.lower().startswith("apple"):
        plant = "Olma"
    elif plant_raw.lower().startswith("peach"):
        plant = "Shaftoli"
    elif plant_raw.lower().startswith("strawberry"):
        plant = "Qulupnay"
    elif plant_raw.lower().startswith("tomato"):
        plant = "Pomidor"
    elif plant_raw.lower().startswith("potato"):
        plant = "Kartoshka"
    elif plant_raw.lower().startswith("grape"):
        plant = "Uzum"
    elif "corn" in plant_raw.lower():
        plant = "Makkajo‘xori"
    elif "pepper" in plant_raw.lower():
        plant = "Bolgar qalampiri"
    elif "cherry" in plant_raw.lower():
        plant = "Gilos"
    elif "orange" in plant_raw.lower():
        plant = "Apelsin"
    elif plant_raw.lower().startswith("blueberry"):
        plant = "Ko‘k mevali buta"
    elif plant_raw.lower().startswith("raspberry"):
        plant = "Malina"
    elif plant_raw.lower().startswith("soybean"):
        plant = "Soya"
    elif plant_raw.lower().startswith("squash"):
        plant = "Qovoq"
    if disease_raw and not record.get("disease"):
        disease = disease_raw.replace("_", " ").replace("___", " ")
        disease = disease.replace("-", " ")
        disease = disease.replace("(Black Measles)", "qora mezl")
        disease = disease.replace("Leaf Mold", "barglarning mog‘orlanganligi")
        disease = disease.replace("Mosaic Virus", "mosaika virusi")
        disease = disease.replace("Yellow Leaf Curl Virus", "sariq barglarning burishishi virusi")
        disease = disease.replace("Bacterial Spot", "bakterial dog‘")
        disease = disease.replace("Bacterial spot", "bakterial dog‘")
        disease = disease.replace("Leaf Scorch", "barg kuyishi")
        disease = disease.replace("Leaf scorch", "barg kuyishi")
        disease = disease.replace("Cedar apple rust", "olma zang kasalligi")
        disease = disease.replace("Common rust", "oddiy zang")
        disease = disease.replace("Cercospora leaf spot Gray leaf spot", "serkospora barg dog‘lanishi")
        disease = disease.replace("Powdery mildew", "un shudringi")
        disease = disease.replace("Target Spot", "nishon dog‘")
        disease = disease.replace("Target spot", "nishon dog‘")
        disease = disease.replace("Spider mites Two-spotted spider mite", "o‘rgimchakkana")
        disease = disease.replace("Spider mites Two-spotted_spider_mite", "o‘rgimchakkana")
        disease = disease.replace("Spider mites Two-spotted", "o‘rgimchakkana")
        disease = disease.replace("Spider mites", "o‘rgimchakkana")
        disease = disease.replace("Tomato mosaic virus", "pomidor mozaika virusi")
        disease = disease.replace("Tomato Yellow Leaf Curl Virus", "pomidor sariq barg burishish virusi")
        disease = disease.replace("Septoria leaf spot", "septoriya barg dog‘lanishi")
        disease = disease.replace("Leaf Mold", "barg mog‘ori")
        disease = disease.replace("Leaf_Mold", "barg mog‘ori")
        disease = disease.replace("healthy", "sog‘lom")
        disease = disease.replace("o‘rgimchakkana Two dog‘ted spider mite", "o‘rgimchakkana")
        disease = disease.replace("o‘rgimchakkana Two-spotted spider mite", "o‘rgimchakkana")
        disease = disease.replace("Early blight", "erta chirish")
        disease = disease.replace("Late blight", "kech chirish")
        disease = disease.replace("scab", "qizarish")
        disease = disease.replace("rot", "chirish")
        disease = disease.replace("spot", "dog‘")
        disease = disease.replace("mildew", "mold")
        disease = disease.replace("o‘rgimchakkana Two dog‘ted spider mite", "o‘rgimchakkana")
        disease = disease.replace("o‘rgimchakkana Two-spotted spider mite", "o‘rgimchakkana")
    return plant, disease


def _localized_prediction(class_name: str, confidence: float) -> dict[str, object]:
    plant, disease = _translate_class_name(class_name)
    return {
        "class_name": class_name,
        "plant": plant,
        "disease": disease,
        "label": f"{plant}: {disease}",
        "confidence": round(confidence * 100, 1),
    }


def _get_treatment(class_name: str) -> tuple[str, str]:
    record = DISEASE_DATA.get(class_name, DISEASE_DATA.get("defaults", {}))
    treatment = record.get("treatment") or DISEASE_DATA["defaults"]["treatment"]
    prevention = record.get("prevention") or DISEASE_DATA["defaults"]["prevention"]
    return treatment, prevention


def predict_image(image_bytes: bytes, plant_hint: str | None = None) -> dict[str, object]:  # Rasm baytlaridan model natijasini hisoblaydi.
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize(IMAGE_SIZE)  # Rasmni model talab qilgan o'lchamga tayyorlaydi.
    pixels = np.asarray(image, dtype=np.float32)[None, ...]  # Rasmni batch o'lchamiga ega NumPy massiviga aylantiradi.
    probabilities = MODEL.predict(pixels, verbose=0)[0]  # 38 sinf uchun ehtimolliklarni hisoblaydi.
    allowed_indices = [index for index, name in enumerate(CLASS_NAMES) if not plant_hint or name.lower().startswith(f"{plant_hint.lower()}___")]
    if not allowed_indices:
        allowed_indices = list(range(len(CLASS_NAMES)))
    candidate_probabilities = probabilities[allowed_indices]
    candidate_total = float(candidate_probabilities.sum())
    if candidate_total > 0:
        candidate_probabilities = candidate_probabilities / candidate_total
    order = np.argsort(candidate_probabilities)[::-1][:3]  # Tanlangan o'simlik ichidagi eng yuqori natijalarni topadi.
    best_index = int(allowed_indices[int(order[0])])  # Eng ishonchli sinf indeksini oladi.
    class_name = CLASS_NAMES[best_index]  # Indeksni PlantVillage sinf nomiga aylantiradi.
    plant, disease = _translate_class_name(class_name)  # Inglizcha nomlarni o‘zbekcha ko‘rinishga o‘tkazadi.
    treatment, prevention = _get_treatment(class_name)  # Kasallikka qarshi davolash va oldini olish tavsiyasini oladi.
    confidence = float(candidate_probabilities[int(order[0])])  # Tanlangan o'simlik ichidagi normallashtirilgan ehtimolni saqlaydi.
    margin = confidence - float(candidate_probabilities[int(order[1])])  # Eng yaxshi va ikkinchi natija orasidagi farqni hisoblaydi.
    reliable = confidence >= MIN_RELIABLE_CONFIDENCE and margin >= MIN_RELIABLE_MARGIN  # Natija yetarlicha ajralganini tekshiradi.
    if disease == "sog‘lom":
        treatment = "Kasallik belgisi topilmadi. O‘simlikni odatdagi parvarishda davom ettiring."
        prevention = "Me’yorida sug‘oring, barglarni kuzating va dalani toza saqlang."
    advice = (
        f"{plant} o‘simligida {disease} aniqlanadi. Davo: {treatment} Oldini olish: {prevention}"
        if reliable
        else "Rasm aniq ko‘rinmayapti. Bargni yaqinroqdan, yorug‘ joyda va toza holatda qayta suratga oling."
    )
    return {  # Frontend uchun aniq va tekshiriladigan JSON javobini qaytaradi.
        "class_name": class_name,  # Asl dataset sinf nomini saqlaydi.
        "plant": plant if reliable else "Aniqlanmadi",  # Ishonchsiz natijada o'simlik nomini noto'g'ri ko'rsatmaydi.
        "disease": disease if reliable else "Ishonchsiz natija",  # Ishonchsiz natijada kasallik tashxisini bermaydi.
        "confidence": round(confidence * 100, 1),  # Ishonchni foizda qaytaradi.
        "reliable": reliable,  # Frontendga natijani tashxis sifatida ko'rsatish mumkinligini bildiradi.
        "margin": round(margin * 100, 1),  # Birinchi va ikkinchi sinf farqini foizda qaytaradi.
        "treatment": treatment,
        "prevention": prevention,
        "advice": advice,
        "top_predictions": [_localized_prediction(CLASS_NAMES[allowed_indices[int(index)]], float(candidate_probabilities[int(index)])) for index in order],  # Muqobil natijalarni o‘zbekcha qaytaradi.
    }  # Javob obyektini yakunlaydi.


class ModelRequestHandler(BaseHTTPRequestHandler):  # Model inference HTTP so'rovlarini boshqaradi.
    def _send_json(self, status: int, payload: dict[str, object]) -> None:  # JSON va CORS headerlarini yuboradi.
        response = json.dumps(payload, ensure_ascii=False).encode("utf-8")  # O'zbekcha belgilarni saqlagan holda JSON yaratadi.
        self.send_response(status)  # HTTP status kodini yuboradi.
        self.send_header("Content-Type", "application/json; charset=utf-8")  # Javob turini bildiradi.
        self.send_header("Access-Control-Allow-Origin", "*")  # Web preview serveridan kelgan so'rovga ruxsat beradi.
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")  # Ruxsat berilgan HTTP usullarini bildiradi.
        self.send_header("Access-Control-Allow-Headers", "Content-Type")  # Content-Type headeriga ruxsat beradi.
        self.end_headers()  # Headerlar tugaganini bildiradi.
        self.wfile.write(response)  # JSON javobini yuboradi.

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] in ("/", "/health"):
            self._send_json(200, {"status": "ok", "service": "Dehqon AI"})
            return
        self._send_json(404, {"error": "Endpoint topilmadi."})

    def do_OPTIONS(self) -> None:  # Brauzer yuboradigan CORS preflight so'rovini qabul qiladi.
        self._send_json(204, {})  # Bo'sh muvaffaqiyatli javob qaytaradi.

    def do_POST(self) -> None:  # Rasm inference POST so'rovini qabul qiladi.
        path = self.path.split("?", 1)[0]  # Query parametrlarini endpoint nomidan ajratadi.
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length)
        except Exception:
            raw_body = b""

        if path == "/predict":
            try:
                image_bytes = raw_body
                plant_hint = self.headers.get("X-Plant-Type") or None
                self._send_json(200, predict_image(image_bytes, plant_hint))
            except Exception as error:
                self._send_json(400, {"error": f"Rasm tahlil qilinmadi: {error}"})
            return

        self._send_json(404, {"error": "Endpoint topilmadi."})

    def log_message(self, format: str, *args: object) -> None:  # Har bir so'rov uchun ixcham server logini chiqaradi.
        print(format % args)  # Standart HTTP logini terminalga chiqaradi.


def main() -> None:  # Inference serverini ishga tushiradi.
    port = int(os.getenv("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), ModelRequestHandler)
    print(f"Dehqon AI model server 0.0.0.0:{port} da ishga tushdi")
    server.serve_forever()  # Serverni yangi so'rovlar uchun ochiq saqlaydi.


if __name__ == "__main__":  # Modul to'g'ridan-to'g'ri ishga tushirilganini tekshiradi.
    main()  # Serverni ishga tushiradi.