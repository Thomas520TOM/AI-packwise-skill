# STM32 Embedded Build Sub-Skill

Build firmware for STM32 microcontrollers using STM32CubeIDE, Keil MDK, or PlatformIO.

**Current versions**: STM32CubeIDE 1.17 / STM32CubeMX 6.13 / ARM GCC 13.x (2025-2026)

## When to Use

- Industrial control systems
- IoT sensor nodes and gateways
- Motor control applications
- Medical devices
- Automotive ECU (non-safety-critical)
- Consumer electronics firmware

## STM32 Family Overview

| Family | Core | Speed | Flash | Best For |
|--------|------|-------|-------|----------|
| STM32F0 | Cortex-M0 | 48MHz | 16-256KB | Cost-sensitive, basic control |
| STM32F1 | Cortex-M3 | 72MHz | 16-1024KB | General purpose (legacy, very popular) |
| STM32F4 | Cortex-M4F | 168-200MHz | 512KB-2MB | DSP, audio, mid-range processing |
| STM32G0 | Cortex-M0+ | 64MHz | 16-512KB | Low power, cost-sensitive |
| STM32G4 | Cortex-M4F | 170MHz | 128-512KB | Analog-rich, motor control |
| STM32H7 | Cortex-M7+M4 | 480MHz | 1-2MB | High-performance, display, audio |
| STM32L0 | Cortex-M0+ | 32MHz | 16-192KB | Ultra-low power |
| STM32L4 | Cortex-M4F | 80MHz | 256KB-1MB | Low power + performance |
| STM32U5 | Cortex-M33 | 160MHz | 256KB-2MB | Ultra-low power + security |
| STM32WB | Cortex-M4+M0+ | 64MHz | 256KB-1MB | Bluetooth LE + application |
| STM32WL | Cortex-M4+M0+ | 48MHz | 64-256KB | LoRa/LoRaWAN + application |
| STM32MP1/2 | Cortex-A7/M4 | 650-1200MHz | External | Linux + real-time coprocessor |

## Prerequisites

```bash
# STM32CubeIDE (all-in-one: editor + compiler + debugger)
# Download from st.com/stm32cubeide

# OR: ARM GCC toolchain + STM32CubeMX + VS Code
# ARM GCC:
sudo apt install gcc-arm-none-eabi    # Linux
brew install --cask gcc-arm-embedded  # macOS

# STM32CubeMX (pin/peripheral configuration)
# Download from st.com/stm32cubemx

# OR: PlatformIO (cross-platform build system)
pip install platformio
```

## STM32CubeIDE Build

### Project Setup

```
STM32CubeIDE:
1. File → New → STM32 Project
2. Select MCU/Board (e.g., STM32F407VG)
3. Configure pins in .ioc file (CubeMX integrated)
4. Generate code
5. Write application code in Core/Src/main.c
6. Build: Project → Build All (Ctrl+B)
7. Debug: Run → Debug (ST-Link/J-Link)
```

### Build Output

```
Debug/ or Release/
├── myproject.elf        ← Debug binary (with symbols)
├── myproject.hex        ← Intel HEX (for programmer)
├── myproject.bin        ← Raw binary (for bootloader/OTA)
└── myproject.map        ← Memory map (linker output)
```

### Command Line Build

```bash
# Build with ARM GCC
arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16 \
  -O2 -g -Wall \
  -DSTM32F407xx \
  -IInc -IDrivers/STM32F4xx_HAL_Driver/Inc \
  -ICore/Inc \
  Src/main.c Src/stm32f4xx_it.c \
  -TSTM32F407VGTX_FLASH.ld \
  -o build/myproject.elf \
  -lc -lm -lnosys

# Generate .bin from .elf
arm-none-eabi-objcopy -O binary build/myproject.elf build/myproject.bin

# Generate .hex from .elf
arm-none-eabi-objcopy -O ihex build/myproject.elf build/myproject.hex

# Flash with ST-Link
st-flash write build/myproject.bin 0x08000000

# Flash with J-Link
JLinkExe -device STM32F407VG -if SWD -speed 4000 -CommandFile flash.jlink
```

### Flash Size Report

```bash
arm-none-eabi-size build/myproject.elf
# Output:
#    text    data     bss     dec     hex filename
#   32768    1024    4096   37888    9400 build/myproject.elf
# text = code + const data (Flash)
# data = initialized variables (Flash + RAM)
# bss  = zero-initialized variables (RAM only)
```

## PlatformIO Build

```ini
; platformio.ini
[env:stm32f407vg]
platform = ststm32
board = disco_f407vg
framework = stm32cube    ; or: arduino, cmsis, zephyr
build_flags = -O2 -DSTM32F407xx
upload_protocol = stlink
debug_tool = stlink
monitor_speed = 115200
```

```bash
pio run                    # Build
pio run -t upload          # Flash
pio run -t debug           # Debug (GDB + OpenOCD/ST-Link)
pio device monitor         # Serial monitor
```

## RTOS Options for STM32

| RTOS | License | RAM (min) | Best For |
|------|---------|-----------|----------|
| FreeRTOS | MIT | ~5KB | Most popular, AWS-supported |
| Zephyr | Apache 2.0 | ~30KB | Full-featured, Linux-like ecosystem |
| RT-Thread | Apache 2.0 | ~3KB | Chinese ecosystem, IoT-focused |
| Azure RTOS (ThreadX) | MIT | ~2KB | Microsoft, very small footprint |
| CMSIS-RTOS2 | Apache 2.0 | N/A | ARM standard API (wraps FreeRTOS/ThreadX) |
| bare-metal | N/A | 0 | Simple applications, no OS |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Flash size overflow | Use `-Os` (optimize for size); enable LTO; remove unused HAL modules |
| RAM overflow | Reduce stack/heap size in linker script; use `.data` and `.bss` sections properly |
| HardFault crash | Check stack overflow (increase stack size); verify interrupt priorities |
| Clock misconfiguration | Use CubeMX to configure RCC; verify HSE/HSI oscillator source |
| Debug connection fails | Check ST-Link firmware; verify SWD pins not reconfigured as GPIO |
| Peripheral not working | Enable peripheral clock in RCC; check pin AF mapping in CubeMX |
| Power consumption too high | Use low-power modes (STOP/STANDBY); disable unused peripherals |
| Bootloader jump fails | Set MSP and PC correctly; disable interrupts before jump |
| OTA update fails | Verify flash write alignment (usually 256-byte or 1KB pages) |
| Floating point not working | Use `-mfloat-abi=hard -mfpu=fpv4-sp-d16`; enable FPU in CPACR register |
