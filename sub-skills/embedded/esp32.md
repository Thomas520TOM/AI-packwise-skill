# ESP32 Embedded Build Sub-Skill

Build firmware for ESP32 series using ESP-IDF or Arduino framework.

**Current versions**: ESP-IDF v5.3+ / Arduino-ESP32 3.x (2025-2026)

## When to Use

- WiFi/Bluetooth IoT devices
- Smart home sensors and controllers
- Wearable devices
- Industrial IoT gateways
- Audio streaming devices (ESP32-S3)
- Low-power battery devices (ESP32-C6, ESP32-H2)

## ESP32 Family Overview

| Chip | Core | WiFi | BT | Flash | Best For |
|------|------|------|-----|-------|----------|
| ESP32 | Xtensa dual-core 240MHz | WiFi 4 | BT 4.2 + BLE | 4-16MB | General IoT, most mature |
| ESP32-S2 | Xtensa single-core 240MHz | WiFi 4 | No BT | 4-16MB | Low-cost WiFi, USB OTG |
| ESP32-S3 | Xtensa dual-core 240MHz | WiFi 4 | BLE 5.0 | 8-16MB | AI acceleration, USB, camera |
| ESP32-C3 | RISC-V single-core 160MHz | WiFi 4 | BLE 5.0 | 4MB | Low-cost, pin-compatible with ESP8266 |
| ESP32-C6 | RISC-V single-core 160MHz | WiFi 6 | BLE 5.0 + 802.15.4 | 4MB | Thread/Zigbee/Matter, WiFi 6 |
| ESP32-H2 | RISC-V single-core 96MHz | No WiFi | BLE 5.0 + 802.15.4 | 4MB | Thread/Zigbee/Matter, ultra-low power |

## ESP-IDF Build (Recommended for Production)

### Prerequisites

```bash
# Install ESP-IDF
# Linux/macOS:
mkdir -p ~/esp && cd ~/esp
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf && ./install.sh esp32  # or esp32s3, esp32c3, esp32c6, etc.
source export.sh

# Windows:
# Download ESP-IDF Tools Installer from docs.espressif.com

# Verify
idf.py --version
```

### Build

```bash
# Set target chip
idf.py set-target esp32       # or esp32s3, esp32c3, esp32c6, etc.

# Configure (menuconfig)
idf.py menuconfig

# Build
idf.py build
# Output: build/myproject.bin, build/myproject.elf

# Flash (USB connected)
idf.py -p /dev/ttyUSB0 flash    # Linux
idf.py -p COM3 flash             # Windows

# Monitor serial output
idf.py -p /dev/ttyUSB0 monitor

# Flash + monitor in one step
idf.py -p /dev/ttyUSB0 flash monitor
```

### Project Structure

```
myproject/
├── CMakeLists.txt              ← Top-level CMake
├── main/
│   ├── CMakeLists.txt          ← Main component CMake
│   ├── main.c                  ← Entry point (app_main)
│   └── wifi.c                  ← WiFi management
├── components/                 ← Custom components
│   └── mylib/
│       ├── CMakeLists.txt
│       ├── mylib.c
│       └── include/mylib.h
├── sdkconfig                   ← Build configuration
├── partitions.csv              ← Flash partition table
└── managed_components/         ← ESP-IDF component registry deps
```

### Flash Partition Table

```csv
# partitions.csv — custom partition layout
# Name,    Type, SubType, Offset,  Size,    Flags
nvs,       data, nvs,     0x9000,  0x6000,
phy_init,  data, phy,     0xf000,  0x1000,
factory,   app,  factory, 0x10000, 0x1F0000,
storage,   data, spiffs,  0x200000,0x200000,
```

## Arduino-ESP32 Build (Simpler, Faster Prototyping)

### PlatformIO Configuration

```ini
; platformio.ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino       ; or: espidf
monitor_speed = 115200
upload_speed = 921600
board_build.partitions = huge_app.csv
build_flags =
    -DARDUINO_USB_CDC_ON_BOOT=1
lib_deps =
    bblanchon/ArduinoJson@^7.0.0
    knolleary/PubSubClient@^2.8
```

```bash
pio run                    # Build
pio run -t upload          # Flash
pio device monitor         # Serial monitor
```

### Arduino Code Example

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "MyWiFi";
const char* password = "MyPassword";
const char* mqtt_server = "192.168.1.100";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { delay(500); }
    client.setServer(mqtt_server, 1883);
}

void loop() {
    if (!client.connected()) {
        client.connect("esp32-client");
    }
    client.publish("sensor/temperature", "23.5");
    delay(5000);
}
```

## Over-the-Air (OTA) Updates

```cpp
// Arduino OTA
#include <ArduinoOTA.h>

void setup() {
    ArduinoOTA.setHostname("my-esp32");
    ArduinoOTA.setPassword("admin");
    ArduinoOTA.begin();
}

void loop() {
    ArduinoOTA.handle();
}
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| WiFi disconnects frequently | Use WiFi event handlers; implement reconnection logic |
| Flash size mismatch | Set correct flash size in menuconfig; check actual chip |
| PSRAM not detected | Enable PSRAM in menuconfig; check board has PSRAM chip |
| BLE connection fails | Check BLE MTU size; ensure correct service/characteristic UUIDs |
| Deep sleep current too high | Disable WiFi/BT before sleep; use RTC GPIO for wake |
| Partition table error | Verify partition sizes fit flash; use `idf.py partition-table` to check |
| Build: "sdkconfig mismatch" | Run `idf.py fullclean` then `idf.py build` |
| Upload fails on Windows | Install CP2102/CH340 USB driver; check COM port |
| Stack overflow crash | Increase task stack size (default 4KB may be too small) |
