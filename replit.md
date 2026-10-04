# Dehqon AI

O‘zbekiston fermerlari uchun o‘zbek tilidagi o‘simlik tahlili va kundalik xo‘jalik yordamchisi.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dehqon-ai/` — Expo mobil ilova va preview.
- `artifacts/dehqon-ai/app/(tabs)/` — bosh sahifa, rasm tahlili, ob-havo va qo‘llanmalar.
- `artifacts/dehqon-ai/app/history.tsx`, `irrigation.tsx`, `subsidy.tsx` — qo‘shimcha funksional ekranlar.
- `artifacts/dehqon-ai/context/AppContext.tsx` — qurilmada saqlanadigan tahlil tarixi.
- `ai/` — TensorFlow dataset tayyorlash, MobileNetV3 o‘qitish va modelni tekshirish skriptlari.
- `README.md` — ishga tushirish va model tayyorlash bo‘yicha qo‘llanma.

## Architecture decisions

- Birinchi mobil versiya frontend-first qurilgan: tahlil tarixi AsyncStorage’da saqlanadi va backendga bog‘liq emas.
- Hozirgi preview tahlil natijasini demo sifatida ochiq ko‘rsatadi; haqiqiy TFLite model `ai/models/` tayyor bo‘lgach ulanadi.
- Mobil UI Expo Go bilan mos bo‘lishi uchun faqat Expo-compatible paketlardan foydalanadi.

## Product

Foydalanuvchi kamera yoki galereyadan o‘simlik rasmini yuboradi, tahlil natijasini oladi va uni tarixda saqlaydi. Ilovada Navoiy uchun ob-havo ko‘rinishi, o‘simlikka mos sug‘orish hisoblagichi va subsidiya qo‘llanmasi ham mavjud.

## User preferences

- Ilova o‘zbek tilida, yangi boshlovchi fermer tushunadigan sodda tilda bo‘lishi kerak.
- Birinchi bosqichda ishlaydigan mobil preview va aniq demo holatlari ustuvor.

## Gotchas

- Expo workflow’ni `artifacts/dehqon-ai: expo` nomi bilan ishga tushiring.
- TensorFlow modelini o‘qitishdan oldin dataset sinf papkalari ichida rasm borligini `python -m ai.prepare_data` bilan tekshiring.
- `ai/train_model.py` bajarilgandan keyin TFLite faylni mobil interpreterga ulash kerak; previewdagi demo natijani production AI deb ko‘rsatmaslik kerak.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
