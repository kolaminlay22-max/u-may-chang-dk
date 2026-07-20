import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { CustomerPhotoItem } from "../types/customerSubmission";
import { generateOrderNumber } from "../utils/generateOrderNumber";
export type CreateCustomerSubmissionInput = {
  fullName: string;
  tiktokName: string;
  phone: string;
  address: string;
  city?: string;
  note?: string;
  items: CustomerPhotoItem[];
};

export async function createCustomerSubmission(
  input: CreateCustomerSubmissionInput
) {
  const orderNumber = await generateOrderNumber();
  const submissionReference = await addDoc(
    collection(db, "customerSubmissions"),
    {
      submissionId: `SUB-${Date.now()}`,
      orderNumber: orderNumber, 

      fullName: input.fullName.trim(),
      tiktokName: input.tiktokName.trim(),
      phone: input.phone.trim(),

      address: input.address.trim(),
      city: input.city?.trim() || "",
      note: input.note?.trim() || "",

      items: input.items,

      status: "waiting",
      channel: "tiktok",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return submissionReference.id;
}