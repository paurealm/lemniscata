
const BACKGROUND_WIDTH = 1920;
const BACKGROUND_HEIGHT = 1080;

const STREAM_WIDTH = 1440;
const STREAM_HEIGHT = 1080;

const STREAM_URL = "https://tv.lemniscata.net/public/1/live/stream.m3u8";

const TV_CORNERS = [
    { x: 1165, y: 330 },
    { x: 1425, y: 221 },
    { x: 1446, y: 627 },
    { x: 1183, y: 607 }
];

const POINT_NAMES = [
    "Top left",
    "Top right",
    "Bottom right",
    "Bottom left"
];

const world = document.getElementById("world");
const stream = document.getElementById("tv-stream");
const projection = document.getElementById("tv-projection");
const calibration = document.getElementById("calibration");

function updateWorld() {
    const scale = Math.max(
        window.innerWidth / BACKGROUND_WIDTH,
        window.innerHeight / BACKGROUND_HEIGHT
    );

    world.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function solveLinearSystem(matrix) {
    const size = matrix.length;

    for (let i = 0; i < size; i++) {
        let pivotRow = i;

        for (let j = i + 1; j < size; j++) {
            if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivotRow][i])) {
                pivotRow = j;
            }
        }

        [matrix[i], matrix[pivotRow]] = [matrix[pivotRow], matrix[i]];

        if (Math.abs(matrix[i][i]) < 1e-12) {
            throw new Error("Singular homography matrix");
        }

        const pivot = matrix[i][i];

        for (let j = i; j <= size; j++) {
            matrix[i][j] /= pivot;
        }

        for (let j = 0; j < size; j++) {
            if (j === i) {
                continue;
            }

            const factor = matrix[j][i];

            for (let k = i; k <= size; k++) {
                matrix[j][k] -= factor * matrix[i][k];
            }
        }
    }

    return matrix.map(row => row[size]);
}

function calculateHomography(width, height, corners) {
    const sourcePoints = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
    ];

    const equations = [];

    for (let i = 0; i < 4; i++) {
        const { x, y } = sourcePoints[i];
        const { x: u, y: v } = corners[i];

        equations.push([
            x, y, 1, 0, 0, 0,
            -u * x, -u * y, u
        ]);

        equations.push([
            0, 0, 0, x, y, 1,
            -v * x, -v * y, v
        ]);
    }

    const [a, b, c, d, e, f, g, h] = solveLinearSystem(equations);

    return [
        a, d, 0, g,
        b, e, 0, h,
        0, 0, 1, 0,
        c, f, 0, 1
    ];
}

function updateTVGeometry() {
    const matrix = calculateHomography(
        STREAM_WIDTH,
        STREAM_HEIGHT,
        TV_CORNERS
    );

    projection.style.transform = `matrix3d(${matrix.join(",")})`;
}

function updateCalibrationPoints() {
    if (!calibration) {
        return;
    }

    calibration.innerHTML = "";

    TV_CORNERS.forEach((point, index) => {
        const handle = document.createElement("div");

        handle.className = "calibration-point";
        handle.dataset.label = POINT_NAMES[index];
        handle.style.left = `${point.x}px`;
        handle.style.top = `${point.y}px`;

        handle.addEventListener("pointerdown", event => {
            event.preventDefault();
            handle.setPointerCapture(event.pointerId);
        });

        handle.addEventListener("pointermove", event => {
            if (!handle.hasPointerCapture(event.pointerId)) {
                return;
            }

            const rect = world.getBoundingClientRect();
            const scale = rect.width / BACKGROUND_WIDTH;

            point.x = Math.round((event.clientX - rect.left) / scale);
            point.y = Math.round((event.clientY - rect.top) / scale);

            handle.style.left = `${point.x}px`;
            handle.style.top = `${point.y}px`;

            updateTVGeometry();

            console.clear();
            console.table(TV_CORNERS);
        });

        calibration.appendChild(handle);
    });
}

function initializeHls() {
    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        stream.crossOrigin = "anonymous";

        hls.loadSource(STREAM_URL);
        hls.attachMedia(stream);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            stream.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
                console.error("Fatal HLS error:", data);
            }
        });

        return;
    }

    if (stream.canPlayType("application/vnd.apple.mpegurl")) {
        stream.src = STREAM_URL;

        stream.addEventListener("loadedmetadata", () => {
            stream.play().catch(console.error);
        });

        return;
    }

    console.error("HLS is not supported by this browser.");
}

window.addEventListener("resize", updateWorld);

updateWorld();
updateTVGeometry();
updateCalibrationPoints();
initializeHls();
