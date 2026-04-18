"use client";
import React, { useState, useRef } from "react";
import { CldImage } from "next-cloudinary";

const SOCIAL_FORMATS = {
  "Instagram (1:1)": { width: 1080, height: 1080 },
  "Instagram Story (4:5)": { width: 1080, height: 1350 },
  "Twitter Post (16:9)": { width: 1200, height: 675 },
  "Twitter Header (3:1)": { width: 1500, height: 500 },
  "Facebook Cover": { width: 820, height: 312 },
};

type FormatKey = keyof typeof SOCIAL_FORMATS;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] =
    useState<FormatKey>("Instagram (1:1)");
  const [isUploading, setIsUploading] = useState(false);

  const transformedRef = useRef<HTMLImageElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedImage(data.public_id);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Download transformation
  const handleDownload = async () => {
    if (!transformedRef.current) return;

    const response = await fetch(transformedRef.current.src);
    const blob = await response.blob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFormat}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const { width, height } = SOCIAL_FORMATS[selectedFormat];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Image Resize Tool
      </h1>

      {/* Upload */}
      <div className="mb-6">
        <input
          type="file"
          onChange={handleUpload}
          className="file-input file-input-bordered w-full"
        />
        {isUploading && <p className="mt-2">Uploading...</p>}
      </div>

      
      {uploadedImage && (
        <>
          {/* Format selector */}
          <div className="mb-6">
            <select
              value={selectedFormat}
              onChange={(e) =>
                setSelectedFormat(e.target.value as FormatKey)
              }
              className="select select-bordered w-full"
            >
              {Object.keys(SOCIAL_FORMATS).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <h3 className="font-semibold mb-2">Original</h3>
              <CldImage
                src={uploadedImage}
                width={500}
                height={500}
                alt="Original"
              />
            </div>

            {/* Transformed */}
            <div>
              <h3 className="font-semibold mb-2">
                {selectedFormat} ({width}×{height})
              </h3>
              <CldImage
                ref={transformedRef}
                src={uploadedImage}
                width={width}
                height={height}
                crop="fill"
                gravity="auto"
                alt="Transformed"
              />
            </div>
          </div>

         
          <div className="mt-6 text-right">
            <button
              onClick={handleDownload}
              className="btn btn-primary"
            >
              Download
            </button>
          </div>
        </>
      )}
    </div>
  );
}