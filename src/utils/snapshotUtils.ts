/**
 * Canvas snapshot utilities
 * Captures canvas as image for archive previews
 */

import type Konva from 'konva';
import type { RefObject } from 'react';

/**
 * Capture a Konva Stage as a PNG blob
 * @param stageRef - React ref to the Konva Stage
 * @returns Promise<Blob | null> - PNG image blob or null if failed
 */
export async function captureCanvasSnapshot(
  stageRef: RefObject<Konva.Stage>
): Promise<Blob | null> {
  try {
    if (!stageRef.current) {
      console.error('Stage ref is not available');
      return null;
    }

    const stage = stageRef.current;

    // Export stage to data URL (high quality)
    const dataURL = stage.toDataURL({
      pixelRatio: 2, // Higher quality for preview
      mimeType: 'image/png',
    });

    // Convert data URL to Blob
    const response = await fetch(dataURL);
    const blob = await response.blob();

    console.log(`Captured canvas snapshot: ${Math.round(blob.size / 1024)}KB`);

    return blob;
  } catch (error) {
    console.error('Error capturing canvas snapshot:', error);
    return null;
  }
}

/**
 * Download a canvas snapshot to the user's computer
 * @param stageRef - React ref to the Konva Stage
 * @param filename - Name for the downloaded file
 */
export async function downloadCanvasSnapshot(
  stageRef: RefObject<Konva.Stage>,
  filename: string = 'canvas.png'
): Promise<void> {
  const blob = await captureCanvasSnapshot(stageRef);

  if (!blob) {
    console.error('Failed to capture canvas snapshot for download');
    return;
  }

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`Downloaded canvas snapshot as ${filename}`);
}
