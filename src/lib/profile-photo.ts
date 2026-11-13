import { uploadImage } from "./upload-image";
export function uploadProfilePhoto(file: File, role: string) {
  return uploadImage(
    file,
    role === "LANDLORD"
      ? "kampus/landlord-profiles"
      : "kampus/student-profiles",
    true,
  );
}
