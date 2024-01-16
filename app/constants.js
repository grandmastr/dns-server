
module.exports = {
    HEADER: 12,
    DOMAIN_NAME: 'codecrafters.io',
    recordTypes: {
        A: 1, // a host address
        NS: 2, // name server
        MD: 3, // mail destination
        MF: 4, // mail forwarder
        CNAME: 5, // canonical name
        SOA: 6, // start of authority
        MB: 7, // a mailbox domain name
        MG: 8, // a mail group member
        MR: 9, // a rename
        NULL: 10, // a null RR
        WKS: 11, // well known service
        PTR: 12, // domain name pointer
        HINFO: 13, // host information
        MINFO: 14, // mail list information
        MX: 15, // mail exchange
        TXT: 16, // text strings
    },
    classFields: {
        IN: 1, // INTERNET [RFC1035]
        CS: 2, // CSNET [Dewdney 87]
        CH: 3, // CHAOS [Moon 87]
        HS: 4, // Hesiod [Dyer 87]
    }
}
