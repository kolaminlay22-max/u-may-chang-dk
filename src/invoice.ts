import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export const generateInvoice = (order: any) => {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("U-May Chang Invoice", 14, 20);

  pdf.setFontSize(11);
  pdf.text(`Invoice No: INV-${order.orderNumber || order.id}`, 14, 32);
  pdf.text(`Order No: ${order.orderNumber || order.id}`, 14, 40);
  pdf.text(`Customer: ${order.userName || "-"}`, 14, 48);
  pdf.text(`Email: ${order.userEmail || "-"}`, 14, 56);
  pdf.text(`Date: ${order.orderDate || "-"}`, 14, 64);
  pdf.text(`Time: ${order.orderTime || "-"}`, 14, 72);
  pdf.text(
    `Payment: ${order.paymentMethod || "Cash on Delivery"}`,
    14,
    80
  );

  autoTable(pdf, {
    startY: 90,
    head: [["Product", "Quantity", "Price"]],
    body:
      order.items?.map((item: any) => [
        item.name,
        item.quantity,
      item.price,
      ]) || [],
  });

  const finalY = (pdf as any).lastAutoTable.finalY || 110;

  pdf.setFontSize(14);
  pdf.text(`Total: ${order.total} Baht`, 14, finalY + 15);

  pdf.save(`invoice-${order.orderNumber || order.id}.pdf`);
};