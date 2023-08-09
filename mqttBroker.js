const AedesMemoryPersistence = require("aedes-persistence");
const aedes = require("aedes")({ persistence: AedesMemoryPersistence() });
const { createServer } = require("aedes-server-factory");

const { MQTT } = require("./server/configs/Constants");
const MqttController = require("./server/controllers/Mqtt.controller");

const dotenv = require("dotenv");
dotenv.config({ path: "./configs.env" });

// const mqttServer = createServer(aedes, {ws: true, tcp: {allowHalfOpen: true, pauseOnConnect: true}});
const mqttServer = createServer(aedes);

//broker methods
aedes.on("publish", async (packet, client) => {
    let req = {};
    try {
        if (!client) return;
        let result;
        req.payload = packet.payload?.toString();
        switch (packet.topic) {
            case MQTT.ON_PUBLISH_TOPIC.postAttendance:
                result = await MqttController.saveUserAttendance(client, req);
                // console.log(result);
                result
                    ? result.error
                        ? MqttController.publishError(
                            client,
                            "Office time is over,Login Falied",
                            MQTT.CLIENT_PUBLISH_TOPICS.publishUser
                        )
                        : MqttController.publishUser(
                            client,
                            `${result.name},${result.status}`
                        )
                    : MqttController.publishError(
                        client,
                        "User not found,",
                        MQTT.CLIENT_PUBLISH_TOPICS.publishUser
                    );
                break;
            default:
                console.log("publish-default", client.id, packet, req);
        }
        console.log("publish-result", result);
    } catch (error) {
    // console.error(error, { topic: packet.topic, error: error.message, req });
        MqttController.publishError(client, {
            topic: packet.topic,
            error: error.message,
            req,
        });
    }
});

/*aedes.on("client", (client) => {
  console.info(`Client="${client.id}" connecting...`);
});*/

aedes.on("clientReady", async (client) => {
    console.info(`Client="${client.id}" connected`);

    setInterval(() => {
        MqttController.publishTime(client);
    }, 15000);
});

aedes.authenticate = (client, username, password, callback) => {
    // console.log('client Authentication request..', client.id)
    const error = new Error("Failed to authenticate. Invalid credentials.");
    error.returnCode = 4;
    if (
        username === process.env.MQTT_BROKER_USERNAME &&
        password.toString() === process.env.MQTT_BROKER_PASSWORD
    ) {
        callback(null, true);
        console.info("client Authenticated.", client.id);
    } else callback(error, null);
};

aedes.on("clientDisconnect", async (client) => {
    console.info(`Client="${client.id}" disconnected`);
});

aedes.on("subscribe", (subscriptions, client) => {
    console.info(
        `client="${client ? client.id : "unknown"
        }" subscribe the topics="${subscriptions.map((s) => s.topic).join("\n")}"`
    );
});

aedes.on("unsubscribe", (subscriptions, client) => {
    console.log(
        `client="${client ? client.id : "unknown"
        }" unsubscribe the topics="${subscriptions.join("\n")}"`
    );
});
/*
aedes.on("keepaliveTimeout", (client) => {
  console.info(`keepaliveTimeout: client="${client ? client.id : 'unknown'}":`);
});

aedes.on("ack", (packet, client) => {
  console.info(`acknowledgement Sent: client="${client ? client.id : 'unknown'}":`, packet?.payload?.toString(), packet);
});*/

exports.mqttBroker = aedes;
exports.mqttServer = mqttServer;
