const dgram = require("dgram");

const {DOMAIN_NAME} = require("./constants");
const {parseDnsHeader, createDnsSection} = require("./utils/dnsSections")
const {parseFlags, resolveCall, getEncodedDomainsFromBufferRequest, getQuestionByEncodedDomainBuffers, getAnswerBuffer} = require("./utils/decodeDomainName");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");


udpSocket.on("message", (buf, rinfo) => {
    try {
        const flags = buf.readUint16BE(2);
        const parsedFlags = parseFlags(flags);
        const params = {
            id: buf.readUint16BE(0),
            ...parsedFlags,
            qdcount: buf.readUint16BE(4),
            ancount: buf.readUint16BE(4), // sending same count as qdcount
            nscount: 0,
            arcount: 0,
            // override
            qr: 1,
            aa: 0,
            tc: 0,
            ra: 0,
            z: 0,
            rcode: parsedFlags.opcode === 0 ? 0 : 4,
        }

        const headerBuffer = resolveCall(params);
        console.log(params.qdcount, params.ancount, '<<<<<<<<< qd an counts');

        const encodedDomainBuffers = getEncodedDomainsFromBufferRequest(buf, params.qdcount);

        const questionBuffers = getQuestionByEncodedDomainBuffers(encodedDomainBuffers, encodedDomainBuffers.length);
        // answer
        const answerBuffers = getAnswerBuffer(encodedDomainBuffers, questionBuffers.length);
        console.log("TCL: answerBuffer", answerBuffers)

        const response = Buffer.concat([headerBuffer, ...questionBuffers, ...answerBuffers]);
        console.log("response: ", response)
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
