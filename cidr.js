/*
 * cidr.js
 *
 * Example usage:
 * const addr_range = new CIDR("192.168.0.0/24"); // 192.168.0.0 - 192.168.0.255
 * if (addr_range.match(ip_str))
 *       // Do stuff if IP is in valid range
 * else
 *       // Do stuff if IP is not in valid range
 */

function CIDR(str) {
        this.mask = 0;
        this.bits = 0;

        if (str)
                this.parse(str);
}

Object.defineProperty(CIDR.prototype, "bitmask", {
        get: function() {
                return (0xFFFFFFFF - (0xFFFFFFFF>>>this.bits));
        },
        enumerable: true
});

// Unsigned 32-bit representation of IP-address
CIDR.prototype.extractIP = function(str) {
        if (typeof str !== "string")
                throw new TypeError("Argument 1 of CIDR.prototype.extractIP is not a String.");

        let out = 0;
        let j = 0;
        let tmp = 0;

        for (let i = 0, l = Math.min(16, str.length); j < 4 && i < l; i++) {
                const cc = str[i].charCodeAt(0);

                if (cc === 46 || (cc === 47 && j === 3) || i + 1 === l) { /* "." or "/" */
                        const n = +str.substr(tmp, i - tmp + ((i + 1 === l)&1));

                        if (n > 0xFF)
                                throw new RangeError(`Octet ${j + 1} exceeds the maximum value of 255.`);                        

                        out += n<<(8*(3 - j));
                        tmp = i + 1;
                        j++;
                } else if (cc < 47 || cc > 58) { /* 0-9 */
                        throw new Error(`'${str[i]}' is not a valid character at position ${i}.`);
                }
        }

        if (j < 3)
                throw new Error(`Argument 1 of CIDR.prototype.parse is malformed. Expected 4 octets, got ${j}.`);

        // out += +str.substr(tmp + j);

        return out;
};

CIDR.prototype.parse = function(str) {
        const mask = CIDR.prototype.extractIP(str);
        const sidx = str.indexOf("/");

        if (sidx === -1)
                throw new Error("No host identifier separator '/' found.");
        else if (str.length === sidx)
                throw new Error("No content after host identifier separator.");

        const subnet = +str.substr(sidx + 1);

        if (isNaN(subnet) || subnet > (subnet|0))
                throw new Error(`Host identifier is not an integer.`);
        else if (subnet > 0x20 || subnet < 0)
                throw new RangeError(`Host identifier is not within valid range of 0-32.`);

        // Do NOT change the order of these
        this.bits = subnet|0;
        this.mask = mask&this.bitmask;
};

CIDR.prototype.match = function(ipstr) {
        const a = CIDR.prototype.extractIP(ipstr);

        return ((a&this.bitmask)^this.mask) === 0;
};