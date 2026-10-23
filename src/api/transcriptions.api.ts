/**
 * Manuscript AI - Recognition & Transcriptions API Modules
 */

import { apiRequest } from './client';
import {
  ApiResponse,
  RecognitionJob,
  RecognitionMode,
  Transcription,
  TranscriptionRevision,
} from './types';

export const recognitionApi = {
  startRecognitionJob: async (
    pageId: string,
    options: {
      modelId: string;
      recognitionMode: RecognitionMode;
    }
  ): Promise<ApiResponse<RecognitionJob>> => {
    return apiRequest<RecognitionJob>({
      url: `/pages/${pageId}/recognition-jobs`,
      method: 'POST',
      data: options,
    });
  },

  getRecognitionJob: async (jobId: string): Promise<ApiResponse<RecognitionJob>> => {
    return apiRequest<RecognitionJob>({
      url: `/recognition-jobs/${jobId}`,
      method: 'GET',
    });
  },

  cancelRecognitionJob: async (jobId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>({
      url: `/recognition-jobs/${jobId}/cancel`,
      method: 'POST',
    });
  },

  listRecognitionJobs: async (): Promise<ApiResponse<RecognitionJob[]>> => {
    return apiRequest<RecognitionJob[]>({
      url: '/recognition-jobs',
      method: 'GET',
    });
  },
};

export const transcriptionsApi = {
  getPageTranscriptions: async (pageId: string): Promise<ApiResponse<Transcription[]>> => {
    return apiRequest<Transcription[]>({
      url: `/pages/${pageId}/transcriptions`,
      method: 'GET',
    });
  },

  getTranscription: async (id: string): Promise<ApiResponse<Transcription>> => {
    return apiRequest<Transcription>({
      url: `/transcriptions/${id}`,
      method: 'GET',
    });
  },

  updateTranscription: async (
    id: string,
    data: {
      correctedText: string;
      changeSummary?: string;
      expectedVersion: number;
    }
  ): Promise<ApiResponse<Transcription>> => {
    return apiRequest<Transcription>({
      url: `/transcriptions/${id}`,
      method: 'PATCH',
      data,
    });
  },

  getRevisions: async (transcriptionId: string): Promise<ApiResponse<TranscriptionRevision[]>> => {
    return apiRequest<TranscriptionRevision[]>({
      url: `/transcriptions/${transcriptionId}/revisions`,
      method: 'GET',
    });
  },

  approveTranscription: async (id: string): Promise<ApiResponse<Transcription>> => {
    return apiRequest<Transcription>({
      url: `/transcriptions/${id}/approve`,
      method: 'POST',
    });
  },
};
