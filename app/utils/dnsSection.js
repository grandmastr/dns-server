const SIZES = require('../constants');

/**
 * This file contains the functions that are used to create the DNS sections,
 * including header, question, answer, authority, and additional information/
 * @param {Object} options - the options that are used to create the DNS section
 * @returns {Buffer} - the buffer that contains the DNS section
 * */
function createDnsSection(options) {
    let bugger;

    switch (options.section) {
        case 'header':
            buffer = Buffer.alloc(SIZES['HEADER']);

            createDnsHeader(options, buffer);
            return buffer;
    }
}

function createDnsHeader(options, buffer) {
    buffer.writeUInt16BE(options.id, 0) // transaction ID being the first bit

    // setting the flags
    let flags = 0;

    const {qr, opcode, aa, tc, rd, ra, z, rcode, qdcount, ancount, nscount, arcount} = options;

    flags |= qr << 15;
    flags |= opcode << 11;
    flags |= aa << 10;
    flags |= tc << 9;
    flags |= rd << 8;
    flags |= ra << 7;
    flags |= z << 4;
    flags |= rcode;

    buffer.writeUInt16BE(flags, 2);

    buffer.writeUInt16BE(qdcount, 4);
    buffer.writeUInt16BE(ancount, 6);
    buffer.writeUInt16BE(nscount, 8);
    buffer.writeUInt16BE(arcount, 10);

    return buffer;
}


class DnsSection {
    constructor(buffer) {
        if (buffer) {
            this.id = buffer.readUInt16BE(0);

            const flags = buffer.readUInt16BE(2);

            this.qr = (flags >> 15) & 0x1;
            this.opcode = (flags >> 11) & 0xf;
            this.aa = (flags >> 10) & 0x1;
            this.tc = (flags >> 9) & 0x1;
            this.rd = (flags >> 8) & 0x1;
            this.ra = (flags >> 7) & 0x1;
            this.z = (flags >> 4) & 0x7;
            this.rcode = flags & 0xf;
            this.qdcount = buffer.readUInt16BE(4);
            this.ancount = buffer.readUInt16BE(6);
            this.nscount = buffer.readUInt16BE(8);
            this.arcount = buffer.readUInt16BE(10);
        }
    }

    toBuffer() {
        const buffer = Buffer.alloc(SIZES['HEADER']);
        buffer.writeUInt16BE(this.id, 0);

        let flags = 0;

        flags |= this.qr << 15;
        flags |= this.opcode << 11;
        flags |= this.aa << 10;
        flags |= this.tc << 9;
        flags |= this.rd << 8;
        flags |= this.ra << 7;
        flags |= this.z << 4;
        flags |= this.rcode;

        buffer.writeUInt16BE(flags, 2);

        buffer.writeUInt16BE(this.qdcount, 4);
        buffer.writeUInt16BE(this.ancount, 6);
        buffer.writeUInt16BE(this.nscount, 8);
        buffer.writeUInt16BE(this.arcount, 10);

        return buffer;
    }
}

module.exports = {
    createDnsSection,
    // DnsHeader: DnsSection,
};
