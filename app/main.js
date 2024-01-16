const dgram = require("dgram");

const {DOMAIN_NAME} = require("./constants");
const {parseDnsHeader, createDnsSection, parseDnsQuestions} = require("./utils/dnsSections")
const {parseFlags, resolveCall, getEncodedDomainsFromBufferRequest, getQuestionByEncodedDomainBuffers, getAnswerBuffer} = require("./utils/decodeDomainName");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");


udpSocket.on("message", (buf, rinfo) => {
    try {
        const parsedHeaderOptions = parseDnsHeader(buf);

        const flags = buf.readUInt16BE(2);
        const parsedFlags = parseFlags(flags);

        const options = {
            id: buf.readUint16BE(0),
            ...parsedFlags,
            qdcount: buf.readUint16BE(4),
            ancount: buf.readUint16BE(4), // sending same count as qdcount
            nscount: 0,
            arcount: 0,
            qr: 1,
            aa: 0,
            tc: 0,
            ra: 0,
            z: 0,
            rcode: parsedFlags.opcode === 0 ? 0 : 4,
        }

        const _headerOptions = {
            ...parsedHeaderOptions,
            id: parsedHeaderOptions.id,
            qr: 1,
            ancount: 1,
            opcode: parsedHeaderOptions.opcode,
            rd: parsedHeaderOptions.rd,
            rcode: parsedHeaderOptions.opcode === 0 ? 0 : 4,
        }
        createDnsSection({
            section: 'header',
            ..._headerOptions
        });
        const headerBuffer = resolveCall(options);

        const encodedDomainBuffers = getEncodedDomainsFromBufferRequest(buf, options.qdcount);
        const questionBuffers = getQuestionByEncodedDomainBuffers(encodedDomainBuffers, encodedDomainBuffers.length);
        const answerBuffers = getAnswerBuffer(encodedDomainBuffers, questionBuffers.length);

        // const response = Buffer.concat([dnsHeaderBuffer, dnsQuestionBuffer, dnsAnswerBuffer]);
        const response = Buffer.concat([headerBuffer, ...questionBuffers, ...answerBuffers]);

        udpSocket.send(response, rinfo.port, rinfo.address);
    } catch (e) {
        console.log(`Error receiving data: ${e}`);
    }
});

udpSocket.on("error", (err) => {
    console.log(`Error: ${err}`);
});

udpSocket.on("listening", () => {
    const address = udpSocket.address();
    console.log(`Server listening ${address.address}:${address.port}`)
});
