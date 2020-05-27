/**
 * Creates a new `Array` whose elements are the results of flattening `arr`.
 * 
 * Does not mutate `arr`.
 * @param arr - `Array` to extract elements from.
 * @param {number} [depth] - Maximum depth level. Default: `1`.
 * @see flattenUnbound
 */
function flatten<T>(arr: T[], depth?: number):
        (T extends (infer R)[] ? R[] : T)[]
{
        if (!Array.isArray(arr))
                return arr as any;

        const _d = (depth === undefined ? 1 : depth);
        const stack: T[][] = [ arr ];
        const indicies     = [ 0, 0, 0, 0 ];
	const res: any[]   = [ ];
        let cur: T[] = arr;
        let slen = 1;
        let rlen = 0;
        let clen = arr.length;

	for (let i = 0; slen; i++) {
		let itm = cur[i];
		if (i == clen) {
			cur  = stack[--slen];
			i    = indicies[slen];
			clen = cur.length;
		} else if (_d >= slen && Array.isArray(itm)) {
			indicies[slen] = i;
			stack[slen++]  = cur;
			cur  = itm;
			clen = itm.length;
			i    = -1;
		} else {
			res[rlen++] = itm;
		}
	}

	return res;
}

/**
 * Creates a new `Array` whose elements are the results of flattening `arr`.
 * 
 * Does not mutate `arr`. Identical to `flatten()` except `flattenUnbound()`
 * lacks a depth parameter. It will go to whatever depth is necessary to
 * flatten nested structures. The simplified logic makes `flattenUnbound()`
 * marginally more performant than `flatten()`.
 * @param arr - `Array` to extract elements from.
 * @see flatten
 */
function flattenUnbound<T>(arr: T[]):
        (T extends (infer R)[] ? (R extends any[] ? never : R) : T)[]
{
        if (!Array.isArray(arr))
                return arr as any;

        const stack: T[][] = [ arr ];
        const indicies     = [ 0, 0, 0, 0 ];
	const res: any[]   = [ ];
        let cur: T[] = arr;
        let slen = 1;
        let rlen = 0;
        let clen = arr.length;

	for (let i = 0; slen; i++) {
		let itm = cur[i];
		if (i == clen) {
			cur  = stack[--slen];
			i    = indicies[slen];
			clen = cur.length;
		} else if (Array.isArray(itm)) {
			indicies[slen] = i;
			stack[slen++]  = cur;
			cur  = itm;
			clen = itm.length;
			i    = -1;
		} else {
			res[rlen++] = itm;
		}
	}

	return res;
}