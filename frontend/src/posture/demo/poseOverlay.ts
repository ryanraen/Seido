import type { NormalizedLandmark } from "./poseLandmarker";

const CONNECTIONS: Array<[number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [27, 31],
  [28, 32],
];

const BODY_POINT_INDICES = new Set<number>([
  11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32,
]);

export function smoothPose(
  previous: NormalizedLandmark[] | null,
  current: NormalizedLandmark[],
  alpha = 0.7,
): NormalizedLandmark[] {
  if (!previous || previous.length !== current.length) {
    return current;
  }

  return current.map((point, index) => {
    const prev = previous[index];
    if (!prev) return point;

    return {
      x: prev.x * alpha + point.x * (1 - alpha),
      y: prev.y * alpha + point.y * (1 - alpha),
      z: (prev.z ?? 0) * alpha + (point.z ?? 0) * (1 - alpha),
      visibility:
        (prev.visibility ?? 1) * alpha + (point.visibility ?? 1) * (1 - alpha),
    };
  });
}

export function clearPoseOverlay(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawPoseOverlay(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[],
  sourceWidth: number,
  sourceHeight: number,
): void {
  const context = canvas.getContext("2d");
  if (!context) return;

  if (canvas.width === 0 || canvas.height === 0) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));
  }

  const destWidth = canvas.width;
  const destHeight = canvas.height;

  const fit = fitContain(sourceWidth, sourceHeight, destWidth, destHeight);

  context.clearRect(0, 0, destWidth, destHeight);

  context.lineWidth = 3;
  context.strokeStyle = "rgba(255, 255, 255, 0.95)";
  context.lineCap = "round";

  for (const [startIndex, endIndex] of CONNECTIONS) {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];
    if (!start || !end) continue;
    if ((start.visibility ?? 1) < 0.2 || (end.visibility ?? 1) < 0.2) continue;

    const startPoint = toCanvasPoint(start.x, start.y, fit);
    const endPoint = toCanvasPoint(end.x, end.y, fit);

    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.stroke();
  }

  for (let i = 0; i < landmarks.length; i += 1) {
    if (!BODY_POINT_INDICES.has(i)) continue;
    const point = landmarks[i];
    if (!point || (point.visibility ?? 1) < 0.2) continue;

    const canvasPoint = toCanvasPoint(point.x, point.y, fit);

    context.beginPath();
    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.arc(canvasPoint.x, canvasPoint.y, 5.5, 0, Math.PI * 2);
    context.fill();
  }
}

function fitContain(
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
): { x: number; y: number; width: number; height: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { x: 0, y: 0, width: destWidth, height: destHeight };
  }

  const scale = Math.min(destWidth / sourceWidth, destHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: (destWidth - width) / 2,
    y: (destHeight - height) / 2,
    width,
    height,
  };
}

function toCanvasPoint(
  x: number,
  y: number,
  fit: { x: number; y: number; width: number; height: number },
): { x: number; y: number } {
  return {
    x: fit.x + x * fit.width,
    y: fit.y + y * fit.height,
  };
}
