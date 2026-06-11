"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

const MALE_AVATARS = [
  "/avatars/male_avatar_1.png",
  "/avatars/male_avatar_2.png",
  "/avatars/male_avatar_3.png",
  "/avatars/male_avatar_4.png",
  "/avatars/male_avatar_5.png",
  "/avatars/male_avatar_6.png",
  "/avatars/male_avatar_7.png",
  "/avatars/male_avatar_8.png",
  "/avatars/male_avatar_9.png",
  "/avatars/male_avatar_10.png",
];

const FEMALE_AVATARS = [
  "/avatars/female_avatar_1.png",
  "/avatars/female_avatar_2.png",
  "/avatars/female_avatar_3.png",
  "/avatars/female_avatar_4.png",
  "/avatars/female_avatar_5.png",
  "/avatars/female_avatar_6.png",
  "/avatars/female_avatar_7.png",
  "/avatars/female_avatar_8.png",
  "/avatars/female_avatar_9.png",
  "/avatars/female_avatar_10.png",
];

const ANIMAL_AVATARS = [
  "/avatars/animal_avatar_1.png",
  "/avatars/animal_avatar_2.png",
  "/avatars/animal_avatar_3.png",
  "/avatars/animal_avatar_4.png",
  "/avatars/animal_avatar_5.png",
];

const POKEMON_AVATARS = [
  "/avatars/pokemon_avatar_1.png",
  "/avatars/pokemon_avatar_2.png",
  "/avatars/pokemon_avatar_3.png",
  "/avatars/pokemon_avatar_4.png",
  "/avatars/pokemon_avatar_5.png",
];

const ALL_AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS, ...ANIMAL_AVATARS, ...POKEMON_AVATARS];

export function AvatarPicker({ currentImageUrl, userName }: { currentImageUrl?: string; userName?: string | null }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectAvatar = async (avatarPath: string) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const response = await fetch(avatarPath);
      const blob = await response.blob();
      await user.setProfileImage({ file: blob });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative group rounded-full shrink-0 border-2 border-[#f0f0f0] overflow-hidden bg-white"
        title="Change Avatar"
      >
        {currentImageUrl ? (
          <Image 
            src={currentImageUrl} 
            alt={userName ? `${userName}'s avatar` : "User avatar"} 
            width={56} 
            height={56}
            className="rounded-full w-[56px] h-[56px] object-cover transition-opacity group-hover:opacity-80" 
          />
        ) : (
          <div className="w-[56px] h-[56px] bg-gray-200 rounded-full" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-[10px] font-semibold uppercase tracking-wider">Edit</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isUpdating && setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-condensed tracking-tight">Choose an Avatar</h2>
                  <p className="text-sm text-gray-500 mt-1">Select a new look for your profile</p>
                </div>
                <button 
                  onClick={() => !isUpdating && setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {ALL_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAvatar(avatar)}
                      disabled={isUpdating}
                      className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#111] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 bg-gray-50 group"
                    >
                      <Image 
                        src={avatar} 
                        alt={`Avatar ${idx + 1}`} 
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {isUpdating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#111] rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-900">Updating your profile...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
