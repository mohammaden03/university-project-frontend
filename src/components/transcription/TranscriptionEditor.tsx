/**
 * Manuscript AI - Academic Transcription Editor
 * 
 * Complies with:
 * - Section 16 & 17 Master Prompt requirements
 * - Optimistic concurrency with expectedVersion & conflict detection
 * - Persian/Arabic typography and RTL textarea
 * - Approval workflow & review statuses
 */

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  Clock,
  History,
  AlertCircle,
  FileText,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Transcription, TranscriptionRevision } from '../../api/types';
import { transcriptionsApi } from '../../api/transcriptions.api';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RevisionHistoryModal } from './RevisionHistoryModal';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export interface TranscriptionEditorProps {
  transcription: Transcription;
  onSaved?: (updated: Transcription) => void;
  canEdit?: boolean;
  canApprove?: boolean;
}

export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  transcription,
  onSaved,
  canEdit = true,
  canApprove = true,
}) => {
  const toast = useToast();
  const [correctedText, setCorrectedText] = useState<string>(transcription.correctedText);
  const [changeSummary, setChangeSummary] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'raw' | 'diff'>('editor');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [revisions, setRevisions] = useState<TranscriptionRevision[]>([]);
  const [conflictError, setConflictError] = useState<{ message: string; serverTranscription?: Transcription } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Detect unsaved edits
  const hasUnsavedChanges = correctedText !== transcription.correctedText;

  // Sync state when incoming transcription changes
  useEffect(() => {
    setCorrectedText(transcription.correctedText);
    setChangeSummary('');
    setConflictError(null);
  }, [transcription.id, transcription.version]);

  // Load revisions when history modal opens
  const handleOpenHistory = async () => {
    try {
      const res = await transcriptionsApi.getRevisions(transcription.id);
      if (res.success && res.data) {
        setRevisions(res.data);
      }
    } catch (e) {
      console.warn('Failed loading revisions:', e);
    }
    setShowHistory(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    setConflictError(null);
    try {
      const res = await transcriptionsApi.updateTranscription(transcription.id, {
        correctedText,
        changeSummary: changeSummary.trim() || 'ویرایش و تصحیح بازنویسی',
        expectedVersion: transcription.version,
      });

      if (res.success && res.data) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        onSaved?.(res.data);
        toast.success('بازنویسی نسخه با موفقیت ذخیره شد');
      }
    } catch (err: any) {
      if (err?.statusCode === 409 || err?.code === 'CONFLICT') {
        // Fetch fresh transcription to show user conflict details
        try {
          const fresh = await transcriptionsApi.getTranscription(transcription.id);
          setConflictError({
            message: err.message,
            serverTranscription: fresh.data,
          });
        } catch {
          setConflictError({ message: err.message });
        }
      } else {
        toast.error(err?.message || 'خطا در ذخیره‌سازی بازنویسی');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await transcriptionsApi.approveTranscription(transcription.id);
      if (res.success && res.data) {
        onSaved?.(res.data);
        toast.success('بازنویسی نسخه با موفقیت تایید نهایی گردید');
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در تایید نهایی بازنویسی');
    } finally {
      setIsApproving(false);
    }
  };

  const reviewStatusBadge = {
    APPROVED: { label: 'تایید نهایی شده', variant: 'success' as const },
    REVIEWED: { label: 'بررسی شده', variant: 'info' as const },
    PENDING_REVIEW: { label: 'در انتظار بازبینی', variant: 'warning' as const },
  }[transcription.reviewStatus];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col gap-4 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Badge variant={reviewStatusBadge.variant}>{reviewStatusBadge.label}</Badge>
          <span className="text-xs text-stone-500 font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
            نسخه #{transcription.version.toLocaleString('fa-IR')}
          </span>
          {transcription.modelId && (
            <span className="hidden sm:inline-flex text-xs text-stone-500 items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              مدل: {transcription.modelId}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenHistory}
            leftIcon={<History className="w-4 h-4" />}
          >
            تاریخچه ({transcription.version})
          </Button>

          {canApprove && transcription.reviewStatus !== 'APPROVED' && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isApproving}
              onClick={handleApprove}
              leftIcon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
            >
              تایید رسمی
            </Button>
          )}

          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              disabled={!hasUnsavedChanges}
              isLoading={isSaving}
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              ذخیره تغییرات
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'editor'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          ویرایش متن مصحح
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'raw'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          خروجی خام مدل هوش مصنوعی (Raw)
        </button>
      </div>

      {/* Unsaved indicator */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between text-xs p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>شما تغییراتی اعمال کرده‌اید که هنوز ذخیره نشده‌اند.</span>
          </div>
          <button
            onClick={() => setCorrectedText(transcription.correctedText)}
            className="flex items-center gap-1 hover:underline text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            بازگردانی
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="text-xs p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>تغییرات با موفقیت در پایگاه داده ثبت و نسخه جدید ایجاد شد.</span>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'editor' ? (
        <div className="space-y-3">
          <textarea
            value={correctedText}
            onChange={(e) => setCorrectedText(e.target.value)}
            disabled={!canEdit}
            rows={10}
            dir="rtl"
            placeholder="متن بازنویسی شده را در این بخش تصحیح یا وارد نمایید..."
            className="w-full font-manuscript text-base sm:text-lg leading-loose p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-y"
          />

          {canEdit && hasUnsavedChanges && (
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                توضیح تغییرات مصحح (برای ثبت در درخت ویرایش):
              </label>
              <input
                type="text"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="مثال: تصحیح رسم‌الخط کلمات بر اساس نسخه خطی آستان قدس..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950 font-manuscript text-base sm:text-lg leading-loose text-stone-700 dark:text-stone-300 whitespace-pre-wrap select-all">
            {transcription.rawText || 'خروجی خامی برای این صفحه موجود نیست.'}
          </div>
          <p className="text-[11px] text-stone-400">
            * خروجی خام مدل هوش مصنوعی جهت حفظ اصالت استنادی بدون تغییر نگهداری می‌شود.
          </p>
        </div>
      )}

      {/* Optimistic Concurrency Conflict Dialog */}
      {conflictError && (
        <Modal
          isOpen={true}
          onClose={() => setConflictError(null)}
          title="تداخل همزمانی در ذخیره بازنویسی"
          subtitle="همزمان پژوهشگر دیگری نسخه جدیدتری از این صفحه را ثبت نموده است"
          maxWidth="lg"
          footer={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (conflictError.serverTranscription) {
                    setCorrectedText(conflictError.serverTranscription.correctedText);
                    onSaved?.(conflictError.serverTranscription);
                  }
                  setConflictError(null);
                }}
              >
                پذیرش نسخه سرور
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleSave()}>
                ثبت مجدد و بازنویسی
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              {conflictError.message}
            </p>
            {conflictError.serverTranscription && (
              <div>
                <span className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  متن ذخیره شده فعلی در سرور:
                </span>
                <div className="p-3 bg-stone-100 dark:bg-stone-950 rounded-lg font-manuscript text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {conflictError.serverTranscription.correctedText}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Revision History Modal */}
      <RevisionHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        revisions={revisions}
        currentText={correctedText}
        onRestore={(text) => {
          setCorrectedText(text);
        }}
      />
    </div>
  );
};
