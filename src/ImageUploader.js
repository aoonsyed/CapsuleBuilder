import React, { useState } from "react";

export default function ImageUploader() {
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const validateFile = (file) => {
    const validTypes = ["image/png", "image/jpeg"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!validTypes.includes(file.type)) {
      alert("Only PNG and JPG files are allowed.");
      return false;
    }
    if (file.size > maxSize) {
      alert("File size should be under 10MB.");
      return false;
    }
    return true;
  };

  return (
    <div
      className="border-2 border-dashed border-grey rounded-md p-6 text-center text-[#333] bg-[#fdf8f3]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <label htmlFor="fileInput" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">📷</span>
          <p className="font-medium">
            Click to upload images or drag & drop
          </p>
          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
        </div>
        <input
          type="file"
          id="fileInput"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <p className="mt-4 text-green-700 font-medium">
          Selected: {file.name}
        </p>
      )}
    </div>
  );
}
