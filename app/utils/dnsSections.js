const SIZES = require('../constants');
const encodeDomainName = require('./domainName/encode');
const {decodeDomainName} = require('./domainName/decode');

/**
 * This file contains the functions that are used to create the DNS sections,
 * including header, question, answer, authority, and additional information/
 * @param {Object} options - the options that are used to create the DNS section
 * @returns Buffer {Buffer} - the buffer that contains the DNS section
 * */
function createDnsSection(options) {
    let buffer;

    switch (options.section) {
        case 'header':
            buffer = Buffer.alloc(SIZES['HEADER']);

            createDnsHeader(options, buffer);
            return buffer;

        case 'question':
            return createDnsQuestion(options);

        case 'answer':
            return createDnsAnswer(options);
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

function createDnsQuestion(options) {
    const domainBuffer = encodeDomainName(options.domain_name);

    const questionBuffer = Buffer.alloc(domainBuffer.length + 4);
    domainBuffer.copy(questionBuffer);

    questionBuffer.writeUInt16BE(options.type, domainBuffer.length); // Type
    questionBuffer.writeUInt16BE(options.class, domainBuffer.length + 2); // Class

    return questionBuffer;
}

function createDnsAnswer(options) {
    const domainBuffer = encodeDomainName(options.domain_name);

    const answerBuffer = Buffer.alloc(domainBuffer.length + 14); // this is as a result of +2 for type,+2 for class, +4 for TTL, +2 for data length, and +4 for the IP address
    domainBuffer.copy(answerBuffer);

    console.log('answerBuffer', answerBuffer);
    let offset = domainBuffer.length;
    console.log('answerBuffer', answerBuffer, 2);
    answerBuffer.writeUInt16BE(options.type, offset);
    answerBuffer.writeUInt16BE(options.class, offset + 2);
    answerBuffer.writeUInt16BE(options.ttl, offset + 2);
    answerBuffer.writeUInt16BE(options.length, offset + 4);
    answerBuffer.writeUInt16BE(options.data, offset + 2);

    return answerBuffer;
}

function parseDnsHeader(buffer) {
    const headerBuffer = buffer.subarray(0, 12);

    const id = headerBuffer.readUInt16BE(0);

    const flags = headerBuffer.readUInt16BE(2);

    const qr = (flags >> 15) & 0b1;
    const opcode = (flags >> 11) & 0b1111;
    const aa = (flags >> 10) & 0b1;
    const tc = (flags >> 9) & 0b1;
    const rd = (flags >> 8) & 0b1;
    const ra = (flags >> 7) & 0b1;
    const z = (flags >> 4) & 0b111;
    const rcode = flags & 0b1111;

    const qdcount = headerBuffer.readUInt16BE(4);
    const ancount = headerBuffer.readUInt16BE(6);
    const nscount = headerBuffer.readUInt16BE(8);
    const arcount = headerBuffer.readUInt16BE(10);

    return {
        id,
        qr,
        opcode,
        aa,
        tc,
        rd,
        ra,
        z,
        rcode,
        qdcount,
        ancount,
        nscount,
        arcount
    }
}

// function parseDnsQuestions(buffer) {
//     console.log('parseDnsQuestions');
//     const offset = 12;
//     const domainName = decodeDomainName(buffer, offset);
//     const type = buffer.readUInt16BE(offset + domainName.length + 2);
//     const _class = buffer.readUInt16BE(offset + domainName.length + 4);
//
//     return {
//         domainName, type, class: _class
//     }
// }

module.exports = {
    createDnsSection,
    parseDnsHeader,
    // parseDnsQuestions,
};
