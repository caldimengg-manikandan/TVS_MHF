import { useRequestStore } from '../stores/requestStore';
import { MHFRequest, RequestStatus } from '../types/request';

export class RequestService {
  static async getAll(): Promise<MHFRequest[]> {
    return useRequestStore.getState().requests;
  }

  static async createRequest(data: Omit<MHFRequest, 'id' | 'status'>): Promise<MHFRequest> {
    const state = useRequestStore.getState();
    const newRequest: MHFRequest = {
      ...data,
      id: `REQ-${new Date().getFullYear()}-${String(state.requests.length + 1).padStart(4, '0')}`,
      status: 'Assembly'
    };
    
    state.addRequest(newRequest);
    return newRequest;
  }

  static async updateStatus(id: string, status: RequestStatus, user?: string): Promise<void> {
    const updates: Partial<MHFRequest> = { status };
    if (status === 'Issue') {
      updates.issuedBy = user;
    } else if (status === 'Close') {
      updates.closedBy = user;
    }
    useRequestStore.getState().updateRequest(id, updates);
  }
}
