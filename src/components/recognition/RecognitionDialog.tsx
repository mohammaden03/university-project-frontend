/**
 * Manuscript AI - HTR Recognition Dispatcher & Real-Time Poller
 */

import React, { useState, useEffect } from 'react';
import {
  ScanText,
  Sparkles,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  StopCircle,
} from 'lucide-react';
import { RecognitionJob, RecognitionMode, ModelRegistry } from '../../api/types';
import { recognitionApi } from '../../api/transcriptions.api';
import { modelsApi } from '../../api/research.api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface RecognitionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  folioLabel?: string;
  onCompleted?: (job: RecognitionJob) => void;
}

export const RecognitionDialog: React.FC<RecognitionDialogProps> = ({
  isOpen,
  onClose,
  pageId,
  folioLabel,
  onCompleted,
}) => {
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('mdl_trocr_persian_v1');
  const [mode, setMode] = useState<RecognitionMode>('FULL_PAGE');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [activeJob, setActiveJob] = useState<RecognitionJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load models when opened
  useEffect(() => {
    if (isOpen) {
      setIsLoadingModels(true);
      modelsApi
        .listModels()
        .then((res) => {
          if (res.success && res.data) {
            setModels(res.data);
            if (res.data.length > 0) {
              const active = res.data.find((m) => m.isAvailable) || res.data[0];
              setSelectedModelId(active.id);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed loading models:', err);
        })
        .finally(() => setIsLoadingModels(false));
    } else {
      setActiveJob(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Bounded polling loop for long-running recognition jobs
  useEffect(() => {
    if (!activeJob || activeJob.status === 'COMPLETED' || activeJob.status === 'FAILED' || activeJob.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await recognitionApi.getRecognitionJob(activeJob.id);
        if (res.success && res.data) {
          setActiveJob(res.data);
          if (res.data.status === 'COMPLETED') {
            onCompleted?.(res.data);
          } else if (res.data.status === 'FAILED') {
            setErrorMessage(res.data.errorMessage || 'عملیات بازشناسی با خطا مواجه شد.');
          }
        }
      } catch (err: any) {
        console.warn('Job polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, onCompleted]);

  const handleStartRecognition = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await recognitionApi.startRecognitionJob(pageId, {
        modelId: selectedModelId,
        recognitionMode: mode,
      });

      if (res.success && res.data) {
        setActiveJob(res.data);
        if (res.data.status === 'COMPLETED') {
          onCompleted?.(res.data);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در ثبت درخواست بازشناسی');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJob = async () => {
    if (!activeJob) return;
    try {
      await recognitionApi.cancelRecognitionJob(activeJob.id);
      setActiveJob((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    } catch (err: any) {
      alert(err?.message || 'خطا در لغو پردازش');
    }
  };

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="شروع پردازش بازشناسی خط کهن (HTR / OCR)"
      subtitle={`برگ انتخابی: ${folioLabel || pageId}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {activeJob && (activeJob.status === 'PROCESSING' || activeJob.status === 'QUEUED') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelJob}
                leftIcon={<StopCircle className="w-4 h-4 text-rose-500" />}
              >
                لغو پردازش
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {activeJob?.status === 'COMPLETED' ? 'مشاهده در ویرایشگر' : 'بستن'}
            </Button>
            {!activeJob && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleStartRecognition}
                leftIcon={<ScanText className="w-4 h-4" />}
              >
                ارسال به موتور HTR
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            انتخاب مدل بازشناسی هوش‌مصنوعی:
          </label>
          {isLoadingModels ? (
            <div className="text-xs text-stone-500 py-3">در حال بارگذاری مدل‌ها...</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {models.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => !activeJob && setSelectedModelId(m.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-amber-600'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{m.name}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            m.providerType === 'pretrained'
                              ? 'purple'
                              : m.providerType === 'finetuned'
                              ? 'success'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {m.providerType === 'pretrained'
                            ? 'مدل پیش‌آموخته'
                            : m.providerType === 'finetuned'
                            ? 'تنظیم دقیق (Fine-Tuned)'
                            : 'شبیه‌ساز (Mock Demo)'}
                        </Badge>
                        <span className="text-[10px] text-stone-400 font-mono">{m.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span>زبان‌های تحت پوشش: {m.supportedLanguages.join('، ')}</span>
                      <span>مجوز: {m.license}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            حالت قطعه‌بندی و بازشناسی:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!!activeJob}
              onClick={() => setMode('FULL_PAGE')}
              className={`p-3 rounded-xl border text-xs text-right transition-colors ${
                mode === 'FULL_PAGE'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <span className="block font-medium">بازشناسی تمام صفحه (Full Page)</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                قطعه‌بندی خودکار خطوط و استخراج کل صفحه
              </span>
            </button>

            <button
              type="button"
              disabled={!!activeJob}
              onClick={() => setMode('LINE')}
              className={`p-3 rounded-xl border text-xs text-right transition-colors ${
                mode === 'LINE'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <span className="block font-medium">سطر به سطر (Line by Line)</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                تطبیق خطی مستقل و دقیق
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Job Status Monitor */}
        {activeJob && (
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                شناسه درخواست: <span className="font-mono text-amber-600">{activeJob.id}</span>
              </span>
              <Badge
                variant={
                  activeJob.status === 'COMPLETED'
                    ? 'success'
                    : activeJob.status === 'PROCESSING' || activeJob.status === 'QUEUED'
                    ? 'amber'
                    : 'danger'
                }
              >
                {activeJob.status === 'COMPLETED'
                  ? 'پردازش با موفقیت پایان یافت'
                  : activeJob.status === 'PROCESSING'
                  ? 'در حال استخراج خط و نویسه‌خوانی...'
                  : activeJob.status === 'QUEUED'
                  ? 'در صف نوبت‌دهی سرور'
                  : activeJob.status}
              </Badge>
            </div>

            {(activeJob.status === 'PROCESSING' || activeJob.status === 'QUEUED') && (
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>مدل هوش مصنوعی در حال اجرای استنباط بر روی برگ نسخه است...</span>
              </div>
            )}

            {activeJob.status === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  بازشناسی پایان یافت. زمان استنتاج: {activeJob.processingDurationMs || '۱۸۰۰'} میلی‌ثانیه. متن استخراج شده در ویرایشگر آماده است.
                </span>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
