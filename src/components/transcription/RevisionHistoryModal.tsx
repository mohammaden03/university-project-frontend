/**
 * Manuscript AI - Revision History Modal
 * 
 * Displays:
 * - Revision sequence and author
 * - Exact timestamp
 * - Change summary rationale
 * - Historical text inspection
 */

import React, { useState } from 'react';
import { History, Clock, User, ArrowRightLeft, Check } from 'lucide-react';
import { TranscriptionRevision } from '../../api/types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: TranscriptionRevision[];
  currentText: string;
  onRestore?: (text: string) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  revisions,
  currentText,
  onRestore,
}) => {
  const [selectedRevision, setSelectedRevision] = useState<TranscriptionRevision | null>(
    revisions.length > 0 ? revisions[revisions.length - 1] : null
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تاریخچه ویرایش‌ها و بازبینی‌های نسخه"
      subtitle="رهگیری درخت تغییرات و انطباق با نسخ مرجع"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-stone-500">
            تعداد ویرایش‌های ثبت شده: {revisions.length.toLocaleString('fa-IR')}
          </span>
          <div className="flex gap-2">
            {onRestore && selectedRevision && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRestore(selectedRevision.text);
                  onClose();
                }}
              >
                جایگزینی این نسخه در ویرایشگر
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              بستن
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revision List */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 max-h-96 overflow-y-auto">
          {revisions.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500">
              هنوز ویرایشی برای این بازنویسی ثبت نشده است.
            </div>
          ) : (
            revisions.map((rev) => {
              const isSelected = selectedRevision?.id === rev.id;
              return (
                <button
                  key={rev.id}
                  onClick={() => setSelectedRevision(rev)}
                  className={`w-full text-right p-3 transition-colors flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-r-2 border-amber-600'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ویرایش #{rev.revisionNumber.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
                    {rev.changeSummary || 'اصلاح متن بازنویسی'}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Revision View */}
        <div className="md:col-span-2 border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex flex-col bg-stone-50/50 dark:bg-stone-900/50">
          {selectedRevision ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3 text-xs">
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>پژوهشگر: {selectedRevision.authorName || 'پژوهشگر سامانه'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(selectedRevision.createdAt).toLocaleString('fa-IR')}</span>
                </div>
              </div>

              {selectedRevision.changeSummary && (
                <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold ml-1">توضیح مصحح:</span>
                  {selectedRevision.changeSummary}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                  متن ثبت شده در این ویرایش:
                </label>
                <div className="font-manuscript text-base p-4 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl leading-relaxed whitespace-pre-wrap select-text text-stone-900 dark:text-stone-100">
                  {selectedRevision.text}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-stone-500">
              یک نسخه را از لیست سمت راست برای بررسی انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
