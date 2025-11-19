import { Capacitor } from "@capacitor/core";
import { CapacitorPluginMlKitTextRecognition } from "@capacitor-mlkit/text-recognition";

import { blobToBase64 } from "@/src/lib/imageProcessing";

export interface NativeOCRResult {
  text: string;
  lines: string[];
}

export async function scanImageNative(imagePath: string): Promise<NativeOCRResult> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Native OCR ist nur auf iOS/Android verfügbar.");
  }

  if (!Capacitor.isPluginAvailable("CapacitorPluginMlKitTextRecognition")) {
    throw new Error("ML Kit Plugin ist nicht verfügbar.");
  }

  try {
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error("Bild konnte nicht geladen werden.");
    }

    const blob = await response.blob();
    const base64Image = await blobToBase64(blob);

    const result = await CapacitorPluginMlKitTextRecognition.detectText({
      base64Image,
      rotation: 0,
    });

    const lines = result.blocks.flatMap((block) => block.lines.map((line) => line.text));

    return {
      text: result.text ?? "",
      lines,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter OCR-Fehler";
    throw new Error(`ML Kit Fehler: ${message}`);
  }
}
