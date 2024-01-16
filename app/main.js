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
            id: buf.readUInt16BE(0),
            ...parsedFlags,
            qr: 1,
            opcode: 0,
            aa: 0,
            tc: 0,
            rd: 1,
            ra: 1,
            z: 0,
            rcode: parsedFlags.opcode === 0 ? 0 : 4,
            qdcount: buf.readUInt16BE(4),
            ancount: buf.readUInt16BE(4),
            nscount: 0,
            arcount: 0
        }

        const defaultHeaderParams = {
            id: 1,
            qr: 1,
            opcode: 0,
            aa: 0,
            tc: 0,
            rd: 1,
            ra: 1,
            z: 0,
            rcode: 0,
            qdcount: 1,
            ancount: 1,
            nscount: 0,
            arcount: 0
        }
        // const dnsQuestionBuffer = createDnsSection({
        //     section: 'question',
        //     domain_name: parsedQuestionOptions.domainName,
        //     type: 1,
        //     class: 1,
        // });

        // const dnsAnswerBuffer = createDnsSection({
        //     section: 'answer',
        //     domain_name: parsedQuestionOptions.domainName,
        //     type: 1,
        //     class: 1,
        //     ttl: 60,
        //     length: 4,
        //     data: "8.8.8.8"
        // });

        const _headerOptions = {
            ...parsedHeaderOptions,
            id: parsedHeaderOptions.id,
            qr: 1,
            ancount: 1,
            opcode: parsedHeaderOptions.opcode,
            rd: parsedHeaderOptions.rd,
            rcode: parsedHeaderOptions.opcode === 0 ? 0 : 4,
        }

        const dnsHeaderBuffer = createDnsSection({
            section: 'header',
            ..._headerOptions
        });

        const headerBuffer = resolveCall(options);

        const encodedDomainBuffers = getEncodedDomainsFromBufferRequest(buf, options.qdcount);
        const questionBuffers = getQuestionByEncodedDomainBuffers(encodedDomainBuffers, options.qdcount);
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
