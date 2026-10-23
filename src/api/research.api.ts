/**
 * Manuscript AI - Research, Models, Datasets, Evaluations & Review API
 */

import { apiRequest } from './client';
import {
  ApiResponse,
  DashboardStats,
  Dataset,
  EvaluationExperiment,
  ManifestValidationResult,
  ModelRegistry,
  SearchResult,
  SystemReviewReport,
  TrainingJob,
} from './types';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>({
      url: '/dashboard/stats',
      method: 'GET',
    });
  },
};

export const searchApi = {
  search: async (params: {
    q: string;
    bookId?: string;
    language?: string;
    reviewStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResult[]>> => {
    return apiRequest<SearchResult[]>({
      url: '/search',
      method: 'GET',
      params,
    });
  },
};

export const datasetsApi = {
  listDatasets: async (): Promise<ApiResponse<Dataset[]>> => {
    return apiRequest<Dataset[]>({
      url: '/datasets',
      method: 'GET',
    });
  },

  validateManifest: async (manifestCsv: string): Promise<ApiResponse<ManifestValidationResult>> => {
    return apiRequest<ManifestValidationResult>({
      url: '/datasets/validate',
      method: 'POST',
      data: { manifestCsv },
    });
  },
};

export const modelsApi = {
  listModels: async (): Promise<ApiResponse<ModelRegistry[]>> => {
    return apiRequest<ModelRegistry[]>({
      url: '/models',
      method: 'GET',
    });
  },
};

export const evaluationsApi = {
  listEvaluations: async (): Promise<ApiResponse<EvaluationExperiment[]>> => {
    return apiRequest<EvaluationExperiment[]>({
      url: '/evaluations',
      method: 'GET',
    });
  },

  runEvaluation: async (data: {
    modelId: string;
    datasetId?: string;
    sampleCount?: number;
  }): Promise<ApiResponse<EvaluationExperiment>> => {
    return apiRequest<EvaluationExperiment>({
      url: '/evaluations',
      method: 'POST',
      data,
    });
  },
};

export const trainingApi = {
  listTrainingJobs: async (): Promise<ApiResponse<TrainingJob[]>> => {
    return apiRequest<TrainingJob[]>({
      url: '/training-jobs',
      method: 'GET',
    });
  },

  createTrainingJob: async (data: {
    baseModelId: string;
    datasetId?: string;
    learningRate?: number;
    batchSize?: number;
    epochs?: number;
  }): Promise<ApiResponse<TrainingJob>> => {
    return apiRequest<TrainingJob>({
      url: '/training-jobs',
      method: 'POST',
      data,
    });
  },
};

export const reviewApi = {
  getFindings: async (): Promise<ApiResponse<SystemReviewReport>> => {
    return apiRequest<SystemReviewReport>({
      url: '/review/findings',
      method: 'GET',
    });
  },
};
