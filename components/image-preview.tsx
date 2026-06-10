/* eslint-disable @next/next/no-img-element */
"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImagePreviewProps = {
  src: string;
  alt: string;
  thumbnailClassName?: string;
  className?: string;
};

export function ImagePreview({ src, alt, thumbnailClassName, className }: ImagePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn("block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
          aria-label={`Ver ${alt}`}
        >
          <img src={src} alt={alt} className={cn("h-24 w-full object-cover", thumbnailClassName)} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(96vw,56rem)] gap-0 border-0 bg-transparent p-2 shadow-none ring-0 sm:max-w-4xl" showCloseButton>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img src={src} alt={alt} className="max-h-[85vh] w-full rounded-xl object-contain" />
      </DialogContent>
    </Dialog>
  );
}
