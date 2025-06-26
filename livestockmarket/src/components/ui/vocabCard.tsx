import React from "react";

export interface VocabCardProps {
  word: string;
  meaning: string;
  imageUrl: string;
}

export function VocabCard({ word, meaning, imageUrl }: VocabCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
      <img
        src={imageUrl}
        alt={word}
        loading="lazy"
        width={300}
        height={300}
        className="w-[300px] h-[300px] object-cover rounded-md mb-4"
      />
      <h3 className="text-xl font-bold text-purple-700">{word}</h3>
      <p className="text-gray-600">{meaning}</p>
    </div>
  );
}

  

