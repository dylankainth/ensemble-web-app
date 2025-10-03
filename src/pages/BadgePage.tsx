// File: src/pages/BadgePage.tsx
import { useState, useEffect } from "react";
import mqtt from "mqtt";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import type { MqttClient } from "mqtt";

// Fixed list of MAC addresses
const MAC_ADDRESSES = [
    "84:1F:E8:16:AF:08",
   
];

const MQTT_BROKER_URL = "wss://srv1.ensemble.rodeo:9001";
const MQTT_TOPIC = "esp32/nfc";

type MetaPage = {
    id: string;
    content: string;
};

export default function BadgePage() {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connected, setConnected] = useState(false);
    const [mac, setMac] = useState("");
    const [step, setStep] = useState(1);
    
    // Step 1 state
    const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
    const [selectedPageId, setSelectedPageId] = useState("");
    const [arbitraryUrl, setArbitraryUrl] = useState("");
    const [useArbitraryUrl, setUseArbitraryUrl] = useState(false);
    const [finalUrl, setFinalUrl] = useState("");

    useEffect(() => {
        const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            reconnectPeriod: 5000,
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

        return () => {
            if (mqttClient) mqttClient.end();
        };
    }, []);

    // Fetch existing meta pages
    useEffect(() => {
        const fetchMetaPages = async () => {
            const { data, error } = await supabase
                .from('meta')
                .select('id, content')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching meta pages:', error);
            } else {
                setMetaPages(data || []);
            }
        };

        fetchMetaPages();
    }, []);

    const handleStep2Next = async () => {
        let url = "";
        
        if (useArbitraryUrl) {
            url = arbitraryUrl;
        } else if (selectedPageId) {
            url = `https://ensemble.rodeo/meta?id=${selectedPageId}`;
        } else {
            alert("Please select a page or enter an arbitrary URL");
            return;
        }
        
        setFinalUrl(url);
        setStep(3);
    };

    const handleSend = () => {
        if (!client || !connected) {
            alert("MQTT not connected yet");
            return;
        }
        if (!mac || !finalUrl) {
            alert("Please select a MAC and complete step 1");
            return;
        }

        const message = `${mac}-${finalUrl}`;
        client.publish(MQTT_TOPIC, message, { qos: 1, retain: false });
        alert(`Sent to MQTT: ${message}`);
    };

    const handleBackToStep2 = () => {
        setStep(2);
        setMac("");
    };

    // Stage 1: Introduction
    if (step === 1) {
        return (
            <div className="max-w-md mx-auto mt-12 px-4">
                <Card className="shadow-lg">
                    <CardContent className="p-6 text-center">
                        <div className="mb-4 -mx-6 -mt-12 overflow-hidden">
                            <img
                                src="/20251003_131819.jpg"
                                alt="NFC Badge"
                                className="w-full h-32 object-cover rounded-t-lg"
                            />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Program Your Lanyard</h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            Create or select a web page to program onto your lanyard. <br /> <br /> When someone taps your badge with their phone, they'll be taken directly to your page.
                        </p>
                        <Button
                            onClick={() => setStep(2)}
                            className="w-full"
                        >
                            Get Started
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Stage 2: Select or Create Page
    if (step === 2) {
        return (
            <div className="max-w-md mx-auto mt-12 px-4">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Step 1: Select or Create Page</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Option 1: Select existing page */}
                        {metaPages.length > 0 && (
                            <div className="space-y-2">
                                <Label>Select existing page</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {metaPages.map((page) => (
                                        <div
                                            key={page.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                                                selectedPageId === page.id && !useArbitraryUrl
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            } ${useArbitraryUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => {
                                                if (!useArbitraryUrl) {
                                                    setSelectedPageId(page.id);
                                                    setUseArbitraryUrl(false);
                                                }
                                            }}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{page.id}</div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {page.content ? page.content.substring(0, 50) + (page.content.length > 50 ? '...' : '') : 'Empty page'}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/meta?id=${page.id}`;
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                                disabled={useArbitraryUrl}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Option 2: Create new page */}
                        <div className="space-y-2">
                            <Label>Or create new page</Label>
                            <Button
                                onClick={async () => {
                                    // grab the user's id
                                    const {
                                        data: { user },
                                    } = await supabase.auth.getUser();
                                    
                                    if (!user) {
                                        alert('You must be signed in to create a new page.');
                                        return;
                                    }

                                    const { data, error } = await supabase
                                        .from('meta')
                                        .insert([{ content: '', user_id: user.id }])
                                        .select('id')
                                        .single();
                                    
                                    if (error) {
                                        alert('Error creating new page: ' + error.message);
                                        return;
                                    }
                                    
                                    // Refresh the meta pages list
                                    const { data: allPages } = await supabase
                                        .from('meta')
                                        .select('id, content')
                                        .order('id', { ascending: true });
                                    
                                    setMetaPages(allPages || []);
                                    setSelectedPageId(data.id);
                                    setUseArbitraryUrl(false);
                                    alert(`Created page with ID: ${data.id}`);
                                }}
                                disabled={useArbitraryUrl}
                                variant="outline"
                                className="w-full"
                            >
                                Create New Page
                            </Button>
                        </div>

                        {/* Option 3: Arbitrary URL */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="arbitrary"
                                    checked={useArbitraryUrl}
                                    onChange={(e) => {
                                        setUseArbitraryUrl(e.target.checked);
                                        if (e.target.checked) {
                                            setSelectedPageId("");
                                        }
                                    }}
                                />
                                <Label htmlFor="arbitrary">Or use an arbitrary URL instead</Label>
                            </div>
                            {useArbitraryUrl && (
                                <Input
                                    type="text"
                                    value={arbitraryUrl}
                                    onChange={(e) => setArbitraryUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setStep(1)}
                                variant="outline"
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleStep2Next}
                                className="flex-1"
                                disabled={useArbitraryUrl ? !arbitraryUrl : !selectedPageId}
                            >
                                Next: Select Device
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Stage 3: Send to Device
    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Step 2: Send to Device</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <Label>Selected URL</Label>
                        <div className="px-3 py-2 bg-gray-100 rounded text-sm break-all">
                            {finalUrl}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="mac">Select a flasher</Label>
                        <select
                            id="mac"
                            value={mac}
                            onChange={(e) => setMac(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded"
                        >
                            <option value="" disabled>
                                Select MAC address
                            </option>
                            {MAC_ADDRESSES.map((addr) => (
                                <option key={addr} value={addr}>
                                    {addr.split(":").slice(-3).join(":")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            onClick={handleBackToStep2}
                            variant="outline"
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!connected || !mac}
                            className="flex-1"
                        >
                            Send URL
                        </Button>
                    </div>

                    {!connected && (
                        <p className="text-sm text-destructive text-center">
                            Connecting to MQTT broker...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
