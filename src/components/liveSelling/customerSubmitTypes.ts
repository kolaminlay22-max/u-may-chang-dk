export type LiveSubmissionChannel = "TikTok" | "Facebook";

export type LiveSubmissionStatus =
  | "Submitted"
  | "Reviewing"
  | "Ready"
  | "Completed"
  | "Rejected";

export type CustomerBasketItem = {
  clientItemId: string;

  photoFile?: File;
  photoPreviewUrl: string;
  photoUrl?: string;

  size: string;
  color: string;
  quantity: number;
  note: string;
  address: string;

  productName?: string;
  regularPrice?: number;
  livePrice?: number;
};

export type CustomerSubmissionFormData = {
  customerName: string;
  tiktokUsername: string;
  phone: string;
  channel: LiveSubmissionChannel;
};

export type CustomerLiveSubmission = {
  id?: string;
  submissionReference: string;
  sessionId: string;

  customerName: string;
  tiktokUsername: string;
  phone?: string;
  channel: LiveSubmissionChannel;

  items: CustomerBasketItem[];

  status: LiveSubmissionStatus;
  duplicateWarning: boolean;

  orderNumber?: string;
  total: number;

  createdAt?: unknown;
  updatedAt?: unknown;
};