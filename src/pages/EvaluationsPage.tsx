/**
 * Manuscript AI - Evaluation Reports & Model Training Management
 * 
 * Complies with Section 21 & 22 Master Prompt:
 * - Real CER (Character Error Rate) and WER (Word Error Rate) Levenshtein metrics
 * - Fine-tuning jobs queue, logs, and GPU hardware checks
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  Flame,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingDown,
  Terminal,
} from 'lucide-react';
import { evaluationsApi, trainingApi, modelsApi, datasetsApi } from '../api/research.api';
import { EvaluationExperiment, TrainingJob, ModelRegistry, Dataset } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const EvaluationsPage: React.FC = () => {
  const toast = useToast();
  const [evaluations, setEvaluations] = useState<EvaluationExperiment[]>([]);
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New evaluation modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [sampleCount, setSampleCount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchEvaluations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [evalRes, modelRes, dsRes] = await Promise.all([
        evaluationsApi.listEvaluations(),
        modelsApi.listModels(),
        datasetsApi.listDatasets(),
      ]);

      if (evalRes.success && evalRes.data) {
        setEvaluations(evalRes.data);
      }
      if (modelRes.success && modelRes.data) {
        setModels(modelRes.data);
        if (modelRes.data.length > 0) setSelectedModelId(modelRes.data[0].id);
      }
      if (dsRes.success && dsRes.data) {
        setDatasets(dsRes.data);
        if (dsRes.data.length > 0) setSelectedDatasetId(dsRes.data[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری گزارش‌های ارزیابی');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await evaluationsApi.runEvaluation({
        modelId: selectedModelId,
        datasetId: selectedDatasetId,
        sampleCount,
      });

      if (res.success && res.data) {
        setIsModalOpen(false);
        toast.success('آزمون ارزیابی مدل با موفقیت آغاز شد');
        fetchEvaluations();
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در اجرای ارزیابی مدل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            گزارش‌های ارزیابی تجربی مدل‌ها (CER / WER Benchmarks)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            سنجش نرخ خطای نویسه (CER) و نرخ خطای واژه (WER) بر پایه فاصله لون‌اشتاین در نسخ کهن
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Play className="w-4 h-4" />}
        >
          اجرای ارزیابی جدید (Benchmark)
        </Button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchEvaluations} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت داده‌های ارزیابی تجربی..." />
      ) : evaluations.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-10 h-10" />}
          title="ارزیابی انجام نشده است"
          description="هنوز آزمون خطاسنجی بر روی مدل‌های هوش‌مصنوعی در برابر مجموعه داده مرجع ثبت نشده است."
          action={{
            label: 'آغاز اولین ارزیابی',
            onClick: () => setIsModalOpen(true),
            icon: <Play className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Badge variant={ev.language === 'fa' ? 'amber' : 'purple'} size="sm">
                  {ev.language === 'fa' ? 'فارسی' : 'عربی'}
                </Badge>
                <span className="text-[11px] text-stone-400 font-mono">
                  {new Date(ev.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  شناسه مدل: <span className="font-mono text-amber-600">{ev.modelId}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">دادگان: {ev.datasetId}</p>
              </div>

              {/* Metrics Display */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800 text-center">
                <div>
                  <span className="text-[10px] text-stone-400 block">نرخ خطای نویسه (CER):</span>
                  <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {(ev.cer * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">نرخ خطای واژه (WER):</span>
                  <span className="text-lg font-mono font-bold text-sky-600 dark:text-sky-400">
                    {(ev.wer * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-2">
                <span>نمونه‌های آزمون: {ev.sampleCount.toLocaleString('fa-IR')} خط</span>
                <span className="font-mono">میانگین استنتاج: {ev.averageInferenceTimeMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Evaluation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="اجرای ارزیابی رسمی مدل هوش مصنوعی (CER & WER)"
        subtitle="محاسبه خطای بازشناسی در برابر نسخ خطی برچسب‌گذاری شده"
        maxWidth="md"
      >
        <form onSubmit={handleRunEvaluation} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              مدل مورد نظر جهت ارزیابی:
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              مجموعه‌داده آزمون (Test Dataset):
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.sampleCount} نمونه)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              تعداد نمونه‌های مورد ارزیابی:
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              value={sampleCount}
              onChange={(e) => setSampleCount(parseInt(e.target.value, 10) || 100)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              شروع فرآیند خطاسنجی
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const TrainingPage: React.FC = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New training modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [learningRate, setLearningRate] = useState<number>(0.00005);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [epochs, setEpochs] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await trainingApi.listTrainingJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری فرآیندهای آموزش');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleLaunchTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await trainingApi.createTrainingJob({
        baseModelId: 'mdl_trocr_persian_v1',
        datasetId: 'ds_persian_htr_corpus',
        learningRate,
        batchSize,
        epochs,
      });

      if (res.success && res.data) {
        setIsModalOpen(false);
        toast.success('فرآیند آموزش جدید با موفقیت آغاز شد');
        fetchJobs();
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در شروع آموزش مدل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            فرآیندهای آموزش و فاین‌تیونینگ مدل‌های HTR
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مدیریت اجرای چرخه‌های آموزش عمیق ترنسفورمر، تخصیص شتاب‌دهنده گرافیکی (GPU) و مشاهده لاگ‌ها
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Flame className="w-4 h-4" />}
        >
          شروع آموزش جدید (Fine-Tuning)
        </Button>
      </div>

      {/* GPU Hardware Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">پایش سخت‌افزار شتاب‌دهنده هوش مصنوعی (NVIDIA CUDA):</p>
          <p className="opacity-90 leading-relaxed">
            برای اجرای بهینه چرخه‌های ترنسفورمر TrOCR به کارت گرافیک با حداقل ۱۶ گیگابایت VRAM نیاز است. در صورت عدم اتصال GPU سرور فرآیند در صف تعلیق قرار خواهد گرفت.
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchJobs} />}

      {isLoading ? (
        <LoadingSpinner label="در حال فراخوانی صف آموزش مدل‌ها..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Flame className="w-10 h-10" />}
          title="فرآیند آموزشی در جریان نیست"
          description="هنوز درخواست تنظیم دقیقی ثبت نشده است."
          action={{
            label: 'آغاز فرآیند آموزش',
            onClick: () => setIsModalOpen(true),
            icon: <Flame className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <div
              key={j.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                    {j.id}
                  </span>
                  <Badge
                    variant={
                      j.status === 'COMPLETED'
                        ? 'success'
                        : j.status === 'RUNNING'
                        ? 'amber'
                        : 'default'
                    }
                  >
                    {j.status === 'RUNNING'
                      ? 'در حال آموزش...'
                      : j.status === 'COMPLETED'
                      ? 'پایان یافته'
                      : j.status}
                  </Badge>
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  شروع: {new Date(j.createdAt).toLocaleString('fa-IR')}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block">مدل پایه:</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300">{j.baseModelId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">دادگان آموزشی:</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300">{j.datasetId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">نرخ یادگیری (LR):</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300">
                    {j.configuration?.learningRate || '5e-5'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">اندازه بسته / دوره‌ها:</span>
                  <span className="font-mono text-stone-700 dark:text-stone-300">
                    Batch {j.configuration?.batchSize || 16} • {j.configuration?.epochs || 10} Epochs
                  </span>
                </div>
              </div>

              {/* Console Logs */}
              {j.logs && j.logs.length > 0 && (
                <div className="p-3 bg-stone-950 text-stone-300 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto border border-stone-800" dir="ltr">
                  <div className="flex items-center gap-1 text-stone-500 text-[10px] pb-1 border-b border-stone-800">
                    <Terminal className="w-3 h-3" />
                    <span>TRAINING PROCESS LOGS:</span>
                  </div>
                  {j.logs.map((log, idx) => (
                    <div key={idx} className="text-emerald-400/90 leading-tight">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="پیکربندی آموزش مدل TrOCR با تنظیم دقیق"
        subtitle="تخصیص ابرپارامترها و ارسال کار به صف کارگران محاسباتی"
        maxWidth="md"
      >
        <form onSubmit={handleLaunchTraining} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              نرخ یادگیری (Learning Rate):
            </label>
            <input
              type="number"
              step="0.00001"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.00005)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                اندازه بسته (Batch Size):
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 16)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                تعداد دوره‌ها (Epochs):
              </label>
              <input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value, 10) || 15)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              شروع چرخه آموزش
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
