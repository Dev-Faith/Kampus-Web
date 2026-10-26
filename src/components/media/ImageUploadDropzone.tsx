"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import {
  UploadCloud,
  Crop,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  ZoomIn,
  Sliders,
  X,
  FileCheck,
  Trash2,
} from "lucide-react";
import { getCroppedImg } from "@/lib/crop-image";
import { Button } from "@/components/ui/button";

interface UploadedMediaItem {
  id: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  fileName: string;
  aspectRatio: string;
}

export interface ImageUploadDropzoneProps {
  onImagesChange?: (urls: string[]) => void;
}

export function ImageUploadDropzone({ onImagesChange }: ImageUploadDropzoneProps = {}) {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState<UploadedMediaItem[]>([]);

  // Synchronize processed item URLs to parent outside of render cycle
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onImagesChange?.(processedItems.map((i) => i.url));
  }, [processedItems, onImagesChange]);

  const onDropFile = useCallback((file: File) => {
    setRawFile(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSelectedImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDropFile(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleRemoveItem = (id: string) => {
    setProcessedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const processAndCompress = async () => {
    if (!selectedImageSrc || !croppedAreaPixels || !rawFile) return;

    try {
      setIsProcessing(true);

      // Step 1: 16:10 Canvas Crop
      const croppedFile = await getCroppedImg(
        selectedImageSrc,
        croppedAreaPixels,
        rotation
      );

      // Step 2: Strict Client-Side Compression to <= 400KB WebP
      const compressionOptions = {
        maxSizeMB: 0.39, // Target <= 400KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFile = await imageCompression(
        croppedFile,
        compressionOptions
      );

      const objectUrl = URL.createObjectURL(compressedFile);

      const newItem: UploadedMediaItem = {
        id: `upload-${Date.now()}`,
        originalSize: rawFile.size,
        compressedSize: compressedFile.size,
        url: objectUrl,
        fileName: rawFile.name,
        aspectRatio: "16:10",
      };

      // Pure state update without calling parent setState inside reducer
      setProcessedItems((prev) => [newItem, ...prev]);

      // Reset Modal State
      setSelectedImageSrc(null);
      setRawFile(null);
      setZoom(1);
      setRotation(0);
    } catch (error) {
      console.error("Image processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0KB";
    const k = 1024;
    if (bytes < k * k) {
      return `${Math.round(bytes / k)}KB`;
    }
    return `${(bytes / (k * k)).toFixed(1)}MB`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Upload Drop Area */}
      <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8d2c7] bg-white p-6 text-center transition-colors duration-200 hover:border-[#c45b37] hover:bg-[#f6f3ed] dark:border-[#39443d] dark:bg-[#1c241f] dark:hover:border-[#c45b37] dark:hover:bg-[#202722]">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e3ded4] bg-[#eeece6] text-[#c45b37] transition-transform group-hover:scale-[1.03] dark:border-[#39443d] dark:bg-[#252c27]">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Drop Lodge Photos Here, or Browse
        </h4>
        <p className="mt-0.5 max-w-sm text-[11px] text-slate-600 dark:text-[#a6afa8]">
          Automatic 16:10 aspect ratio crop & WebP retina compression (&le;400KB)
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-full border border-[#e3ded4] bg-[#f6f3ed] px-3 py-1 text-[10px] font-medium text-slate-600 dark:border-[#39443d] dark:bg-[#171d19] dark:text-[#a6afa8]">
          <Crop className="h-3 w-3 text-[#c45b37]" />
          <span>16:10 Ratio</span>
          <span className="text-[#3A4D43]">•</span>
          <Sliders className="h-3 w-3 text-[#c45b37]" />
          <span>Auto WebP Compression</span>
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {selectedImageSrc && (
        <div className="kampus-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="kampus-modal relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="kampus-crop-title">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-[#303832]">
              <div>
                <h3 id="kampus-crop-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Crop className="h-4 w-4 text-[#c45b37]" />
                  Crop Photo (16:10 Frame)
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-[#a6afa8]">
                  Drag to frame your room before compression
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageSrc(null)}
                aria-label="Close image cropper"
                className="kampus-modal-close rounded-full p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative h-80 sm:h-96 w-full bg-black">
              <Cropper
                image={selectedImageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={16 / 10}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls Bar */}
            <div className="space-y-3 border-t border-slate-200 bg-[#eeece6] px-5 py-3.5 dark:border-[#303832] dark:bg-[#171d19]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-2.5">
                  <ZoomIn className="h-4 w-4 text-slate-500 dark:text-[#a6afa8]" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg accent-[#c45b37]"
                  />
                  <span className="w-7 text-[11px] text-slate-600 dark:text-[#a6afa8]">{zoom.toFixed(1)}x</span>
                </div>

                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors hover:bg-slate-50 dark:border-[#39443d] dark:bg-[#202722] dark:text-[#f4f1ea] dark:hover:bg-[#29312b]"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#c45b37]" />
                  <span>Rotate</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImageSrc(null)}
                  className="rounded-full border-slate-300 text-slate-700 hover:text-slate-950 text-xs dark:border-[#39443d] dark:text-[#c1c8c2] dark:hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={processAndCompress}
                  disabled={isProcessing}
                  className="editorial-action rounded-full text-xs font-semibold"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Compressing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4" />
                      Save & Optimize
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Photos Queue */}
      {processedItems.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-bold text-white">
              Uploaded Photos ({processedItems.length})
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Ready for listing</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {processedItems.map((item) => {
              const savedPct = Math.round(
                ((item.originalSize - item.compressedSize) / item.originalSize) * 100
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#22352B] bg-[#121E18] p-2.5 shadow-sm hover:border-[#344E40] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0B130F] border border-[#22352B]/60 aspect-[16/10]">
                    <Image
                      src={item.url}
                      alt={item.fileName}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {item.fileName}
                    </p>

                    {/* Compression metric in single non-wrapping line */}
                    <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                      <span className="text-[#93A89D]">
                        {formatFileSize(item.originalSize)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-400">
                        {formatFileSize(item.compressedSize)}
                      </span>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                        -{savedPct}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#93A89D]">
                      <span className="bg-[#0B130F] border border-[#22352B] px-1.5 py-0.5 rounded text-[9px] text-emerald-300 font-medium">
                        16:10 WebP
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 rounded-lg text-[#93A89D] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors shrink-0"
                    title="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
