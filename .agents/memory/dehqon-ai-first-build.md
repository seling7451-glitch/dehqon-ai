---
name: Dehqon AI first build
description: Product direction and model-readiness decisions for the farmer assistant.
---

The first product slice prioritizes a usable Uzbek-language mobile experience over backend complexity: local history, camera/gallery input, weather, irrigation, and subsidy guidance work offline in the preview.

**Why:** A farmer should be able to understand and try the complete flow before a trained disease classifier and live weather service are available.

**How to apply:** Keep demo AI results explicitly labeled until the TensorFlow Lite model is validated; add remote services only after the local mobile flow remains functional offline.