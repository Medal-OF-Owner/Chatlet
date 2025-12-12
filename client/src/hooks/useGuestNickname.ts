import { useEffect, useState } from "react";
import { generateRandomNickname } from "@/lib/utils";

const STORAGE_KEY = "chatlet_guest_nickname";

export function useGuestNickname() {
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNickname(stored);
      setIsLoading(false);
    } else {
      const random = generateRandomNickname();
      localStorage.setItem(STORAGE_KEY, random);
      setNickname(random);
      setIsLoading(false);
    }
  }, []);

  const updateNickname = (newName: string) => {
    setNickname(newName);
    localStorage.setItem(STORAGE_KEY, newName);
  };

  return { nickname, isLoading, updateNickname };
}
