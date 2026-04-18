"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import dayjs from "dayjs";
import { Video } from "@prisma/client";

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (videoUrl: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // ✅ Safe values
  const originalSize = Number(video.originalSize) || 0;
  const compressedSize = Number(video.compressedSize) || 0;

  // ✅ Correct compression %
  const compressionPercentage =
    originalSize > 0
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  // 🎯 Thumbnail
  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []);

  // 🎯 Full video
  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  // 🎯 Preview video
  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: [
        "e_preview:duration_15:max_seg_9:min_seg_dur_1",
      ],
    });
  }, []);

  const formatSize = useCallback((size: number) => filesize(size), []);

  const formatDuration = useCallback((seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isHovered) setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🎬 Preview */}
      <figure className="aspect-video relative overflow-hidden">
        {isHovered ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-red-500 text-sm">
                Preview not available
              </p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
          <Clock size={14} className="mr-1" />
          {video.duration
            ? formatDuration(video.duration)
            : "0:00"}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition flex items-center justify-center">
          <p className="text-white text-sm">Preview</p>
        </div>
      </figure>

      {/* 📦 Content */}
      <div className="card-body p-4">
        {/* Title */}
        <h2 className="card-title text-lg font-bold line-clamp-1">
          {video.title}
        </h2>

        {/* Description */}
        <p className="text-sm opacity-70 line-clamp-2">
          {video.description}
        </p>

        {/* Time */}
        <p className="text-xs opacity-50">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>

        {/* Sizes */}
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div className="flex items-center">
            <FileUp size={16} className="mr-2 text-primary" />
            <div>
              <div className="font-semibold">Original</div>
              <div>{formatSize(originalSize)}</div>
            </div>
          </div>

          <div className="flex items-center">
            <FileDown size={16} className="mr-2 text-secondary" />
            <div>
              <div className="font-semibold">Compressed</div>
              <div>{formatSize(compressedSize)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold">
            Compression:{" "}
            <span
              className={
                compressionPercentage > 50
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {compressionPercentage}%
            </span>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              onDownload(
                getFullVideoUrl(video.publicId),
                video.title
              )
            }
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;