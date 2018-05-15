'use strict';

const EventEmitter = require('events');
const lpt = require('lpt');
const notifer = require('./notifer');

const pinsMap = {
    0: 1,
    1: 2,
    2: 4,
    3: 8,
    4: 16,
    5: 32,
    6: 64,
    7: 128 
};

class LPTDevice extends EventEmitter {
    constructor(port) {
        super();
        this.port = port;
        this.status = {};
        this.subscribe();
        // this.sendMode(0);
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

    sendOn(pin, isDedicated = false) {
        this.sendMode(1, isDedicated ? pinsMap[pin] : pin);
    }

    sendOff(pin) {
        this.sendMode(0, pin);
    }

    sendMode(mode, pin = false) {
        let status;

        if(pin !== false) {
            let isModeSet = this.port.data === (this.port.data | pinsMap[pin]);
            let statusIncrease = this.port.data + pinsMap[pin];
            let statusDecrease = this.port.data - pinsMap[pin];
        
            if (mode && !isModeSet && statusIncrease <= 7) {
                status = statusIncrease;
            }
        
            if (!mode && !isModeSet && statusDecrease >= 0) {
                status = statusDecrease;
            }
        } else {
            status = mode;
        }

        this.port.data = status;
    }
}

const port = new lpt.Port(0, 'byte', false);

const device = new LPTDevice(port);

console.log(device);

device.on('ack.open', () => {
    // console.log('Door is Opened!');
    // port.data = leds[1];
    device.sendOn(0, true);
    // sendEmail();
});

device.on('ack.close', () => {
    // console.log('Door is Closed');
    device.sendOn(1, true);
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
