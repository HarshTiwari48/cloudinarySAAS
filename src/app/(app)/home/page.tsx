"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "@/components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await axios.get("/api/videos");
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = title;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Videos</h1>
        <p className="text-gray-500">
          Compressed videos powered by Cloudinary
        </p>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="text-center mt-20 text-gray-500">
          No videos uploaded yet
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video: any) => (
          <VideoCard
            key={video.id}
            video={video}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}