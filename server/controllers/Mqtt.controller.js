const { MQTT } = require("../configs/Constants");
const Models = require("../models");
const moment = require('moment')
let { Op, where, fn, col } = require("sequelize");

/*-----------------------------------------mqtt control functions-----------------------*/

exports.saveUserAttendance = async function (client, req) {
    console.log('saveUserAttendance', req);
    const user = req.payload;

    let checkUser = await Models.User.findOne({
        where: {
            rfidNumber: user,
        },
        attributes: ["id", "name", "email"],

    })

    if (!checkUser) return

    checkUser = JSON.parse(JSON.stringify(checkUser))

    let date = moment(new Date()).format("YYYY-MM-DD");
    let hours = new Date().getHours();

    let count = await Models.Attendance.count({
        where: {
            userId: checkUser.id,
            [Op.and]: [where(fn("date", col("day")), "=", date)],
        },
    });

    if (count % 2 === 0 && hours >= 18) { checkUser['error'] = true; return checkUser }   
    // return next(new AppError("Invalid, You can not punch In after 6 PM", 404));

    await Models.Attendance.create({ userId: checkUser.id });

    count = await Models.Attendance.count({
        where: {
            userId: checkUser.id,
            [Op.and]: [where(fn("date", col("day")), "=", date)],
        },
    });
    let message = count % 2 === 1 ? 'Punched In' : 'Punched Out'
    checkUser['status'] = message
    return checkUser;
};

/*----------------------------mqtt publish---------*/
exports.publish = function (client, data) {
    let packet = {
        qos: 1,
        retain: true,
        topic: data.topic,
        payload: data.payload,
    }
    client && client.publish(packet, (error) => {
        error && console.log(`${data.topic}-error->`, error)
    });
   // console.info(`Publishing topic : ${data.topic} to client-> ${client?.id}`, data.payload);
}

exports.publishError = function publishError(client, error, topic) {
    exports.publish(client, { topic: topic ? topic : MQTT.CLIENT_PUBLISH_TOPICS.publishError, payload: error });
}

exports.publishTime = function publishTime(client) {
    exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishTime, payload: getDateTime() });
}

exports.publishUser = function publishUser(client, name) {
    exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishUser, payload: name });
}

exports.publishAttendanceStatus = function publishAttendanceStatus(client, message) {
    exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishAttendanceStatus, payload: message });
}

// exports.publishDeviceSensorConfiguration = function (client, data) {
//     exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishDeviceSensorConfiguration, payload: data });
// }
// exports.publishDeviceStandardConfiguration = function publishDeviceStandardConfiguration(client, data) {
//     exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishDeviceStandardConfiguration, payload: data });
// }
// exports.publishDeviceDateTimeConfiguration = function publishDeviceDateTimeConfiguration(client, data) {
//     exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishDeviceDateTimeConfiguration, payload: data });
// }
// exports.publishDeviceInfoConfiguration = function publishDeviceInfoConfiguration(client, data) {
//     exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishDeviceDeviceInfoConfiguration, payload: data });
// }

// exports.publishOTA = function publishOTA(client, data) {
//     exports.publish(client, { topic: MQTT.CLIENT_PUBLISH_TOPICS.publishFirmwareUpdate, payload: data });
// }

const getDateTime = () => {
    let date = new Date().getMinutes();
    date = `0${date}`.slice(-2);
    return `${new Date().toDateString()},${new Date().getHours()}:${date}`;
};
