const {recordTypes, classFields} = require("../constants");

/**
 * Basically this does the reverse of what is being done above, it takes a buffer, and extracts the domain name
 * @param buffer {Buffer}
 * @param start {number}
 * @returns {string}
 * */
function decodeDomainName(buffer, start = 0) {
    let domain = [];
    let offset = start;

    while (buffer[offset] !== 0) {
        const length = buffer[offset++];
        const labels = buffer.slice(offset, offset + length).toString();

        domain.push(labels);
        offset += length;
    }

    return domain.join('.');
}

function getDomainBytes(buffer, offset = 0) {
    let domainBytes = [];
    let currentOffset = offset;

    console.log('biological factors');

    while (true) {
        const labelLength = buffer.readUInt8(currentOffset); // read the label length

        if ((labelLength & 0xC0) === 0xC0) {
            const pointerBytes = getDomainBytesFromPointer(buffer, currentOffset); // check if the label is a pointer
            domainBytes.push(...pointerBytes); // push the pointer bytes into the array
            currentOffset += 2;

            break; // break out of the loop
        }

        if (labelLength === 0) {
            // this means that the domain name has ended
            domainBytes.push(0);
            currentOffset++;

            break;
        }

        domainBytes.push(labelLength); // push the label length into the array

        for (let i = 0; i < labelLength; i++) {
            domainBytes.push(buffer.readUInt8(currentOffset + 1 + i)); // push the label into the array
        }

        currentOffset += labelLength + 1 // increment the current offset by the label length + 1;
    }

    return domainBytes;
}

function getDomainBytesFromPointer(buffer, offset) {
    const domainBytes = [];
    let currentOffset = offset; // the current offset is the offset of the pointer
    console.log('getdomainbytespointer', currentOffset);

    while (true) {
        const labelLength = buffer.readUInt8(currentOffset); // read the label length

        if ((labelLength & 0xC0) === 0xC0) {
            const pointerBytes = getDomainBytesFromPointer(buffer, currentOffset); // check if the label is a pointer
            domainBytes.push(...pointerBytes); // push the pointer bytes into the array
            currentOffset += 2;

            break; // break out of the loop
        }

        if (labelLength === 0) {
            // this means that the domain name has ended
            domainBytes.push(0);
            currentOffset++;

            break;
        }

        domainBytes.push(labelLength); // push the label length into the array

        for (let i = 0; i < labelLength; i++) {
            domainBytes.push(buffer.readUInt8(currentOffset + 1 + i)); // push the label into the array
        }

        currentOffset += labelLength + 1 // increment the current offset by the label length + 1;
    }

    return domainBytes;
}

function getQuestionByEncodedDomainBuffers(encodedDomainBuffers, qdcount = 1) {
    const questionBuffers = [];

    for (let k = 0; k < qdcount; k++) {
        const encodedDomainBuffer = encodedDomainBuffers[k]; // get the encoded domain buffer

        const questionBuffer = Buffer.alloc(encodedDomainBuffer.length + 4); // create a buffer for the question
        encodedDomainBuffers.copy(questionBuffer); // copy the encoded domain buffer into the question buffer
        const typeOffset = encodedDomainBuffer.length;
        const classOffset = typeOffset + 2;

        questionBuffer.writeUInt16BE(1, typeOffset); // write the type into the question buffer
        questionBuffer.writeUInt16BE(1, classOffset); // write the class into the question buffer
    }

    return questionBuffers;
}

