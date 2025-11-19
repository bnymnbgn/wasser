interface EnhanceOptions {
  targetWidth?: number;
  contrast?: number;
  grayscale?: boolean;
  brightness?: number;
}

const DEFAULT_OPTIONS: Required<EnhanceOptions> = {
  targetWidth: 2000,
  contrast: 2,
  grayscale: true,
  brightness: 1.1,
};

/**
 * Applies grayscale/contrast filters to a blob or file and returns a sharpened JPEG blob.
 */
export async function enhanceImageBlob(source: Blob, options?: EnhanceOptions): Promise<Blob> {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas Kontext konnte nicht erstellt werden."));
        return;
      }

      const scale = Math.min(1, settings.targetWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const filters = [
        settings.grayscale ? "grayscale(1)" : "",
        `contrast(${settings.contrast * 100}%)`,
        `brightness(${Math.round(settings.brightness * 100)}%)`,
      ]
        .filter(Boolean)
        .join(" ");

      ctx.filter = filters;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (processedBlob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(processedBlob ?? source);
        },
        "image/jpeg",
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(source);
    };

    img.src = objectUrl;
  });
}

/**
 * Captures the current video frame to a canvas applying grayscale + contrast filters.
 */
export async function captureEnhancedFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options?: { contrast?: number }
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas Kontext konnte nicht erstellt werden.");
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const contrast = options?.contrast ?? 2;
  ctx.filter = `grayscale(1) contrast(${contrast * 100}%)`;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Video-Frame konnte nicht gelesen werden."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}

/**
 * Converts a Blob into a base64 string without the data URI prefix.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [, base64] = result.split(",");
        resolve(base64 ?? result);
      } else {
        reject(new Error("Konnte Base64 nicht erstellen."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Base64 Umwandlung fehlgeschlagen."));
    reader.readAsDataURL(blob);
  });
}
