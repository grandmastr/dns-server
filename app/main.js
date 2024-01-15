const dgram = require("dgram");
const {createDnsSection} = require("./utils/dnsSection");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (buf, rinfo) => {
    try {
        console.log(`Received ${buf.length} bytes from ${rinfo.address}:${rinfo.port}`);
        const dnsHeaderBuffer = createDnsSection({
            section: 'HEADER',
            id: buf.readUInt16BE(0),
            qr: 1,
            opcode: 0,
            aa: 0,
            tc: 0,
            rd: 1,
            ra: 1,
            z: 0,
            rcode: 0,
            qdcount: buf.readUInt16BE(4),
            ancount: 0,
            nscount: 0,
            arcount: 0
        })

        console.log(dnsHeaderBuffer, 'dns header buffer');

        const response = Buffer.concat([dnsHeaderBuffer]);
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
    console.log(`Server listening ${address.address}:${address.port}`);
});
