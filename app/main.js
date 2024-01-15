const dgram = require("dgram");
const {createDnsSection} = require("./utils/dnsSections");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (buf, rinfo) => {
    try {
        console.log('--)(--');
        console.log('grandmastr.dev');
        console.log('--)(--');
        const dnsHeaderBuffer = createDnsSection({
            section: 'header',
            id: buf.readUInt16BE(0),
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
        });

        const dnsQuestionBuffer = createDnsSection({
            section: 'question',
            domain_name: 'grandmastr.dev'
        });

        const dnsAnswerBuffer = createDnsSection({
            section: 'answer',
            domain_name: 'grandmastr.dev',
            type: 1,
            class: 1,
            ttl: 60,
            length: 4,
            data: "8.8.8.8"
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
