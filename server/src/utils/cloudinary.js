import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadPdf = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const publicId = `${folder}/${randomUUID()}.pdf`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes("/raw/upload/")) return;

  const pathname = new URL(fileUrl).pathname;
  const uploadIndex = pathname.indexOf("/raw/upload/");

  let publicId = pathname.slice(uploadIndex + "/raw/upload/".length);

  publicId = publicId.replace(/^v\d+\//, "");
  publicId = decodeURIComponent(publicId);

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Unable to delete Cloudinary file.");
  }

  return result;
};