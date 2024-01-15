const dgram = require("dgram");
const {createDnsSection} = require("./utils/dnsSection");

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

const dnsQuery = Buffer.from([
    0x00, 0x00, // [0-1] Transaction ID
    0x01, 0x00, // [2-3] Flags
    0x00, 0x01, // [4-5] Questions
    0x00, 0x00, // [6-7] Answer RRs
    0x00, 0x00, // [8-9] Authority RRs
    0x00, 0x00, // [10-11] Additional RRs
    // Question
    0x03, 0x77, 0x77, 0x77, // "www"
    0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, // "example"
    0x03, 0x63, 0x6f, 0x6d, // "com"
    0x00, // Null terminator of the domain name
    0x00, 0x01, // Type A query (Host Address)
    0x00, 0x01  // Class IN (Internet)
]);

// udpSocket.send(dnsQuery, 2053, "127.0.0.1", (error) => {
//     if (error) {
//         console.error('Error:', error)
//         client.close();
//     } else {
//         console.log('DNS query sent', dnsQuery);
//     }
// })

udpSocket.on("message", (buf, rinfo) => {
    try {
        console.log(`Received ${buf.length} bytes from ${rinfo.address}:${rinfo.port}`);
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
    console.log(`Server listening ${address.address}:${address.port}`)
});
