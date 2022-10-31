var webglext;
(function (webglext) {
    function glOrtho(left, right, bottom, top, near, far) {
        var tx = (right + left) / (right - left);
        var ty = (top + bottom) / (top - bottom);
        var tz = (far + near) / (far - near);
        // GL ES (and therefore WebGL) requires matrices to be column-major
        return new Float32Array([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -2 / (far - near), 0,
            -tx, -ty, -tz, 1
        ]);
    }
    webglext.glOrtho = glOrtho;
    function glOrthoViewport(viewport) {
        return glOrtho(-0.5, viewport.w - 0.5, -0.5, viewport.h - 0.5, -1, 1);
    }
    webglext.glOrthoViewport = glOrthoViewport;
    function glOrthoAxis(axis) {
        return glOrtho(axis.xAxis.vMin, axis.xAxis.vMax, axis.yAxis.vMin, axis.yAxis.vMax, -1, 1);
    }
    webglext.glOrthoAxis = glOrthoAxis;
})(webglext || (webglext = {}));
//# sourceMappingURL=matrix.js.map