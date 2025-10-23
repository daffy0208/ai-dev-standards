# IoT Developer Skill

Expert in IoT development, microcontrollers, sensors, and MQTT protocols.

## Quick Start

```bash
# Activate skill
claude-code --skill iot-developer
```

## What This Skill Does

- 🌡️ Integrates sensors (temperature, humidity, motion)
- 💡 Controls smart devices (lights, thermostats, relays)
- 📊 Builds IoT dashboards
- 📡 Implements MQTT communication
- 🏠 Creates smart home systems
- 🏭 Develops industrial IoT solutions

## Common Tasks

### Connect Sensor
```
"Read temperature from a DHT22 sensor and publish to MQTT"
```

### Build Dashboard
```
"Create a real-time dashboard showing sensor data from multiple IoT devices"
```

### Control Devices
```
"Implement light control via MQTT with on/off toggle"
```

### Smart Home
```
"Build a smart home dashboard with temperature, lights, and thermostat control"
```

## Technologies

- **MQTT** - Messaging protocol
- **Arduino/ESP32** - Microcontrollers
- **Raspberry Pi** - Edge computing
- **Sensors** - DHT22, BME280, PIR, etc.
- **WebSockets** - Real-time data

## Example Output

```typescript
// Real-time sensor dashboard
mqtt.subscribe('home/temperature', (temp) => {
  setTemperature(temp)
})
```

## Related Skills

- `data-visualizer` - Sensor data charts
- `real-time-systems` - Live data streams
- `embedded-systems` - Low-level programming

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive IoT patterns.
