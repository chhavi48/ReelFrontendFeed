"use client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { VideosData } from "./interface";

const PexelsVideos = () => {
  const { ref, inView } = useInView();
  const fetxhPexels = async ({ pageParam }: { pageParam: number }) => {
    const res = await axios(
      `https://api.pexels.com/videos/search/?query=background&orientation=portrait&page=${pageParam}&per_page=15`,
      {
        method: "get",
        headers: {
          Authorization:
            "563492ad6f91700001000001980875b3467043a1911854ad83c1bc4d",
        },
      }
    );
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["pexel"],
    queryFn: fetxhPexels,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.videos.length ? allPages.length + 1 : undefined;
      return nextPage;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  interface Page {
    videos: VideosData[];
  }

  return (
    <div className=" h-[80%]">
      {data?.pages.map((el: Page) => el.videos)[0].length === 0 ? (
        <>Error</>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-2">
          {data?.pages.map(
            (page: Page) =>
              Array.isArray(page.videos) &&
              page.videos.map((el) => (
                <React.Fragment key={el.id}>
                  <video src={el.video_files[0].link}></video>
                </React.Fragment>
              ))
          )}

          <div ref={ref}></div>
        </div>
      )}
    </div>
  );
};

export default PexelsVideos;
