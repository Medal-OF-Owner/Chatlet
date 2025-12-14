import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";

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
  const { user } = useAuth();
  // Assurez-vous que le type de `user` est correct pour accéder à `user.profileImage`
  // En supposant que useAuth retourne un objet avec une propriété `profileImage` si l'utilisateur est connecté.
  // Pour éviter une erreur de type, nous allons vérifier si `user` est défini et a la propriété.
  // Cependant, pour le moment, nous allons simplement nous assurer que l'objet `user` est bien celui retourné par `trpc.auth.me.useQuery`
  // et que le type est correctement inféré.
  // Le problème est probablement dans Chat.tsx, mais vérifions ici aussi.
  // L'erreur dans Chat.tsx était la requête redondante.
  // Ici, la logique semble correcte: `if (user)` vérifie si l'utilisateur est connecté.
  // L'erreur d'exécution dans le navigateur est probablement dans Chat.tsx.
  // Nous allons laisser ce fichier tel quel pour l'instant et nous concentrer sur Chat.tsx.
  const updateProfileImageMutation = trpc.auth.updateProfileImage.useMutation();

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

      if (user) {
        // Utilisateur connecté: Sauvegarde sur le serveur
        updateProfileImageMutation.mutate({ profileImage: base64 });
      } else {
        // Utilisateur invité: Sauvegarde en local
        localStorage.setItem("profileImage", base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);

    if (user) {
      // Utilisateur connecté: Suppression sur le serveur
      updateProfileImageMutation.mutate({ profileImage: null });
    } else {
      // Utilisateur invité: Suppression en local
      localStorage.removeItem("profileImage");
    }

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
