export type CustomerSubmissionStatus =
  | "waiting"
  | "processing"
  | "completed"
  | "cancelled";

export type CustomerPhotoItem = {
  id: string;

  imageUrl: string;
  file?: File;
  imagePath?: string;

  size: string;
  quantity: number;

  color: string;
  customColor?: string;

  productName?: string;
  livePrice?: number;
};

export type CustomerSubmission = {
  id?: string;

  submissionId: string;
  orderNumber: string;

  // Customer Info
  fullName: string;
  tiktokName: string;
  phone: string;

  // Shipping
  address: string;
  city?: string;
  note?: string;

  // Basket
  items: CustomerPhotoItem[];

  // Status
  status: CustomerSubmissionStatus;
  channel: "tiktok";

  createdAt?: unknown;
  updatedAt?: unknown;

  liveOrderId?: string;
};