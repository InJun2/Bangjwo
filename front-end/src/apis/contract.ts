import { useQuery, useMutation } from '@tanstack/react-query'
import axiosInstance from '../utils/axiosInstances'
import { ContractFormData } from '../features/contract/components/Contract';
import { UpdateLandlordInfoDto } from '../features/contract/data/contract.dto';

interface FinalizeContractResponse {
    success: boolean;
    message: string;
  }

export function useCreateContract() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post('/api/v1/contract', data).then(res => res.data),
  })
}

export function useVerifyContract() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.patch('/api/v1/contract/verify', data).then(res => res.data),
  })
}

export function useGetTenantInfo() {
  return useQuery({
    queryKey: ['tenantInfo'],
    queryFn: () =>
      axiosInstance.get('/api/v1/contract/tenant').then(res => res.data),
  })
}

export function useSaveTenantInfo() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.patch('/api/v1/contract/tenant', data).then(res => res.data),
  })
}

export function useUploadTenantSignature() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      axiosInstance.patch('/api/v1/contract/tenant/signature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data),
  })
}

export function useFinalizeTenantContract() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.patch('/api/v1/contract/tenant/final', data).then(res => res.data),
  })
}

export function useGetLandlordInfo() {
  return useQuery({
    queryKey: ['landlordInfo'],
    queryFn: () =>
      axiosInstance.get('/api/v1/contract/landlord').then(res => res.data),
  })
}

export function useSaveLandlordInfo() {
    return useMutation<unknown, unknown, ContractFormData>({
      mutationFn: (data) =>
        axiosInstance.patch('/api/v1/contract/landlord', data).then(res => res.data),
    });
  }

export function useUploadLandlordSignature() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      axiosInstance.patch('/api/v1/contract/landlord/signatures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data),
  })
}

export function useFinalizeLandlordContract() {
    return useMutation<FinalizeContractResponse, Error, UpdateLandlordInfoDto>({
      mutationFn: (data) =>
        axiosInstance.patch("/api/v1/contract/landlord/final", data).then(res => res.data),
    });
  }

export function useUpdateLandlordAfterTenant() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.patch('/api/v1/contract/landlord/final/after-tenant', data).then(res => res.data),
  })
}

export function useCompleteContract() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.patch('/api/v1/contract/complete', data).then(res => res.data),
  })
}

export function useGetContractById(contractId: string) {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () =>
      axiosInstance.get(`/api/v1/contract/${contractId}`).then(res => res.data),
    enabled: !!contractId,
  })
}

export function useGetContractStatus() {
  return useQuery({
    queryKey: ['contractStatus'],
    queryFn: () =>
      axiosInstance.get('/api/v1/contract/status').then(res => res.data),
  })
}

export function useGetContractDetail() {
  return useQuery({
    queryKey: ['contractDetail'],
    queryFn: () =>
      axiosInstance.get('/api/v1/contract/detail').then(res => res.data),
  })
}
