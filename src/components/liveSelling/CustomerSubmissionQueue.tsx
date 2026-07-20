import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

type CustomerSubmission = {
  id: string;

  fullName?: string;
  tiktokName?: string;
  customerName?: string;
tiktokUsername?: string;
comment?: string;
  phone?: string;

  address?: string;
  city?: string;
  note?: string;

  status?: string;
  createdAt?: any;
  items?: unknown[];
};

type ApprovedLiveCustomer = {
    
  id: string;
  queueNumber: number;
  name: string;
  phone: string;
  tiktokUsername: string;
  comment: string;
  address: string;
city: string;
  submittedItems?: unknown[];
  status: "waiting" | "active" | "completed";
};

type CustomerSubmissionQueueProps = {
  onApprove: (
    customer: ApprovedLiveCustomer
  ) => Promise<void> | void;
};

function CustomerSubmissionQueue({
  onApprove,
}: CustomerSubmissionQueueProps) {
  const [submissions, setSubmissions] = useState<
    CustomerSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(
    null
  );

  useEffect(() => {
 const submissionsQuery = query(
  collection(db, "customerSubmissions"),
  where("status", "==", "waiting"),
  orderBy("createdAt", "asc")
);

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
  const submissionData = snapshot.docs
  .map(
    (document) =>
      ({
        id: document.id,
        ...document.data(),
      } as CustomerSubmission)
  )
  .filter((submission) => submission.status === "waiting");

console.log("Submission Data:", submissionData);

setSubmissions(submissionData);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Failed to load customer submissions:",
          error
        );
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleApprove = async (
    submission: CustomerSubmission
  ) => {
    if (approvingId) return;

    setApprovingId(submission.id);

    try {
      const liveCustomersSnapshot = await getDocs(
        collection(db, "liveCustomers")
      );

      const highestQueueNumber = liveCustomersSnapshot.docs.reduce(
        (highest, customerDocument) => {
          const queueNumber = Number(
            customerDocument.data().queueNumber || 0
          );

          return Math.max(highest, queueNumber);
        },
        0
      );

      const queueNumber = highestQueueNumber + 1;

     const customerName =
  submission.fullName?.trim() ||
  submission.tiktokName?.replace(/^@/, "").trim() ||
  submission.customerName?.trim() ||
  submission.tiktokUsername?.replace(/^@/, "").trim() ||
  "TikTok Customer";
      const newCustomerDocument = await addDoc(
        collection(db, "liveCustomers"),
        {
          queueNumber,
          name: customerName,
          phone: submission.phone?.trim() || "",
          tiktokUsername:
            submission.tiktokUsername?.trim() || "",
          comment:
            submission.note?.trim() ||
            submission.comment?.trim() ||
            "",
  address: submission.address?.trim() || "",
city: submission.city?.trim() || "",
          status: "waiting",
          source: "customer-submit",
          submissionId: submission.id,
          submittedItems: Array.isArray(submission.items)
            ? submission.items
            : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      await updateDoc(
       doc(db, "customerSubmissions", submission.id),
        {
          status: "approved",
          approvedAt: serverTimestamp(),
          liveCustomerId: newCustomerDocument.id,
        }
      );

      const approvedCustomer: ApprovedLiveCustomer = {
  id: newCustomerDocument.id,
  queueNumber,
  name: customerName,
  phone: submission.phone?.trim() || "",
  tiktokUsername:
    submission.tiktokUsername?.trim() || "",
  comment:
    submission.note?.trim() ||
    submission.comment?.trim() ||
    "",
    address: submission.address?.trim() || "",
city: submission.city?.trim() || "",
  submittedItems: Array.isArray(submission.items)
    ? submission.items
    : [],
  status: "waiting",
};

      await onApprove(approvedCustomer);
    } catch (error) {
      console.error(
        "Failed to approve customer submission:",
        error
      );

      alert(
        "Customer submission could not be approved. Please try again."
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="customer-submission-queue">
      <h2>Customer Submission Queue</h2>

      {loading && <p>Loading submissions...</p>}

      {!loading && submissions.length === 0 && (
        <p>No pending customer submissions.</p>
      )}

      {!loading &&
        submissions.map((submission) => (
          <article key={submission.id}>
            <h3>
              {
  submission.fullName ||
  submission.tiktokName ||
  submission.customerName ||
  submission.tiktokUsername ||
  "Unknown TikTok customer"
}
            </h3>

            <p>{submission.phone || "No phone number"}</p>
            <p>
  <strong>Address:</strong>{" "}
  {submission.address || "No address provided"}
</p>

<p>
  <strong>City / Township:</strong>{" "}
  {submission.city || "No city provided"}
</p>

<p>
  <strong>Customer Note:</strong>{" "}
  {submission.note || submission.comment || "No note"}
</p>

            <p>
              Basket items:{" "}
              {Array.isArray(submission.items)
                ? submission.items.length
                : 0}
            </p>

            <span>{submission.status || "pending"}</span>

            <button
              type="button"
              disabled={approvingId === submission.id}
              onClick={() => handleApprove(submission)}
            >
              {approvingId === submission.id
                ? "Approving..."
                : "Approve"}
            </button>
          </article>
        ))}
    </section>
  );
}

export default CustomerSubmissionQueue;