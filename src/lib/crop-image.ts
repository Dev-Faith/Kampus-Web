export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/**
 * Creates a cropped image Blob from image source and crop area coordinates.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d canvas context available");
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = calculateBoundingBox(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central point on canvas to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Cropped canvas for the 16:10 aspect crop
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No 2d context for cropped canvas");
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert cropped canvas to File
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "cropped-image.webp", {
          type: "image/webp",
        });
        resolve(file);
      },
      "image/webp",
      0.92
    );
  });
}

function calculateBoundingBox(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height:
      Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
}
