
const canvas = document.getElementById("tv-canvas");
const video = document.getElementById("tv-stream");

const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance"
});

if (!gl) {
    throw new Error("WebGL is not supported");
}

const vertexShaderSource = `
attribute vec2 aPosition;
attribute vec2 aUv;

varying vec2 vUv;

void main() {
    vUv = aUv;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTexelSize;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    vec3 color = texture2D(uTexture, uv).rgb * 0.40;

    color += texture2D(uTexture, uv + vec2(uTexelSize.x, 0.0)).rgb * 0.15;
    color += texture2D(uTexture, uv - vec2(uTexelSize.x, 0.0)).rgb * 0.15;
    color += texture2D(uTexture, uv + vec2(0.0, uTexelSize.y)).rgb * 0.15;
    color += texture2D(uTexture, uv - vec2(0.0, uTexelSize.y)).rgb * 0.15;

    color *= vec3(1.06, 1.025, 0.94);

    float brightness = (color.r + color.g + color.b) / 3.0;
    float alpha = brightness <= 0.0
        ? 0.0
        : mix(0.40, 0.50, smoothstep(1.0 / 255.0, 1.0, brightness));

    vec2 pixelPosition = uv * uResolution;

    float edgeDistance = min(
        min(pixelPosition.x, uResolution.x - pixelPosition.x),
        min(pixelPosition.y, uResolution.y - pixelPosition.y)
    );

    alpha *= smoothstep(0.0, 42.0, edgeDistance);

    float flicker =
        1.0
        + 0.012 * sin(uTime * 7.3)
        + 0.007 * sin(uTime * 13.7 + 1.8)
        + 0.004 * sin(uTime * 23.1 + 4.2);

    color *= flicker;
    alpha = clamp(alpha * flicker, 0.0, 0.5);

    gl_FragColor = vec4(color * alpha, alpha);
}
`;

function compileShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
    }

    return shader;
}

const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0, 0, 0, 0);

const vertices = new Float32Array([
    -1, -1, 0, 0,
     1, -1, 1, 0,
    -1,  1, 0, 1,
     1,  1, 1, 1
]);

const vertexBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "aPosition");
const uvLocation = gl.getAttribLocation(program, "aUv");

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

gl.enableVertexAttribArray(uvLocation);
gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);

const texture = gl.createTexture();

gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

const texelLocation = gl.getUniformLocation(program, "uTexelSize");
const resolutionLocation = gl.getUniformLocation(program, "uResolution");
const timeLocation = gl.getUniformLocation(program, "uTime");
const textureLocation = gl.getUniformLocation(program, "uTexture");

gl.uniform1i(textureLocation, 0);
gl.activeTexture(gl.TEXTURE0);

let textureInitialized = false;
let lastWidth = 0;
let lastHeight = 0;

function renderFrame() {
    if (
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {
        return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width !== lastWidth || height !== lastHeight) {
        canvas.width = width;
        canvas.height = height;

        gl.viewport(0, 0, width, height);
        gl.uniform2f(texelLocation, 1 / width, 1 / height);
        gl.uniform2f(resolutionLocation, width, height);

        lastWidth = width;
        lastHeight = height;
        textureInitialized = false;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (textureInitialized) {
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video
        );
    } else {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video
        );

        textureInitialized = true;
    }

    gl.uniform1f(timeLocation, performance.now() / 1000);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function scheduleFrame() {
    if ("requestVideoFrameCallback" in video) {
        video.requestVideoFrameCallback(() => {
            renderFrame();
            scheduleFrame();
        });

        return;
    }

    requestAnimationFrame(() => {
        renderFrame();
        scheduleFrame();
    });
}

video.addEventListener("playing", scheduleFrame, { once: true });
