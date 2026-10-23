/**
 * Manuscript AI - Core API & Domain Type Definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta | null;
  error?: ApiErrorPayload;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export type UserRole = 'ADMIN' | 'RESEARCHER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  language: string;
  description: string | null;
  manuscriptIdentifier: string | null;
  estimatedDate: string | null;
  collectionName: string | null;
  sourceUrl: string | null;
  license: string | null;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
  pageCount?: number;
}

export interface PageLineBox {
  id: string;
  lineNumber: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0..1000
  recognizedText: string;
  confidence: number;
}

export interface ManuscriptPage {
  id: string;
  bookId: string;
  pageNumber: number;
  folioLabel: string | null;
  imageStorageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  imageWidth: number;
  imageHeight: number;
  language: string;
  uploadedById: string;
  lines?: PageLineBox[];
  createdAt: string;
  updatedAt?: string;
  transcription?: Transcription;
}

export type RecognitionMode = 'LINE' | 'FULL_PAGE';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface RecognitionJob {
  id: string;
  pageId: string;
  requestedById: string;
  modelId: string;
  recognitionMode: RecognitionMode;
  status: JobStatus;
  errorCode: string | null;
  errorMessage: string | null;
  submittedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  processingDurationMs: number | null;
}

export type ReviewStatus = 'PENDING_REVIEW' | 'REVIEWED' | 'APPROVED';

export interface Transcription {
  id: string;
  pageId: string;
  recognitionJobId: string | null;
  rawText: string;
  correctedText: string;
  normalizedSearchText: string;
  reviewStatus: ReviewStatus;
  language: string;
  modelId: string | null;
  modelVersion: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionRevision {
  id: string;
  transcriptionId: string;
  revisionNumber: number;
  text: string;
  changedById: string;
  changeSummary: string | null;
  createdAt: string;
  authorName?: string;
}

export interface SearchResult {
  transcriptionId: string;
  pageId: string;
  bookId: string;
  bookTitle: string;
  folioLabel: string;
  snippet: string;
  matchFound: boolean;
  reviewStatus: ReviewStatus;
  language: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalManuscriptPages: number;
  completedRecognitionJobs: number;
  pendingRecognitionJobs: number;
  failedRecognitionJobs: number;
  transcriptionsAwaitingReview: number;
  approvedTranscriptions: number;
  registeredDatasetSamples: number;
  availableModels: number;
  recentActivity?: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }>;
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  language: string;
  source: string | null;
  license: string | null;
  manifestLocation: string;
  manifestChecksum: string;
  status: string;
  sampleCount: number;
  createdById?: string;
  createdAt: string;
}

export interface ManifestValidationResult {
  isValid: boolean;
  totalRows: number;
  splitCounts: {
    TRAIN: number;
    VAL: number;
    TEST: number;
    UNKNOWN: number;
  };
  errorCount: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export interface ModelRegistry {
  id: string;
  name: string;
  version: string;
  baseModelId: string | null;
  providerType: 'mock' | 'pretrained' | 'finetuned';
  supportedLanguages: string[];
  supportedModes: RecognitionMode[];
  artifactLocation: string | null;
  license: string;
  status: 'ACTIVE' | 'INITIALIZING' | 'ERROR' | 'OFFLINE';
  isAvailable: boolean;
  createdAt: string;
}

export interface EvaluationExperiment {
  id: string;
  modelId: string;
  datasetId: string;
  language: string;
  sampleCount: number;
  cer: number; // 0.0 - 1.0 (Character Error Rate)
  wer: number; // 0.0 - 1.0 (Word Error Rate)
  averageInferenceTimeMs: number;
  configuration: Record<string, any>;
  createdAt: string;
}

export interface TrainingJob {
  id: string;
  baseModelId: string;
  datasetId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  configuration: Record<string, any>;
  logLocation: string | null;
  outputArtifactLocation: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  logs?: string[];
  createdAt: string;
}

export interface ReviewFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  component: string;
  currentImplementation: string;
  recommendedSolution: string;
  estimatedGain: string;
}

export interface SystemReviewReport {
  repository: string;
  analyzedAt: string;
  overallScore: number;
  architecture: {
    framework: string;
    containerization: string;
    storage: string;
    auth: string;
  };
  bottlenecks: ReviewFinding[];
}
