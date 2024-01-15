const {createDnsSection} = require("./utils/dnsSections");

const DOMAIN_NAME = 'codecrafters.io';

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
const dnsQuestionBuffer = createDnsSection({
    section: 'question',
    domain_name: DOMAIN_NAME,
    type: 1,
    class: 1,
});

const dnsAnswerBuffer = createDnsSection({
    section: 'answer',
    domain_name: DOMAIN_NAME,
    type: 1,
    class: 1,
    ttl: 60,
    length: 4,
    data: "8.8.8.8"
});

module.exports = {
    HEADER: 12,
    dnsQuestionBuffer,
    dnsAnswerBuffer,
    defaultHeaderParams,
}
