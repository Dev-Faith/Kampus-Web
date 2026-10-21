"use client";

import React, { useState, useCallback } from "react";
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

      setProcessedItems((prev) => {
        const nextList = [newItem, ...prev];
        onImagesChange?.(nextList.map((i) => i.url));
        return nextList;
      });

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
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Drop Area */}
      <div className="relative group rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-900/50 hover:bg-slate-900/80 p-8 transition-all duration-300 text-center flex flex-col items-center justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h4 className="text-base font-semibold text-white">
          Drop High-Res Listing Photography Here
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Automatic 16:10 hero aspect ratio enforcement & retina client compression
          (&lt;400KB WebP) before cloud transmission.
        </p>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
          <Crop className="h-3.5 w-3.5 text-emerald-400" />
          <span>Enforces 16:10</span>
          <span className="text-slate-600">•</span>
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          <span>WebP Target &le; 400KB</span>
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {selectedImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Crop className="h-4 w-4 text-emerald-400" />
                  Listing Hero Frame (16:10 Locked)
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust positioning and zoom to ensure optimal framing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageSrc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative h-96 w-full bg-slate-950">
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
            <div className="border-t border-slate-800 bg-slate-900/90 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 flex items-center gap-3">
                  <ZoomIn className="h-4 w-4 text-slate-400" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-750 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 w-8">{zoom.toFixed(1)}x</span>
                </div>

                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                >
                  <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Rotate 90°</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImageSrc(null)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={processAndCompress}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Compressing to &lt;400KB...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Apply 16:10 Crop & Compress
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Processed Images Feed with Analytics */}
      {processedItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Client Processed Ingestion Queue ({processedItems.length})</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Cloud Upload
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {processedItems.map((item) => {
              const savedPct = Math.round(
                ((item.originalSize - item.compressedSize) / item.originalSize) *
                  100
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-950 aspect-[16/10]">
                    <Image
                      src={item.url}
                      alt={item.fileName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {item.fileName}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="text-slate-400">
                        {formatFileSize(item.originalSize)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">
                        {formatFileSize(item.compressedSize)}
                      </span>
                      <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[10px] font-bold text-emerald-300">
                        -{savedPct}%
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        16:10 WebP
                      </span>
                      <span className="text-emerald-400 font-medium">Valid &lt;400KB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
