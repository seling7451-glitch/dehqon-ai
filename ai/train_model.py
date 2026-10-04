"""Train a MobileNetV3 plant-disease classifier and export a TFLite model.

Ikki bosqichda o'qitadi:
  1-bosqich: MobileNetV3Small backbone muzlatilgan holda, faqat ustki
             classifier qatlami o'qitiladi (tez, barqaror boshlanish).
  2-bosqich: backbonening oxirgi qatlamlari "ochiladi" (fine-tuning) va
             juda past learning rate bilan butun model birga o'qitiladi.
             Bu bosqich haqiqiy dala/telefon rasmlarida aniqlikni sezilarli
             oshiradi, chunki backbone endi ImageNet emas, aynan barg
             kasalliklari uchun moslashadi.
"""

from __future__ import annotations

import tensorflow as tf

from ai.config import (
    BATCH_SIZE,
    CLASS_NAMES_PATH,
    DATASET_DIR,
    EPOCHS,
    IMAGE_SIZE,
    KERAS_MODEL_PATH,
    SEED,
    TFLITE_MODEL_PATH,
    VALIDATION_SPLIT,
)
from ai.prepare_data import find_classes

# Fine-tuning bosqichida backbonening oxiridan nechta qatlam ochilishi.
FINE_TUNE_LAYERS = 40
# Fine-tuning bosqichida ishlatiladigan (asosiy bosqichdan ancha past) learning rate.
FINE_TUNE_LR = 1e-5
# Fine-tuning bosqichi necha epoch davom etishi.
FINE_TUNE_EPOCHS = max(4, EPOCHS // 2)


def build_datasets() -> tuple[tf.data.Dataset, tf.data.Dataset, list[str]]:
    """Load images with the same class order used by the mobile model."""
    classes = find_classes()
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        class_names=classes,
        validation_split=VALIDATION_SPLIT,
        subset="training",
        seed=SEED,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
    )
    validation_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        class_names=classes,
        validation_split=VALIDATION_SPLIT,
        subset="validation",
        seed=SEED,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
    )
    autotune = tf.data.AUTOTUNE
    return train_ds.prefetch(autotune), validation_ds.prefetch(autotune), classes


def build_model(class_count: int) -> tuple[tf.keras.Model, tf.keras.Model]:
    """Create a transfer-learning classifier based on MobileNetV3Small.

    Returns (model, base) so the caller can unfreeze `base` later for fine-tuning.
    """
    base = tf.keras.applications.MobileNetV3Small(
        input_shape=(*IMAGE_SIZE, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )
    base.trainable = False
    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3))
    augmented = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.08),
        tf.keras.layers.RandomZoom(0.12),
        tf.keras.layers.RandomContrast(0.15),
        tf.keras.layers.RandomBrightness(0.1),
    ], name="field_photo_augmentation")(inputs)
    x = tf.keras.applications.mobilenet_v3.preprocess_input(augmented)
    x = base(x, training=False)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(class_count, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model, base


def _callbacks() -> list[tf.keras.callbacks.Callback]:
    return [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-7),
    ]


def main() -> None:
    train_ds, validation_ds, classes = build_datasets()
    model, base = build_model(len(classes))

    print(f"\n=== 1-bosqich: {EPOCHS} epoch, backbone muzlatilgan ===")
    model.fit(train_ds, validation_data=validation_ds, epochs=EPOCHS, callbacks=_callbacks())

    print(f"\n=== 2-bosqich (fine-tuning): oxirgi {FINE_TUNE_LAYERS} qatlam ochiladi, {FINE_TUNE_EPOCHS} epoch ===")
    base.trainable = True
    for layer in base.layers[:-FINE_TUNE_LAYERS]:
        layer.trainable = False
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=FINE_TUNE_LR),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(train_ds, validation_data=validation_ds, epochs=FINE_TUNE_EPOCHS, callbacks=_callbacks())

    val_loss, val_accuracy = model.evaluate(validation_ds, verbose=0)
    print(f"\nYakuniy tekshiruv aniqligi: {val_accuracy * 100:.1f}% (loss: {val_loss:.3f})")

    model.save(KERAS_MODEL_PATH)
    CLASS_NAMES_PATH.write_text("\n".join(classes) + "\n", encoding="utf-8")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    TFLITE_MODEL_PATH.write_bytes(converter.convert())
    print(f"Keras model: {KERAS_MODEL_PATH}")
    print(f"TFLite model: {TFLITE_MODEL_PATH}")


if __name__ == "__main__":
    main()
