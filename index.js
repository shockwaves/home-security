'use strict';

const EventEmitter = require('events');
const lpt = require('lpt');
const notifer = require('./notifer');

class LPTDevice extends EventEmitter {
    constructor(port) {
        super();
        this.port = port;
        this.status = {};
        this.subscribe();
    }

    updateStatus() {
        Object.keys(port.status).forEach(key => {
            if (this.port.status[key] !== this.status[key]) {
                this.emit(`${key}.${this.port.status[key] ? 'open' : 'close'}`);
            }
        });

        this.emit('status.update');
        this.status = Object.assign({}, this.port.status);
    }

    subscribe() {
        setInterval(() => {
            if (JSON.stringify(this.port.status) !== JSON.stringify(this.status)) {
                this.updateStatus();
            }
        });
    }

    getPinDigit(pin) {
        return Math.pow(2, pin);
    }

    sendOn(pin, only = false) {
        only ? this.port.data = this.getPinDigit(pin) : this.sendMode(1, pin);
    }

    sendOff(pin) {
        this.sendMode(0, pin);
    }

    sendMode(mode, pin) {
        let status;
        let pinDigit = this.getPinDigit(pin);
        let isModeSet = this.port.data === (this.port.data | pinDigit);
        let statusIncrease = this.port.data + pinDigit;
        let statusDecrease = this.port.data - pinDigit;

        if (mode && !isModeSet && statusIncrease <= 128) {
            status = statusIncrease;
        }

        if (!mode && !isModeSet && statusDecrease >= 0) {
            status = statusDecrease;
        }

        this.port.data = status;
    }
}

const port = new lpt.Port(0, 'byte', false);
const device = new LPTDevice(port);
console.log(device);

device.on('ack.open', () => {
    console.log('Door is Opened!');
    device.sendOn(0, true);
});

device.on('ack.close', () => {
    console.log('Door is Closed');
    device.sendOn(1, true);
});

device.once('ack.open', () => {
    console.log('Door is Opened once!');
    device.sendOn(0, true);
    // notifer.sendEmail();
});

device.once('ack.close', () => {
    console.log('Door is Closed once');
    device.sendOn(1, true);
});
