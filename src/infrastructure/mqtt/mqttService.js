
import mqtt from 'mqtt';

class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    connect() {
        // Connect to the MQTT broker
        // Assuming localhost:1883 for backend (TCP)
        // If running in docker, this might need to be the service name, 
        // but since we are running node locally, localhost should work if ports are mapped.
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

        console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

        this.client = mqtt.connect(brokerUrl, {
            clientId: `qatu_backend_${Date.now()}`,
            clean: true,
            reconnectPeriod: 5000,
        });

        this.client.on('connect', () => {
            console.log('Backend MQTT connected successfully');
            this.isConnected = true;
        });

        this.client.on('error', (error) => {
            console.error('Backend MQTT connection error:', error);
            this.isConnected = false;
        });

        this.client.on('close', () => {
            console.log('Backend MQTT connection closed');
            this.isConnected = false;
        });
    }

    publish(topic, message) {
        if (!this.client || !this.isConnected) {
            console.warn('MQTT not connected, cannot publish message');
            return;
        }

        try {
            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            this.client.publish(topic, payload, { qos: 0 }, (err) => {
                if (err) {
                    console.error(`Failed to publish to ${topic}:`, err);
                } else {
                    console.log(`Published to ${topic}`);
                }
            });
        } catch (error) {
            console.error('Error publishing MQTT message:', error);
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
        }
    }
}

const mqttService = new MQTTService();
// Auto-connect when imported/started
mqttService.connect();

export { mqttService };
