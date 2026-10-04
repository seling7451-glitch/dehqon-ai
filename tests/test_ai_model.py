from pathlib import Path

import pytest

from ai.test_model import load_model, predict


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_IMAGE = (
    ROOT / "data" / "plantvillage" / "color" / "Apple___Apple_scab"
    / "00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335.JPG"
)


def test_load_model_returns_model_instance():
    model = load_model()
    assert model is not None


def test_predict_returns_expected_label_for_real_image():
    if not SAMPLE_IMAGE.is_file():
        pytest.skip("PlantVillage sample image is not included in this workspace")

    label, confidence = predict(SAMPLE_IMAGE)
    assert label == "Apple___Apple_scab"
    assert 0.0 <= confidence <= 100.0
    assert confidence > 50.0
