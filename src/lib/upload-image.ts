import imageCompression from "browser-image-compression";
export async function uploadImage(
  file: File,
  folder = "kampus/lodges",
  profile = false,
): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Each photo must be under 10 MB.");
  const compressed = await imageCompression(file, {
    maxSizeMB: profile ? 0.5 : 1,
    maxWidthOrHeight: profile ? 800 : 1920,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  const body = new FormData();
  body.append("file", compressed, "photo.jpg");
  body.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kampus_mobile",
  );
  body.append("folder", folder);
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dp4g1u5dy",
    controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 60000);
  try {
    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,
      { method: "POST", body, signal: controller.signal },
    );
    const data = await r.json();
    if (
      !r.ok ||
      typeof data.secure_url !== "string" ||
      !data.secure_url.startsWith("https://")
    )
      throw new Error(
        "Photo upload failed. Please try another image or retry.",
      );
    return data.secure_url;
  } catch (e) {
    if (controller.signal.aborted)
      throw new Error(
        "Photo upload timed out. Check your connection and retry.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
