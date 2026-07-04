# Python ML Model Packaging Sub-Skill

Package, optimize, and serve machine learning models for production.

**Current version**: Python 3.12+ / PyTorch 2.x / TensorFlow 2.17+ / ONNX Runtime 1.19+ (2025-2026)

## When to Use

- Trained ML model deployed as API service
- Image recognition / NLP / recommendation system
- Data analysis pipeline
- Research model publication and reproducibility
- Edge ML deployment (mobile/embedded)

## Deployment Options

### FastAPI + Uvicorn (Recommended for APIs)

```python
from fastapi import FastAPI
from transformers import pipeline
import torch

app = FastAPI()

# Load model once at startup
device = "cuda" if torch.cuda.is_available() else "cpu"
classifier = pipeline("text-classification", model="my-model", device=device)

@app.post("/predict")
async def predict(text: str):
    return classifier(text)

@app.get("/health")
async def health():
    return {"status": "ok", "device": device}
```

### Flask + Gunicorn

```python
from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)
model = pickle.load(open("model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    result = model.predict([data["features"]])
    return jsonify({"prediction": result.tolist()})
```

### ONNX Runtime (High-Performance Inference)

```python
import onnxruntime as ort
import numpy as np

# CPU inference
session = ort.InferenceSession("model.onnx", providers=["CPUExecutionProvider"])

# GPU inference (CUDA)
session = ort.InferenceSession("model.onnx", providers=["CUDAExecutionProvider"])

# TensorRT (fastest, NVIDIA GPU only)
session = ort.InferenceSession("model.onnx", providers=["TensorrtExecutionProvider", "CUDAExecutionProvider"])

result = session.run(None, {"input": input_data.astype(np.float32)})
```

### Model Export

```python
# PyTorch → ONNX
import torch
model = torch.load("model.pt")
model.eval()
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, dummy_input, "model.onnx", opset_version=17)

# TensorFlow → SavedModel
model.save("saved_model/")

# TensorFlow → TFLite (mobile)
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model/")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()
with open("model.tflite", "wb") as f:
    f.write(tflite_model)
```

## Model Formats

| Format | Framework | Size | Inference Speed | Best For |
|--------|----------|------|----------------|----------|
| PyTorch (.pt) | PyTorch | Large | Standard | Research, training |
| ONNX (.onnx) | Cross-framework | Medium | Fast | Production APIs |
| SavedModel | TensorFlow | Large | Standard | TF Serving |
| TFLite (.tflite) | TensorFlow Lite | Small | Fast (mobile) | Mobile/edge |
| TensorRT | NVIDIA | Medium | Fastest (GPU) | NVIDIA GPU servers |
| GGUF | llama.cpp | Small | Fast (CPU) | Local LLM inference |
| CoreML (.mlmodel) | Apple | Medium | Fast (Apple) | iOS/macOS on-device |
| OpenVINO | Intel | Medium | Fast (Intel CPU) | Intel hardware |

## Docker (GPU)

```dockerfile
FROM nvidia/cuda:12.4-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# CPU-only (smaller)
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
```

## Model Optimization

| Technique | Description | Typical Savings |
|-----------|-------------|----------------|
| Quantization (INT8) | Reduce precision from FP32 to INT8 | 4x smaller, 2-3x faster |
| Quantization (INT4) | Further reduction | 8x smaller (LLMs) |
| Pruning | Remove redundant weights | 2-10x smaller |
| Knowledge Distillation | Train smaller model from larger | Custom |
| ONNX Optimization | Graph optimization | 10-30% faster |
| TensorRT | NVIDIA GPU optimization | 2-5x faster |

```python
# ONNX quantization
from onnxruntime.quantization import quantize_dynamic, QuantType
quantize_dynamic("model.onnx", "model_quant.onnx", weight_type=QuantType.QUInt8)
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Model too large for deployment | Quantize (INT8/INT4); use ONNX; prune |
| GPU out of memory | Reduce batch size; use gradient checkpointing; quantize |
| Dependency conflicts | Use Docker isolation; pin exact versions |
| Slow inference | Convert to ONNX or TensorRT; use GPU; batch requests |
| CUDA version mismatch | Match PyTorch CUDA version with system CUDA; use Docker |
| Model loading time too long | Load once at startup; use model server (TorchServe, TF Serving) |
| Inconsistent results between environments | Fix random seeds; pin all dependency versions |
| ONNX export fails | Check opset version; use `torch.onnx.export` with `opset_version=17` |
