"""Evaluate a trained Dehqon AI model on one image."""

from __future__ import annotations

import argparse
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image
import tensorflow as tf

from ai.config import CLASS_NAMES_PATH, IMAGE_SIZE, KERAS_MODEL_PATH


@lru_cache(maxsize=1)
def load_model() -> tf.keras.Model:
    """Load the trained model once and reuse it across predictions."""
    if not KERAS_MODEL_PATH.exists():
        raise FileNotFoundError(f"Model topilmadi: {KERAS_MODEL_PATH}")
    return tf.keras.models.load_model(KERAS_MODEL_PATH)


def predict(image_path: Path) -> tuple[str, float]:
    """Return the most likely class and its confidence percentage."""
    if not image_path.exists():
        raise FileNotFoundError(f"Rasm topilmadi: {image_path}")
    classes = CLASS_NAMES_PATH.read_text(encoding="utf-8").splitlines()
    image = Image.open(image_path).convert("RGB").resize(IMAGE_SIZE)
    pixels = np.asarray(image, dtype=np.float32)[None, ...]
    probabilities = load_model().predict(pixels, verbose=0)[0]
    index = int(np.argmax(probabilities))
    return classes[index], float(probabilities[index] * 100)


def main() -> None:
    parser = argparse.ArgumentParser(description="Bitta o‘simlik rasmini tekshirish")
    parser.add_argument("image", type=Path, help="Tekshiriladigan rasm yo‘li")
    args = parser.parse_args()
    disease, confidence = predict(args.image)
    print(f"Natija: {disease}")
    print(f"Ishonch: {confidence:.1f}%")


if __name__ == "__main__":
    main()
