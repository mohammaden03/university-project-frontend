/**
 * Manuscript AI - Datasets & Manifest Validation Page
 * 
 * Complies with Section 19 Master Prompt:
 * - Dataset list, sample counts, split info
 * - CSV manifest validation workflow (valid rows, invalid rows, missing files, split counts)
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { datasetsApi } from '../api/research.api';
import { Dataset, ManifestValidationResult } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Manifest validation state
  const [isValidateModalOpen, setIsValidateModalOpen] = useState<boolean>(false);
  const [manifestCsv, setManifestCsv] = useState<string>(
    `sample_id,image_path,transcription,split,language\nsmp_01,images/line_01.jpg,به نام خداوند جان و خرد,TRAIN,fa\nsmp_02,images/line_02.jpg,کزین برتر اندیشه برنگذرد,TRAIN,fa\nsmp_03,images/line_03.jpg,خداوند نام و خداوند جای,VAL,fa`
  );
  const [validationResult, setValidationResult] = useState<ManifestValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const fetchDatasets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await datasetsApi.listDatasets();
      if (res.success && res.data) {
        setDatasets(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری مجموعه‌داده‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleValidateManifest = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await datasetsApi.validateManifest(manifestCsv);
      if (res.success && res.data) {
        setValidationResult(res.data);
      }
    } catch (err: any) {
      alert(err?.message || 'خطا در اعتبارسنجی مانیفست');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            مدیریت دادگان و پایگاه‌های یادگیری HTR
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مجموعه‌داده‌های برچسب‌گذاری‌شده نسخ کهن، مانیفست‌های تقسیم‌بندی (Train/Val/Test) و ارزیابی
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsValidateModalOpen(true)}
          leftIcon={<FileCheck className="w-4 h-4" />}
        >
          اعتبارسنجی فایل مانیفست (CSV)
        </Button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchDatasets} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت مجموعه‌داده‌ها..." />
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={<Database className="w-10 h-10" />}
          title="مجموعه‌داده‌ای ثبت نشده است"
          description="پیش از اجرای فاین‌تیونینگ و آموزش مدل‌های جدید، لازم است یک مجموعه‌داده برچسب‌گذاری‌شده اضافه شود."
          action={{
            label: 'اعتبارسنجی مانیفست CSV',
            onClick: () => setIsValidateModalOpen(true),
            icon: <FileCheck className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={ds.language === 'fa' ? 'amber' : 'purple'} size="sm">
                    {ds.language === 'fa' ? 'فارسی' : ds.language === 'ar' ? 'عربی' : ds.language}
                  </Badge>
                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mt-2">
                    {ds.name}
                  </h3>
                  <span className="font-mono text-xs text-stone-400">{ds.id}</span>
                </div>

                <Badge variant={ds.status === 'READY' ? 'success' : 'warning'}>
                  {ds.status === 'READY' ? 'آماده آموزش' : ds.status}
                </Badge>
              </div>

              {ds.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {ds.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-stone-100 dark:border-stone-800 pt-3">
                <div>
                  <span className="text-stone-400 block">تعداد نمونه‌های متنی:</span>
                  <span className="font-bold font-mono text-stone-800 dark:text-stone-200">
                    {ds.sampleCount.toLocaleString('fa-IR')} خط / برگ
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">مجوز داده‌ها:</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300">
                    {ds.license || 'Academic Open Access'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 font-mono bg-stone-50 dark:bg-stone-950 p-2 rounded-lg truncate">
                مانیفست: {ds.manifestLocation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manifest Validation Modal */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title="اعتبارسنجی ساختار مانیفست مجموعه‌داده (CSV Validator)"
        subtitle="بررسی تطبیق ستون‌ها، مسیر تصاویر، عدم تکرار شناسه‌ها و توزیع داده‌ها"
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsValidateModalOpen(false)}>
              بستن
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isValidating}
              onClick={handleValidateManifest}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              اعتبارسنجی مانیفست
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              محتوای فایل CSV مانیفست:
            </label>
            <textarea
              value={manifestCsv}
              onChange={(e) => setManifestCsv(e.target.value)}
              rows={8}
              dir="ltr"
              className="w-full font-mono text-[11px] p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              ستون‌های الزامی: sample_id, image_path, transcription, split (TRAIN/VAL/TEST), language
            </p>
          </div>

          {/* Validation Result Box */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                validationResult.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {validationResult.isValid
                    ? 'فایل مانیفست کاملاً معتبر و سازگار با استاندارد HTR است.'
                    : 'خطاهایی در ساختار مانیفست یافت شد.'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div>
                  <span className="block opacity-75">کل ردیف‌ها:</span>
                  <span className="font-mono font-bold">{validationResult.totalRows}</span>
                </div>
                <div>
                  <span className="block opacity-75">آموزش (TRAIN):</span>
                  <span className="font-mono font-bold">{validationResult.splitCounts.TRAIN}</span>
                </div>
                <div>
                  <span className="block opacity-75">ارزیابی (VAL):</span>
                  <span className="font-mono font-bold">{validationResult.splitCounts.VAL}</span>
                </div>
                <div>
                  <span className="block opacity-75">آزمون (TEST):</span>
                  <span className="font-mono font-bold">{validationResult.splitCounts.TEST}</span>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-800">
                  <span className="font-semibold block mb-1">فهرست خطاهای ردیف‌ها:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationResult.errors.map((e, idx) => (
                      <li key={idx}>
                        ردیف {e.row}: {e.message} ({e.field})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await datasetsApi.listDatasets(); // fallback check
      // Fetch models via researchApi
      const mRes = await import('../api/research.api').then((m) => m.modelsApi.listModels());
      if (mRes.success && mRes.data) {
        setModels(mRes.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری رجیستری مدل‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-600" />
          رجیستری مدل‌های هوش‌مصنوعی و بازشناسی خط (HTR Model Registry)
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          کاتالوگ مدل‌های بینایی-زبانی ترنسفورمر، وضعیت در دسترس بودن وزن‌ها و مجوزهای استنتاج
        </p>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchModels} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت فهرست مدل‌ها..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {models.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 hover:border-amber-500/50 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
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
                      ? 'پیش‌آموخته (Pretrained)'
                      : m.providerType === 'finetuned'
                      ? 'تنظیم دقیق (Fine-Tuned)'
                      : 'شبیه‌ساز (Mock Demo)'}
                  </Badge>
                  <span className="font-mono text-xs text-stone-400">{m.version}</span>
                </div>

                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {m.name}
                </h3>
                <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 block mt-0.5">
                  {m.id}
                </span>

                <div className="mt-3 space-y-1 text-xs text-stone-600 dark:text-stone-400">
                  <p>زبان‌های پشتیبانی شده: {m.supportedLanguages?.join('، ') || 'fa'}</p>
                  <p>حالت‌های قطعه‌بندی: {m.supportedModes?.join('، ') || 'FULL_PAGE, LINE'}</p>
                  <p>مجوز انتشار: <span className="font-mono">{m.license}</span></p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">وضعیت در سرور:</span>
                <Badge variant={m.isAvailable ? 'success' : 'danger'} size="sm">
                  {m.isAvailable ? 'آماده استنتاج' : 'غیرفعال (نیازمند وزن‌ها)'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
