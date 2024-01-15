/**
 * Say you have a url like google.com, this function encodes the domain name
 * into a DNS server compatible format
 * @param domain {string} - URL
 * @returns Buffer {Buffer} = encoded URL as a Buffer
 * */

function encodeDomainName(domain) {
    // split url into labels
    const labels = domain.split('.') // e.g google and com
    const buffer = Buffer.alloc(domain.length + 2); // +2 for thr null byte and extra length byte
    let offset = 0;

    labels.forEach(label => {
        buffer.writeUInt8(label.length, offset++);
        buffer.write(label, offset);
        offset += label.length;
    });

    buffer.writeUInt8(0, offset); // terminate the domain name with a null byte

    return buffer;
}

module.exports = encodeDomainName
