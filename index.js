'use strict';

const EventEmitter = require('events');
const nodemailer = require('nodemailer');
const lpt = require('lpt');
const config = require('./config');

class LPTDevice extends EventEmitter {
    constructor(port) {
        super();
        this.port = port;
        this.data = this.port.data = 0;
        this.status = {};
        this.subscribe();
    }

    updateStatus() {
        Object.keys(port.status).forEach(key => {
            if (this.port.status[key] !== this.status[key]) {
                this.emit(`${key}.${this.port.status[key] ? 'open' : 'close'}`);
            }
        });

        this.status = Object.assign({}, this.port.status);
    }

    subscribe() {
        setInterval(() => {
            if (JSON.stringify(this.port.status) !== JSON.stringify(this.status)) {
                this.updateStatus();
            }
        });
    }
}

const port = new lpt.Port(0, 'byte', false);
port.data = 0;

const device = new LPTDevice(port);

console.log(device);

device.on('ack.open', () => {
    // console.log('Door is Opened!');
    // port.data = leds[1];
    // sendEmail();
});

device.on('ack.close', () => {
    // console.log('Door is Closed');
    // port.data = leds[2];
});

device.once('ack.open', () => {
    console.log('Door is Opened!');
    port.data = leds[1];
    // sendEmail();
});

device.once('ack.close', () => {
    console.log('Door is Closed');
    port.data = leds[2];
});

const leds = {
    1: 1,
    2: 2,
    3: 4
};

function setLedMode(led, mode) {
    let isModeSet = device.port.data === (device.port.data | leds[led]);
    let statusIncrease = device.port.data + leds[led];
    let statusDecrease = device.port.data - leds[led];

    if (mode && !isModeSet && statusIncrease <= 7) {
        device.data = statusIncrease;
    }

    if (!mode && !isModeSet && statusDecrease >= 0) {
        device.data = statusDecrease;
    }

    device.port.data = device.data;
}

function sendEmail() {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: config.email.auth
    });

    var mailOptions = {
        from: config.email.auth.user,
        to: config.email.to,
        subject: 'Door Open!',
        text: 'Door Open!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
