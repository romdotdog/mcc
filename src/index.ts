const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");

if (gl === null) {
	alert("Unable to initialize WebGL.");
	window.close();
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
