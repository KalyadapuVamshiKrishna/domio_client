import axios from "axios";
import { useState } from "react";
import Image from "../../Image.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PhotosUploader({ addedPhotos, onChange }) {
  const [photoLink, setPhotoLink] = useState('');

  async function addPhotoByLink(ev) {
    ev.preventDefault();
    const { data: filename } = await axios.post('/upload-by-link', { link: photoLink });
    onChange(prev => [...prev, filename]);
    setPhotoLink('');
  }

  function uploadPhoto(ev) {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) data.append('photos', files[i]);
    axios.post('/upload', data, { headers: { 'Content-type': 'multipart/form-data' } })
      .then(res => onChange(prev => [...prev, ...res.data]));
  }

  function removePhoto(ev, filename) {
    ev.preventDefault();
    onChange(addedPhotos.filter(photo => photo !== filename));
  }

  function selectAsMainPhoto(ev, filename) {
    ev.preventDefault();
    onChange([filename, ...addedPhotos.filter(photo => photo !== filename)]);
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Add using a link ...jpg"
          value={photoLink}
          onChange={ev => setPhotoLink(ev.target.value)}
        />
        <Button onClick={addPhotoByLink}>Add Photo</Button>
      </div>

      <div className="grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {addedPhotos.map(link => (
          <div key={link} className="relative h-32 rounded-2xl overflow-hidden">
            <Image src={link} className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 flex gap-1">
              <Button size="sm" variant={link === addedPhotos[0] ? "default" : "outline"} onClick={ev => selectAsMainPhoto(ev, link)}>
                Main
              </Button>
              <Button size="sm" variant="destructive" onClick={ev => removePhoto(ev, link)}>Delete</Button>
            </div>
          </div>
        ))}

        <label className="h-32 cursor-pointer flex items-center justify-center border rounded-2xl p-2 text-gray-600">
          <Input type="file" className="hidden" multiple onChange={uploadPhoto} />
          Upload
        </label>
      </div>
    </>
  );
}
