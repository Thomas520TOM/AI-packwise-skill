# Local LLM Application Build Sub-Skill

Package and deploy local large language model applications (offline AI, private deployment, edge inference).

**Current versions**: Ollama 0.4+ / llama.cpp b4000+ / vLLM 0.6+ (2025-2026)

## When to Use

- Offline AI assistant (no internet required)
- Privacy-sensitive AI applications (enterprise internal)
- Edge AI deployment (Jetson, Raspberry Pi, local servers)
- Cost optimization (avoid API fees)
- Custom fine-tuned model serving

## Tech Stack Comparison

| Framework | Language | GPU Support | Best For | Setup Complexity |
|-----------|---------|-------------|---------|-----------------|
| Ollama | Go | CUDA/Metal/ROCm | Simplest local LLM runtime | Lowest |
| llama.cpp | C++ | CUDA/Metal/Vulkan/ROCm | CPU inference, maximum control | Medium |
| vLLM | Python | CUDA only | High-throughput GPU serving | Medium |
| LM Studio | Desktop app | CUDA/Metal | GUI-based model management | Lowest |
| text-generation-inference | Rust/Python | CUDA | Production GPU serving (Hugging Face) | High |
| LocalAI | Go | CUDA/Metal | OpenAI-compatible local API | Low |

---

## Ollama (Recommended for Getting Started)

### Install & Run

```bash
# Install
curl -fsSL https://ollama.ai/install.sh | sh          # Linux
brew install ollama                                     # macOS
# Windows: download from ollama.ai

# Run model
ollama run llama3.1                    # 8B (default)
ollama run llama3.1:70b                # 70B (needs ~40GB VRAM)
ollama run codellama                   # Code-specific model
ollama run mistral                     # Mistral 7B
ollama run phi3                        # Microsoft Phi-3

# API call (OpenAI-compatible)
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "llama3.1",
  "messages": [{"role": "user", "content": "Hello!"}]
}'

# List installed models
ollama list

# Pull model without running
ollama pull llama3.1:70b
```

### Docker Deployment

```yaml
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    ports: ["11434:11434"]
    volumes: ["ollama:/root/.ollama"]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
  open-webui:
    image: ghcr.io/open-webui/open-webui
    ports: ["3000:8080"]
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
    depends_on: [ollama]
volumes:
  ollama:
```

---

## llama.cpp (Maximum Control)

### Build & Run

```bash
# Clone and build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make -j$(nproc)                          # CPU only
make -j$(nproc) CUDA=1                   # NVIDIA GPU
make -j$(nproc) METAL=1                  # Apple Silicon

# Run
./llama-server -m models/llama-3.1-8b-q4_k_m.gguf \
  --host 0.0.0.0 --port 8080 \
  -ngl 99 \                             # Offload all layers to GPU
  -c 4096                               # Context size

# Quantize model
./llama-quantize input.gguf output-q4_k_m.gguf Q4_K_M
```

### GGUF Quantization Levels

| Quant | Size (8B) | Quality | Speed | Use Case |
|-------|----------|---------|-------|----------|
| Q2_K | ~3 GB | Low | Fastest | Maximum compression |
| Q4_K_M | ~5 GB | Good | Fast | **Recommended default** |
| Q5_K_M | ~6 GB | Better | Good | Quality-sensitive |
| Q6_K | ~7 GB | Great | Slower | Near-lossless |
| Q8_0 | ~8 GB | Excellent | Slower | Minimal quality loss |
| F16 | ~16 GB | Lossless | Slowest | Research/evaluation |

---

## vLLM (High-Throughput GPU Serving)

```bash
pip install vllm

# Serve model (OpenAI-compatible API)
vllm serve meta-llama/Meta-Llama-3.1-8B-Instruct \
  --host 0.0.0.0 --port 8000 \
  --tensor-parallel-size 1 \            # Number of GPUs
  --max-model-len 4096 \
  --quantization awq                   # AWQ quantization (optional)
```

```python
# Use as Python library
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Meta-Llama-3.1-8B-Instruct")
params = SamplingParams(temperature=0.7, max_tokens=512)
outputs = llm.generate(["Hello, how are you?"], params)
print(outputs[0].outputs[0].text)
```

---

## Memory Requirements (Approximate)

| Model | Q4_K_M (Recommended) | FP16 (Full) | Min GPU VRAM |
|-------|---------------------|-------------|-------------|
| 1B | ~1 GB | ~2 GB | 2 GB |
| 3B | ~2 GB | ~6 GB | 4 GB |
| 7B/8B | ~5 GB | ~14 GB | 8 GB |
| 13B | ~8 GB | ~26 GB | 16 GB |
| 34B | ~20 GB | ~68 GB | 40 GB |
| 70B | ~40 GB | ~140 GB | 2×40 GB |

---

## Hardware Recommendations

| Use Case | Minimum | Recommended |
|----------|---------|------------|
| Chat (7B) | 16GB RAM (CPU) | 8GB VRAM GPU |
| Chat (13B+) | 32GB RAM or 16GB VRAM | 24GB VRAM (RTX 4090) |
| Code (7B) | 16GB RAM | 12GB VRAM |
| Production serving | 24GB VRAM | A100 40GB / H100 |
| Edge (Raspberry Pi) | 8GB RAM (very slow) | Jetson Orin 16GB |
| Apple Silicon Mac | 16GB unified | 32GB+ unified (M2/M3 Pro/Max) |

---

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Slow model download | Use Hugging Face mirror (`HF_ENDPOINT`); use `ollama pull` for Ollama |
| GPU not detected | Check `nvidia-smi`; install NVIDIA Container Toolkit for Docker |
| Out of memory | Use smaller quantization (Q4_K_M); reduce context length; use CPU offload |
| Slow response | Use GPU; reduce model size; use `--flash-attention` |
| CORS errors when calling API | Ollama: set `OLLAMA_ORIGINS=*`; llama.cpp: add `--cors *` |
| Model hallucination | Use system prompt; lower temperature; use RAG for factual accuracy |
| Docker GPU not working | Install `nvidia-container-toolkit`; restart Docker daemon |
| Apple Silicon not using GPU | Use Metal-enabled build; Ollama uses Metal by default on macOS |
