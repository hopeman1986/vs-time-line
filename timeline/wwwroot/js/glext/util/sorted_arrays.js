var webglext;
(function (webglext) {
    // XXX: These probably belong in their own namespace
    function indexOf(vs, x) {
        var a = 0;
        var b = vs.length - 1;
        while (a <= b) {
            // Bitwise-or-zero truncates to integer
            var pivot = ((a + b) / 2) | 0;
            var vPivot = vs[pivot];
            if (vPivot < x) {
                a = pivot + 1;
            }
            else if (vPivot > x) {
                b = pivot - 1;
            }
            else {
                // This is a little sloppy if either value is NaN, or if one is +0.0 and the other is -0.0 
                return pivot;
            }
        }
        return -(a + 1);
    }
    webglext.indexOf = indexOf;
    function indexNearest(vs, x) {
        var i = indexOf(vs, x);
        // Exact value found
        if (i >= 0)
            return i;
        // Find the closer of the adjacent values
        var iAfter = -i - 1;
        var iBefore = iAfter - 1;
        if (iAfter >= vs.length)
            return iBefore;
        if (iBefore < 0)
            return iAfter;
        var diffAfter = vs[iAfter] - x;
        var diffBefore = x - vs[iBefore];
        return (diffAfter <= diffBefore ? iAfter : iBefore);
    }
    webglext.indexNearest = indexNearest;
    function indexAfter(vs, x) {
        var i = indexOf(vs, x);
        // Exact value not found
        if (i < 0)
            return (-i - 1);
        // If the exact value was found, find the value's last occurrence
        var n = vs.length;
        for (var j = i + 1; j < n; j++) {
            if (vs[j] > x)
                return j;
        }
        return n;
    }
    webglext.indexAfter = indexAfter;
    function indexAtOrAfter(vs, x) {
        var i = indexOf(vs, x);
        // Exact value not found
        if (i < 0)
            return (-i - 1);
        // If the exact value was found, find the value's first occurrence
        var n = vs.length;
        for (var j = i; j > 0; j--) {
            if (vs[j - 1] < x)
                return j;
        }
        return 0;
    }
    webglext.indexAtOrAfter = indexAtOrAfter;
    function indexBefore(vs, x) {
        return indexAtOrAfter(vs, x) - 1;
    }
    webglext.indexBefore = indexBefore;
    function indexAtOrBefore(vs, x) {
        return indexAfter(vs, x) - 1;
    }
    webglext.indexAtOrBefore = indexAtOrBefore;
})(webglext || (webglext = {}));
//# sourceMappingURL=sorted_arrays.js.map