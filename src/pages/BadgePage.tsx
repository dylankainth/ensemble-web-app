// File: SendUrl.js
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const MQTT_BROKER_URL = "ws://srv1.ensemble.rodeo:9001"; // or wss:// for secure
const MQTT_TOPIC = "esp32/nfc";

export default function BadgePage() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [mac, setMac] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
      reconnectPeriod: 5000, // auto-reconnect every 5s
    });

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT error:", err);
      mqttClient.end();
      setConnected(false);
    });

    mqttClient.on("close", () => {
      console.log("MQTT disconnected");
      setConnected(false);
    });

    setClient(mqttClient);

    // Cleanup on unmount
    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const handleSend = () => {
    if (!client || !connected) {
      alert("MQTT not connected yet");
      return;
    }
    if (!mac || !url) {
      alert("Please enter both MAC and URL");
      return;
    }

    const message = `${mac}-${url}`;
    client.publish(MQTT_TOPIC, message, { qos: 1, retain: false });
    alert(`Sent to MQTT: ${message}`);
    setUrl("");
  };



    return (
        <Card className="max-w-md mx-auto mt-12 shadow-lg">
            <CardHeader>
                <CardTitle>Send URL to ESP32</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <Label htmlFor="mac">ESP32 MAC Address</Label>
                    <Input
                        id="mac"
                        type="text"
                        value={mac}
                        onChange={(e) => setMac(e.target.value)}
                        placeholder="AA:BB:CC:DD:EE:FF"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="url">URL</Label>
                    <Input
                        id="url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
                <Button
                    onClick={handleSend}
                    disabled={!connected || !mac || !url}
                    className="w-full"
                >
                    Send URL
                </Button>
                {!connected && (
                    <p className="text-sm text-destructive text-center">
                        Connecting to MQTT broker...
                    </p>
                )}
            </CardContent>
        </Card>
    );

}