function getAnswerBuffer(encodedDomainBuffers, ip, qdcount = 1) {
    const answerBuffers = [];

    for (let k = 0; k < qdcount; k++) {
        const encodedDomainBuffer = encodedDomainBuffers[k]; // get the encoded domain buffer
        const answerBuffer = Buffer.alloc(encodedDomainBuffer.length + 14); // create a buffer for the answer

        encodedDomainBuffer.copy(answerBuffer);
        console.log('getAnswerBuffer offset >>>>');

        let offset = encodedDomainBuffer.length;
        answerBuffer.writeUInt16BE(recordTypes.A, offset); // write the type into the answer buffer
        offset += 2;
        answerBuffer.writeUInt16BE(classFields.IN, offset); // write the class into the answer buffer
        offset += 4;
        answerBuffer.writeUInt32BE(60, offset); // write the ttl into the answer buffer
        offset += 2;
        answerBuffer.writeUInt16BE(4, offset); // write the length into the answer buffer
        offset += 2;
        const rdata = Buffer.from([8, 8, 8, 8]).toString();
        answerBuffer.writeUInt16BE(rdata, offset); // write the rdata into the answer buffer
        answerBuffers.push(answerBuffer);
    }

    return answerBuffers;
}

function resolveCall(options) {
    const buffer = Buffer.alloc(12);

    buffer.writeUInt16BE(options.id, 0); // write the id into the buffer

    const flags = getFlags(options); // get the flags
    buffer.writeUInt16BE(flags, 2); // write the flags into the buffer
    buffer.writeUInt16BE(options.qdcount, 4); // write the qdcount into the buffer
    buffer.writeUInt16BE(options.ancount, 6); // write the ancount into the buffer
    buffer.writeUInt16BE(options.nscount, 8); // write the nscount into the buffer
    buffer.writeUInt16BE(options.arcount, 10); // write the arcount into the buffer

    return buffer;
}

function getFlags(options) {
    return (
        (options.qr << 15) |
        (options.opcode << 11) |
        (options.aa << 10) |
        (options.tc << 9) |
        (options.rd << 8) |
        (options.ra << 7) |
        (options.z << 4) |
        (options.rcode)
    );
}

function parseFlags(flags) {
    return {
        qr: (flags >> 15),
        opcode: (flags >> 11) & 0b1111,
        aa: (flags >> 10) & 1,
        tc: (flags >> 9) & 1,
        rd: (flags >> 8) & 1,
        ra: (flags >> 7) & 1,
        z: (flags >> 4) & 0b111,
        rcode: flags & 0b1111
    };
}

function getEncodedDomainsFromBufferRequest(buffer, qdcount = 1) {
    const domainBufferArray = [];
    let currentOffset = 12; // Assuming the domain name starts after the header (12 bytes)
    for (let i = 0; i < qdcount; i++) {
        const domainBytes = []; // Array to accumulate domain name bytes
        while (true) {
            const labelLength = buffer.readUInt8(currentOffset);
            // check for the pointer reference
            if ((labelLength & 0xc0) === 0xc0) {
                const pointerOffset = buffer.readUint16BE(currentOffset) & 0x3fff; // 0x3ff = 0011 1111 1111 1111
                const pointerBytes = getDomainBytesFromPointer(buffer, pointerOffset);
                domainBytes.push(...pointerBytes);
                // Create a buffer from the accumulated domain name bytes array
                const domainBuffer = Buffer.from(domainBytes);
                domainBufferArray.push(domainBuffer);
                break;
            }
            // Check for the end of the domain name (null byte)
            if (labelLength === 0) {
                domainBytes.push(0); // Push the null terminator
                currentOffset++;
                break;
            }
            domainBytes.push(labelLength); // Push label length
            // Push label characters
            for (let j = 0; j < labelLength; j++) {
                domainBytes.push(buffer.readUInt8(currentOffset + 1 + j));
            }
            // Move to the next label
            currentOffset += labelLength + 1;
        }
        // Create a buffer from the accumulated domain name bytes array
        const domainBuffer = Buffer.from(domainBytes);
        console.log(domainBytes);
        domainBufferArray.push(domainBuffer);
    }
    return domainBufferArray;
}

module.exports = {
    decodeDomainName,
    getDomainBytes,
    parseFlags,
    getFlags,
    resolveCall,
    getAnswerBuffer,
    getEncodedDomainsFromBufferRequest,
    getQuestionByEncodedDomainBuffers,
};
