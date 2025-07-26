import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let client = null;
const subscriptions = new Map();
const topicCallbacks = new Map();
let onConnectQueue = [];

export function connectWebSocket(onConnectedCallback) {
    if (client && client.connected) {
        onConnectedCallback?.();
        return;
    }

    if (onConnectedCallback) {
        onConnectQueue.push(onConnectedCallback);
    }

    if (client && client.active) {
        return;
    }

    client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('WebSocket connected');

            onConnectQueue.forEach(cb => cb?.());
            onConnectQueue = [];

            topicCallbacks.forEach((callback, topic) => {
                if (!subscriptions.has(topic)) {
                    console.log(`WebSocket Resubscribing topic: ${topic}`);
                    const sub = client.subscribe(topic, message =>
                        callback(JSON.parse(message.body))
                    );
                    subscriptions.set(topic, sub);
                }
            });
        },
        onStompError: (frame) => {
            console.error('STOMP error:', frame.headers['message'], frame.body);
        }
    });

    client.activate();
}

export function subscribe(topic, callback) {
    topicCallbacks.set(topic, callback);

    const doSubscribe = () => {
        if (subscriptions.has(topic)) {
            subscriptions.get(topic).unsubscribe();
            subscriptions.delete(topic);
        }

        console.log(`Subscribing to topic: ${topic}`);
        const sub = client.subscribe(topic, message =>
            callback(JSON.parse(message.body))
        );
        subscriptions.set(topic, sub);
    };

    if (!client) {
        console.warn('WebSocket not initialized connecting');
        connectWebSocket(() => {
            doSubscribe();
        });
        return;
    }

    if (client.connected) {
        doSubscribe();
    } else {
        connectWebSocket(() => {
            doSubscribe();
        });
    }
}

export function unsubscribe(topic) {
    if (subscriptions.has(topic)) {
        subscriptions.get(topic).unsubscribe();
        subscriptions.delete(topic);
        topicCallbacks.delete(topic);
        console.log(`Unsubscribed topic: ${topic}`);
    }
}

export function sendMessage(destination, message) {
    if (client && client.connected) {
        client.publish({
            destination,
            body: JSON.stringify(message)
        });
    } else {
        console.warn('Not connected Message not sent');
    }
}

export function disconnectWebSocket() {
    subscriptions.forEach(sub => sub.unsubscribe());
    subscriptions.clear();
    topicCallbacks.clear();
    onConnectQueue = [];

    if (client) {
        client.deactivate();
        client = null;
        console.log('WebSocket disconnected');
    }
}
