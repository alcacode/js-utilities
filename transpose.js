"use strict";
/**
 * Returns the results of performing a transpose operation on `arr`.
 * `arr` must be a 2-dimensional `Array`.
 *
 * `arr` is not mutated.
 *
 * Note: This function is **unchecked**, `arr` is assumed to be correct.
 * @param arr - Array to transpose.
 * @see transpose
 */
function transposeUnchecked(arr) {
    const out = new Array(arr[0].length);
    for (let i = 0; i < out.length; i++)
        out[i] = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            out[j][i] = arr[i][j];
        }
    }
    return out;
}
function transpose(arr, tryFixErrors) {
    const _arr = !tryFixErrors ? arr : [];
    let rows = -1;
    for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        if (!Array.isArray(val)) {
            if (!tryFixErrors)
                throw TypeError(`Unexpected value at index ${i}. Expected Array instance, got ${typeof val}.`);
        }
        else if (tryFixErrors) {
            if (rows < val.length)
                rows = val.length;
        }
        else {
            if (rows < 0)
                rows = val.length;
            else if (rows !== val.length)
                throw TypeError(`Unexpected length of Array at index ${i}. Expected ${rows}, got ${val.length}.`);
        }
    }
    if (rows === -1) {
        if (!tryFixErrors)
            throw Error('Could not determine matrix dimensions.');
        _arr[0] = arr;
    }
    else {
        for (let i = 0; tryFixErrors && i < arr.length; i++) {
            const val = arr[i];
            if (Array.isArray(val)) {
                if (val.length < rows) {
                    _arr[i] = val.slice(0);
                    _arr[i].length = rows;
                    _arr[i].fill(0, val.length);
                }
                else {
                    _arr[i] = val;
                }
            }
            else {
                _arr[i] = new Array(rows).fill(val);
            }
        }
    }
    return transposeUnchecked(_arr);
}
