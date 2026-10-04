# Dehqon AI

O‘zbekiston fermerlari uchun o‘zbek tilidagi aqlli yordamchi. Ilova o‘simlik kasalliklarini internetdagi AI server orqali tahlil qiladi, ob-havo, sug‘orish jadvali, subsidiya ma’lumotlari va tahlil tarixini birlashtiradi.

## Ishga tushirish

1. Android uchun `pnpm --filter @workspace/dehqon-ai android` buyrug‘i bilan native development build yarating va ishga tushiring.
2. `Tahlil` bo‘limidan kamera yoki galereyani tanlang.
3. Rasm internetdagi AI serverga yuboriladi; natija qurilmadagi tarixga yoziladi.

Rasm tahlili uchun internet va ishlayotgan backend talab qilinadi. AI chat ushbu app variantida mavjud emas.

## Telefon uchun internet AI backend

Telefon kompyuter o‘chiq bo‘lganda ham rasm tahlil qilishi uchun backend doimiy HTTPS hostingda ishlashi kerak. `render.yaml` Render Blueprint konfiguratsiyasidir. Render’da repository’ni ulang va Blueprint’ni yarating. Ushbu rasm-tahlil versiyasiga Gemini kaliti kerak emas. `standard` instance TensorFlow/Keras uchun tanlangan va pullik hosting rejasidir. Bepul serverlar uxlab qolishi yoki xotira yetishmasligi sabab tahlil ishlamasligi mumkin.

Render serverga `https://<xizmat-nomi>.onrender.com` manzilini bergach, Expo/EAS project’ning `preview` environment’iga `EXPO_PUBLIC_MODEL_API_URL` nomi bilan shu HTTPS URL’ni qo‘shing. Bu qiymat maxfiy emas; Gemini kalitini EAS’ga yoki mobil ilovaga qo‘ymang. So‘ng yangi APK yarating:

```bash
cd artifacts/dehqon-ai
eas build --platform android --profile preview
```

Yangi APK rasmni cloud modelga yuboradi va internet talab qiladi. Backend tayyorligini `https://<xizmat-nomi>.onrender.com/health` orqali tekshirish mumkin; javobda `status: ok` chiqishi kerak.

## Haqiqiy AI modelini tayyorlash

Dataset quyidagi shaklda bo‘lishi kerak:

```text
data/plantvillage/color/
├── Tomato___Early_blight/
│   ├── image-001.jpg
│   └── image-002.jpg
└── Tomato___healthy/
    └── image-003.jpg
```

```bash
python -m ai.prepare_data
python -m ai.train_model
python -m ai.test_model path/to/plant.jpg
```

O‘qitish jarayoni backend ishlatadigan `ai/models/plant_disease.keras` va `ai/models/class_names.txt` fayllarini yaratadi. Hostingga deploy qilganda bu fayllar repository’da bo‘lishi kerak. Mobil ilova TFLite modelini yuklamaydi; rasmni internet orqali serverdagi `/predict` endpointiga yuboradi.