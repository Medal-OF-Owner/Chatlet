import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Avatar } from "./Avatar";

interface ProfileImageUploadProps {
  nickname: string;
  currentImage?: string | null;
  onImageChange: (base64: string | null) => void;

}

export function ProfileImageUpload({
  nickname,
  currentImage,
  onImageChange,

}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert("Image trop grande (max 1MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onImageChange(base64);
      localStorage.setItem("profileImage", base64); // Persistance de la photo
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    localStorage.removeItem("profileImage"); // Suppression de la photo du stockage
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar src={preview} nickname={nickname} size="md" />
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          title="Upload photo"
        >
          <Upload size={16} />
        </button>
        {preview && (
          <button
            onClick={handleRemove}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            title="Remove photo"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
