/*
 * Returns the object form of a given ISO-8601 time string.
 *
 * @str    <String>  Time string
 * @tzpart <Boolean> Indicates whether @str is a time zone offset
 */
function ISO8601TimeStringParser(str, tzpart) {
        "use strict";
        
        if (typeof str !== "string")
                throw new TypeError(`Illegal argument type. Expected String, got '${typeof str}'.`);

        if (str.length < 2)
                throw new Error(`Illegal argument length. Expected length of at least 2, but got ${str.length}.`);

        let hour  = -1;
        let min   = -1;
        let sec   = -1;
        let mili  = -1;
        let delim = false;
        let dec_idx = -1;
        let offset = {hour: 0, minutes: 0, seconds: 0, direction: 0};

        /*
          * Comparing character codes instead of characters is ~45% faster in Firefox 66.0.3.
          * "." = 46
          * "," = 44
          * ":" = 58
          * "Z" = 90
          * "-" = 45
          * "+" = 43
          * "0" = 48
          * "9" = 57
          */

        for (let i = 0, cc; i < str.length; i++) {
                cc = str.charCodeAt(i);

                if (!delim && cc === 58)
                        delim = true;

                if (i < 5 && (i + 1) % 3 === 0) {
                        if ((delim && cc !== 58) ||
                            (!delim && cc === 58)) {
                                throw new Error(`Unexpected time-element delimiter at ${i}.`);
                        }
                        
                        if (delim)
                                continue;
                }

                if (cc === 46 || cc === 44) {
                        if (hour === -1 || dec_idx !== -1)
                                throw new Error(`Unexpected decimal separator placement. A decimal separator may only appear after the last time element.`);
                        
                        dec_idx = i + 1;
                        continue;
                }

                /* 
                   * NaN is never equal to or greater than any number
                   * This method is ~15 times faster than isNaN() and
                   * ~2.5 times faster than comparing String.charCodeAt()
                   */
                if (!(str[i]|0 >= 0))
                        throw new Error(`Expected number at ${i}, got '${str[i]}'.`);

                if (cc === 90 || cc === 45 || cc === 43 ||
                    (dec_idx !== -1 && i + 1 === str.length)) {
                        if (tzpart && (cc === 90 || cc == 45 || cc === 43))
                                throw new Error(`Unexpected time zone designator. Time zone designators may not appear in time zone designator strings.`);

                        if (dec_idx !== -1) {
                                if (i - (dec_idx - ((i + 1 === str.length)&1)) === 0)
                                        throw new Error(`Unexpected end of decimal part.`);

                                const idx = i - dec_idx + ((cc !== 90 && cc !== 45 && cc != 43)&1);
                                const dec = Math.pow(10, -idx) * (str.substr(dec_idx, idx)|0);
                                if (min === -1)
                                        min = 60 * dec;
                                else if (sec === -1)
                                        sec = 60 * dec;
                                else
                                        mili = str.substr(dec_idx, idx)|0;
                        }

                        if (cc === 90 && i + 1 < str.length)
                                throw new Error(`Unexpected zero-offset time zone designator at position ${i}. A zero-offset time zone designator may only appear as the last character.`);

                        if (tzpart !== true && (cc === 45 || cc === 43)) {
                                offset = ISO8601TimeStringParser(str.substr(i + 1), true);
                                offset.direction = cc === 45 ? -1 : 1;
                        }

                        break;
                } else if (dec_idx === -1) {
                        if (i === 1)
                                hour = str.substr(0, 2)|0;
                        else if (i === 3 + (delim&1))
                                min = str.substr(i - 1, 2)|0;                                
                        else if (i === 5 + 2 * (delim&1))
                                sec = str.substr(i - 1, 2)|0;
                }

                if (i + 1 === str.length && hour === -1)
                        throw new Error("Unexpected end of time string.");
        }

        if (hour > 24)
                throw new RangeError(`Expected hour value between 0 and 24, got ${hour}.`);
        else if (min > 59)
                throw new RangeError(`Expected minutes value between 0 and 59, got ${min}.`);
        else if (sec > 59)
                throw new RangeError(`Expected seconds value between 0 and 59, got ${sec}.`);

        return Object.assign({
                hour: hour,
                minutes: min === -1 ? 0 : min,
                seconds: sec === -1 ? 0 : sec,
                miliseconds: mili === -1 ? 0 : mili
        }, tzpart === true ? {} : { timezoneOffset: offset });
}