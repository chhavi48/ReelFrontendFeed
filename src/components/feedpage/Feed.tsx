"use client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import "tailwindcss/tailwind.css";
import {
  FaHeart,
  FaRegHeart,
  FaVolumeMute,
  FaVolumeUp,
  FaShare,
  FaCopy,
} from "react-icons/fa";
import {
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";

interface ReelData {
  id: number;
  videoUrl: string;
  likes: number;
  isLiked: boolean;
}

const Feed: React.FC = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { ref, inView } = useInView(); // Track visibility for infinite scroll
  const [openDialog, setOpenDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const queryClient = useQueryClient();

  const backendUrl  = "https://feed-backend-server.vercel.app"

  const fetchReels = async ({ pageParam = 1 }: { pageParam: number }) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/feed/reels?page=${pageParam}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching reels:", error);
      throw new Error("Unable to fetch reels.");
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: fetchReels,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  // Video autoplay/pause logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.75 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [data?.pages]);

  const handleLike = async (reelId: number, videoIndex: number) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/feed/reels/${reelId}/like`
      );
      if (res.status === 200) {
        const updatedReel = res.data.reel;

        // Update React Query cache
        queryClient.setQueryData(["reels"], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              reels: page.reels.map((r: ReelData) =>
                r.id === reelId
                  ? { ...r, likes: updatedReel.likes, isLiked: true }
                  : r
              ),
            })),
          };
        });
      }
    } catch (error) {
      console.error("Error liking the reel:", error);
    }
  };

  const handleMuteToggle = (videoIndex: number) => {
    const video = videoRefs.current[videoIndex];
    if (video) {
      video.muted = !video.muted;
    }
  };

  const handleShare = (url: string) => {
    setShareUrl(url);
    setOpenDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black text-white">
      {isError && (
        <div className="text-center mt-10 text-red-500">
          <p>Failed to load reels. Please try again later.</p>
          <p>{(error as Error)?.message}</p>
        </div>
      )}

      {data?.pages.map((page, pageIndex) =>
        page.reels.map((el: ReelData, videoIndex: number) => (
          <div
            key={el.id}
            className="relative flex justify-center items-center h-screen w-full snap-center"
          >
            {/* Video */}
            <video
              width={300}
              ref={(el) => (videoRefs.current[videoIndex] = el) as any}
              className="h-full object-cover"
              src={el.videoUrl}
              loop
              muted
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50 pointer-events-none" />

            {/* Mute Button */}
            <div className="absolute bottom-10 left-4 text-white">
              <button
                onClick={() => handleMuteToggle(videoIndex)}
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              >
                {videoRefs.current[videoIndex]?.muted ? (
                  <FaVolumeMute size={20} />
                ) : (
                  <FaVolumeUp size={20} />
                )}
              </button>
            </div>

            {/* Like & Share Buttons */}
            <div className="absolute bottom-10 right-4 text-white space-y-4 flex flex-col items-center">
              {/* Like Button */}
              <button
                onClick={() => handleLike(el.id, videoIndex)}
                className="flex flex-col items-center bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              >
                {el.isLiked ? (
                  <FaHeart size={24} className="text-red-500" />
                ) : (
                  <FaRegHeart size={24} />
                )}
                <span className="text-sm mt-1">{el.likes}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(el.videoUrl)}
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"
              >
                <FaShare size={24} />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Empty State */}
      {!isFetchingNextPage && !data?.pages?.[0]?.reels?.length && (
        <div className="text-center text-gray-500 mt-10">
          <p>No reels available. Please check back later!</p>
        </div>
      )}

      {/* Loading Spinner */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-4">
          <p>Loading more reels...</p>
        </div>
      )}

      <div ref={ref} className="h-10" /> {/* Scroll trigger */}

      {/* Share Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Share this Reel</DialogTitle>
        <DialogContent>
          <div className="flex flex-row gap-2">
            {/* Facebook Share Button */}
            <FacebookShareButton url={shareUrl}>
              <IconButton>
                <Avatar sx={{ bgcolor: "#3b5998" }}>
                  <FacebookIcon size={24} />
                </Avatar>
              </IconButton>
            </FacebookShareButton>

            {/* Twitter Share Button */}
            <TwitterShareButton url={shareUrl}>
              <IconButton>
                <Avatar sx={{ bgcolor: "#1da1f2" }}>
                  <TwitterIcon size={24} />
                </Avatar>
              </IconButton>
            </TwitterShareButton>

            {/* WhatsApp Share Button */}
            <WhatsappShareButton url={shareUrl}>
              <IconButton>
                <Avatar sx={{ bgcolor: "#25D366" }}>
                  <WhatsappIcon size={24} />
                </Avatar>
              </IconButton>
            </WhatsappShareButton>

            {/* Copy Link Button */}
            <IconButton onClick={handleCopyLink}>
              <Avatar sx={{ bgcolor: "#000" }}>
                <FaCopy size={16} />
              </Avatar>
            </IconButton>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};


export default Feed;
