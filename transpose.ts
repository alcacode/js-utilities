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
function transposeUnchecked<T>(arr: T[][]): T[][] {
        const out: T[][] = new Array(arr[0].length);

        for (let i = 0; i < out.length; i++)
                out[i] = new Array(arr.length);

        for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                        out[j][i] = arr[i][j];
                }
        }

        return out;
}

/**
 * Returns the results of performing a transpose operation on `arr`.
 * `arr` must be a 2-dimensional `Array`.
 * 
 * `arr` is not mutated.
 * 
 * ### tryFixError
 * 
 * Attempt to adjust malformed matrices such that they can be transposed.
 * Default: `false`.
 * 
 * If `false` (or unset) an exception is thrown when not all sub-arrays are of
 * the same size, when any member of `arr` is not an `Array` instance, and when
 * the dimensions of the matrix cannot be determined (for instance if there are
 * no sub-arrays).
 * 
 * If `true`, the following fixes are applied where necessary:
 * 1. Sub-arrays are zero-padded such that they have the same dimensions as the
 *    largest sub-array.\
 *    For example, ``[[2], [0, 1]]`` would be treated as ``[[2, 0], [0, 1]]``.
 * 2. Non-array elements are treated as though they were arrays consisting of
 *    that element's value at every index.\
 *    For example, ``[2, [0, 1]]`` would be treated as ``[[2, 2], [0, 1]]``.
 * 3. If no sub-arrays are present, it will be treated as a 1 x _n_ matrix.
 * 
 * 
 * @param arr - Array to transpose.
 * @param {boolean} [tryFixErrors] - Attempt to fix poorly formed data.
 * @see transposeUnchecked
 */
function transpose<T>(arr: T[][], tryFixErrors?: false): T[][];
function transpose<T>(arr: (T | T[])[], tryFixErrors: true): T[][];
function transpose<T>(arr: (T | T[])[], tryFixErrors?: boolean): T[][] {
        const _arr: T[][] = !tryFixErrors ? arr as T[][] : [];

        let rows = -1;
        for (let i = 0; i < arr.length; i++) {
                const val = arr[i];

                if (!Array.isArray(val)) {
                        if (!tryFixErrors)
                                throw TypeError(`Unexpected value at index ${i}. Expected Array instance, got ${typeof val}.`);
                } else if (tryFixErrors) {
                        if (rows < val.length)
                                rows = val.length;
                } else {
                        if (rows < 0)
                                rows = val.length;
                        else if (rows !== val.length)
                                throw TypeError(`Unexpected length of Array at index ${i}. Expected ${rows}, got ${val.length}.`);
                }
        }

        if (rows === -1) {
                if (!tryFixErrors)
                        throw Error('Could not determine matrix dimensions.');

                _arr[0] = arr as T[];
        } else {
                for (let i = 0; tryFixErrors && i < arr.length; i++) {
                        const val = arr[i];

                        if (Array.isArray(val)) {
                                if (val.length < rows) {
                                        _arr[i] = val.slice(0);
                                        _arr[i].length = rows;
                                        _arr[i].fill(<any>0, val.length);
                                } else {
                                        _arr[i] = val;
                                }
                        } else {
                                _arr[i] = new Array(rows).fill(val);
                        }
                }
        }

        return transposeUnchecked(_arr);
}