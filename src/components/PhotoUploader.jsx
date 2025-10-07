import React, { useState } from "react";
import axios from "axios";
import { UploadCloud, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PhotosUploader({ addedPhotos, onChange }) {
  const [photoLink, setPhotoLink] = useState("");

  // Upload by link
  async function addPhotoByLink(ev) {
    ev.preventDefault();
    if (!photoLink.trim()) return;

    try {
      const { data: uploadedUrl } = await axios.post(
        "/upload-by-link",
        { link: photoLink },
        { withCredentials: true }
      );
      onChange((prev) => [...prev, uploadedUrl]);
      setPhotoLink("");
    } catch (err) {
      console.error("Upload by link failed:", err);
      alert("Failed to upload via link. Please try again.");
    }
  }

  // Upload from device
  async function uploadPhoto(ev) {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]);
    }

    try {
      const res = await axios.post("/upload", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload photos. Please try again.");
    }
  }

  // Remove image
  function removePhoto(link) {
    onChange(addedPhotos.filter((photo) => photo !== link));
  }

  return (
    <div>
      {/* Upload by link */}
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Add photo using a link..."
          value={photoLink}
          onChange={(ev) => setPhotoLink(ev.target.value)}
        />
        <Button
          onClick={addPhotoByLink}
          type="button"
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          Add&nbsp;Photo
        </Button>
      </div>

      {/* Uploaded Photos Grid */}
      <div className="grid gap-3 grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-4">
        {addedPhotos.map((link, index) => (
          <div key={index} className="relative h-32 flex">
            <img
              className="rounded-2xl w-full object-cover"
              src={link}
              alt={`upload ${index}`}
            />
            <button
              type="button"
              onClick={() => removePhoto(link)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload via File */}
        <label className="h-32 cursor-pointer flex flex-col items-center justify-center gap-2 border bg-transparent rounded-2xl p-2 text-gray-600 text-sm">
          <UploadCloud className="w-6 h-6" />
          Upload
          <input
            type="file"
            multiple
            className="hidden"
            onChange={uploadPhoto}
          />
        </label>
      </div>
    </div>
  );
}
