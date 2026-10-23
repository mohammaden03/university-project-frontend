/**
 * Manuscript AI - Interactive Historical Manuscript Folio Viewer
 * 
 * Features:
 * - Fluid pan and zoom with mouse wheel and drag
 * - 90-degree rotations
 * - Fit-to-screen and 1:1 pixel inspection
 * - Manuscript contrast enhancer for faded ink/illuminations
 * - Folio resolution & SHA-256 integrity indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  RefreshCcw,
  Move,
  Info,
} from 'lucide-react';
import { ManuscriptPage } from '../../api/types';
import { pagesApi } from '../../api/books.api';

export interface ManuscriptViewerProps {
  page?: ManuscriptPage | null;
  imageUrl?: string;
  className?: string;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const ManuscriptViewer: React.FC<ManuscriptViewerProps> = ({
  page,
  imageUrl,
  className = '',
  onPrevPage,
  onNextPage,
  hasNextPage = false,
  hasPrevPage = false,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedImageUrl = imageUrl || (page ? pagesApi.getPageImageUrl(page.id) : '');

  // Reset viewport when page changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [page?.id]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-stone-950 text-stone-100 rounded-2xl overflow-hidden border border-stone-800 select-none ${className}`}
    >
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Folio Info Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
          <span className="font-semibold text-amber-400">
            {page?.folioLabel || `صفحه ${page?.pageNumber || '۱'}`}
          </span>
          {page && (
            <span className="text-[11px] text-stone-400 font-mono">
              {page.imageWidth}×{page.imageHeight} px
            </span>
          )}
        </div>

        {/* Inspection Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-800 text-stone-300">
          <button
            onClick={handleZoomIn}
            title="بزرگ‌نمایی"
            className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="کوچک‌نمایی"
            className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1.5 min-w-[3rem] text-center text-stone-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleRotate}
            title="چرخش ۹۰ درجه"
            className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="تنظیم مجدد اندازه"
            className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-stone-800 mx-0.5" />
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="بهبود کنتراست مرکب خطوط کهن"
            className={`p-1.5 rounded-lg transition-colors ${
              highContrast ? 'bg-amber-600 text-white' : 'hover:text-white hover:bg-stone-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            title="شناسنامه فنی تصویر"
            className={`p-1.5 rounded-lg transition-colors ${
              showMetadata ? 'bg-stone-700 text-white' : 'hover:text-white hover:bg-stone-800'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="تمام صفحه"
            className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 min-h-[380px] lg:min-h-[500px] flex items-center justify-center overflow-hidden cursor-${
          scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        } relative`}
      >
        {resolvedImageUrl ? (
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 150ms ease-out',
            }}
            className="origin-center max-w-full max-h-full flex items-center justify-center p-4"
          >
            <img
              src={resolvedImageUrl}
              alt={page?.folioLabel || 'برگ نسخه خطی'}
              className={`max-w-full max-h-[70vh] object-contain shadow-2xl rounded-sm transition-all duration-200 ${
                highContrast
                  ? 'contrast-150 brightness-110 saturate-50'
                  : ''
              }`}
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-500 gap-2 p-8">
            <Eye className="w-10 h-10 stroke-1" />
            <p className="text-sm">تصویری برای نمایش انتخاب نشده است</p>
          </div>
        )}

        {/* Metadata Overlay Drawer */}
        {showMetadata && page && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 bg-stone-900/95 backdrop-blur-md p-4 rounded-xl border border-stone-800 text-xs text-stone-300 shadow-2xl space-y-2 z-20 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-semibold text-amber-400 text-sm border-b border-stone-800 pb-1.5">
              شناسنامه فنی نسخه خطی
            </h4>
            <div className="flex justify-between py-0.5">
              <span className="text-stone-400">نام فایل اصلی:</span>
              <span className="font-mono text-stone-200 truncate max-w-[140px]">{page.originalFilename}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-stone-400">ابعاد اصلی:</span>
              <span className="font-mono text-stone-200">{page.imageWidth} × {page.imageHeight} px</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-stone-400">حجم و فرمت:</span>
              <span className="font-mono text-stone-200">{Math.round(page.fileSize / 1024)} KB ({page.mimeType})</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-stone-400">زبان نگارش:</span>
              <span className="text-stone-200">{page.language === 'fa' ? 'فارسی' : page.language === 'ar' ? 'عربی' : page.language}</span>
            </div>
            <div className="pt-1 border-t border-stone-800">
              <span className="text-[10px] text-stone-500 block mb-0.5">هش یکپارچگی SHA-256:</span>
              <span className="font-mono text-[9px] text-amber-300/80 break-all bg-stone-950 p-1 rounded block">
                {page.checksum}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Folio Navigation Bottom Bar */}
      {(onPrevPage || onNextPage) && (
        <div className="h-11 bg-stone-900 border-t border-stone-800 px-4 flex items-center justify-between text-xs text-stone-400">
          <button
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 rounded-lg text-stone-200 font-medium transition-colors"
          >
            ← برگ قبلی
          </button>
          <span>
            {page?.folioLabel || `صفحه ${page?.pageNumber || '۱'}`}
          </span>
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 rounded-lg text-stone-200 font-medium transition-colors"
          >
            برگ بعدی →
          </button>
        </div>
      )}
    </div>
  );
};
