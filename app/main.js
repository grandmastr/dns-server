const dgram = require("dgram");

const {dnsHeaderBuffer, dnsQuestionBuffer, dnsAnswerBuffer} = require("./constants");
const {parseDnsHeader, createDnsSection} = require("./utils/dnsSections");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");


udpSocket.on("message", (buf, rinfo) => {
    try {
        const parsedHeaderOptions = parseDnsHeader(buf);

        let _headerOptions = {
            ...parsedHeaderOptions,
            id: parsedHeaderOptions.id,
            qr: 1,
            opcode: parsedHeaderOptions.opcode,
            rd: parsedHeaderOptions.rd,
            rcode: parsedHeaderOptions.opcode === 0 ? 0 : 4,
        }

        console.log(_headerOptions);
        const dnsHeaderBuffer = createDnsSection({
            section: 'header',
            ..._headerOptions
        });

        const response = Buffer.concat([dnsHeaderBuffer, dnsQuestionBuffer, dnsAnswerBuffer]);

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
