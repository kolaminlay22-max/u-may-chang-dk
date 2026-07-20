import {
  doc,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase";

export async function generateOrderNumber() {
  const today = new Date();

  const date =
    String(today.getDate()).padStart(2, "0") +
    String(today.getMonth() + 1).padStart(2, "0") +
    today.getFullYear();

  const counterRef = doc(db, "counters", date);

  const orderNumber = await runTransaction(
    db,
    async (transaction) => {
      const counterDoc =
        await transaction.get(counterRef);

      let count = 1;

      if (counterDoc.exists()) {
        count = counterDoc.data().count + 1;
      }

      transaction.set(
        counterRef,
        {
          count,
        },
        {
          merge: true,
        }
      );

      return `UMC${date}${String(count).padStart(
        3,
        "0"
      )}`;
    }
  );

  return orderNumber;
}