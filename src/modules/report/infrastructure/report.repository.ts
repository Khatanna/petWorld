import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Visit } from "@/modules/visit/domain/visit.model";
import type moment from "moment";

interface Bill {
  userUid: string;
  concept: string;
  amount: number;
  date: moment.Moment;
}

interface User {
  id: string;
  name: string;
}

// Función para cargar imagen como base64
const loadImage = async (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = path;
  });
};

// Función para agrupar datos por fecha
const groupByDate = <T extends { date: moment.Moment }>(
  items: T[],
): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {};
  items.forEach((item) => {
    const key = item.date.format("DD/MM/YYYY");
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  return grouped;
};

// Función para calcular totales
const getTotalBathed = (visits: Visit[]): number => {
  return visits.filter((v) => Boolean(v.bathed)).length;
};

const getTotalChoped = (visits: Visit[]): number => {
  return visits.filter((v) => Boolean(v.choped)).length;
};

const getTotalBrushed = (visits: Visit[]): number => {
  return visits.filter((v) => Boolean(v.brushed)).length;
};

const getBillsTotalAmount = (bills: Bill[]): number => {
  return bills.reduce((acc, bill) => acc + bill.amount, 0);
};

export const generateReportOfAll = async (
  visits: Visit[],
  mapUsers: Record<string, User>,
  bills: Bill[],
  tenantId: string,
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Cargar logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadImage(`/src/core/assets/logo.png`);
  } catch (error) {
    console.warn("No se pudo cargar el logo:", error);
  }

  const appName = tenantId === "CH0001" ? "Can Hijos" : "Puro Amor Arte Canino";

  // Agrupar visitas y gastos por fecha
  const groupedVisits = groupByDate<Visit>(visits);
  const groupedBills = groupByDate(bills);

  let isFirstPage = true;

  Object.entries(groupedVisits).forEach(([date, dayVisits], pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
    }

    let yPosition = 15;

    // Header (solo en la primera página)
    if (isFirstPage) {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, yPosition, 15, 15);
      }
      doc.setFontSize(16);
      doc.text(`Peluqueria: ${appName}`, 270, yPosition + 8, {
        align: "right",
      });
      yPosition += 25;
      isFirstPage = false;
    }

    // Fecha
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Fecha: ${date}`, 15, yPosition);
    yPosition += 10;

    // Tabla de Visitas
    doc.setFontSize(10);
    doc.text("Visitas", 15, yPosition);
    yPosition += 5;

    const visitsTableData = dayVisits.map((visit, index) => {
      const bathedName =
        visit.bathed && visit.bathed?.userUid
          ? mapUsers[visit.bathed.userUid]?.name || "N/A"
          : "N/A";
      const chopedName =
        visit.choped && visit.choped?.userUid
          ? mapUsers[visit.choped.userUid]?.name || "N/A"
          : "N/A";
      const brushedName =
        visit.brushed && visit.brushed?.userUid
          ? mapUsers[visit.brushed.userUid]?.name || "N/A"
          : "N/A";

      const totalCashPayments =
        visit.payments
          ?.filter((p) => p.method === "EFECTIVO")
          .reduce((acc, p) => acc + p.amount, 0) ?? 0;

      const totalQrPayments =
        visit.payments
          ?.filter((p) => p.method === "QR")
          .reduce((acc, p) => acc + p.amount, 0) ?? 0;

      return [
        (index + 1).toString(),
        visit.petName,
        visit.race,
        visit.color,
        visit.ownerName,
        chopedName,
        bathedName,
        brushedName,
        visit.price.toFixed(2),
        `${totalCashPayments} Bs.`,
        `${totalQrPayments} Bs.`,
      ];
    });

    // Fila de totales
    const totalPrice = dayVisits.reduce((acc, v) => acc + v.price, 0);
    const totalCash = dayVisits.reduce(
      (acc, v) =>
        acc +
        (v.payments
          ?.filter((p) => p.method === "EFECTIVO")
          .reduce((pAcc, p) => pAcc + p.amount, 0) ?? 0),
      0,
    );
    const totalQr = dayVisits.reduce(
      (acc, v) =>
        acc +
        (v.payments
          ?.filter((p) => p.method === "QR")
          .reduce((pAcc, p) => pAcc + p.amount, 0) ?? 0),
      0,
    );

    visitsTableData.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `${totalPrice.toFixed(2)} Bs.`,
      `${totalCash} Bs.`,
      `${totalQr} Bs.`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          "Nro.",
          "Mascota",
          "Raza",
          "Color",
          "Dueño",
          "Corte",
          "Baño",
          "Cepillado",
          "Costo",
          "Efectivo",
          "QR",
        ],
      ],
      body: visitsTableData,
      theme: "grid",
      headStyles: { fillColor: [255, 200, 150], textColor: 0, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        8: { halign: "center" },
        9: { halign: "center" },
        10: { halign: "center" },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Tabla de Gastos
    if (groupedBills[date]) {
      doc.text("Gastos", 15, yPosition);
      yPosition += 5;

      const billsTableData = groupedBills[date].map((bill) => [
        mapUsers[bill.userUid]?.name || "N/A",
        bill.concept,
        bill.amount.toString(),
        bill.date.format("HH:mmA"),
      ]);

      const billsTotal = getBillsTotalAmount(groupedBills[date]);
      billsTableData.push(["Total", "", `${billsTotal} Bs.`, ""]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Usuario", "Concepto", "Monto", "Hora"]],
        body: billsTableData,
        theme: "grid",
        headStyles: { fillColor: [255, 200, 150], textColor: 0, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          2: { halign: "center" },
          3: { halign: "center" },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Tabla de Trabajos Realizados
    doc.text("Trabajos realizados", 15, yPosition);
    yPosition += 5;

    console.log(Object.values(mapUsers));
    const workTableData = Object.values(mapUsers)
      .map((user) => {
        const totalBathed = dayVisits.filter(
          (v) => v.bathed && v.bathed?.userUid === user.id,
        ).length;
        const totalChoped = dayVisits.filter(
          (v) => v.choped && v.choped?.userUid === user.id,
        ).length;
        const totalBrushed = dayVisits.filter(
          (v) => v.brushed && v.brushed?.userUid === user.id,
        ).length;

        if (totalBathed === 0 && totalChoped === 0 && totalBrushed === 0) {
          return null;
        }

        return [
          user.name,
          totalBathed.toString(),
          totalChoped.toString(),
          totalBrushed.toString(),
        ];
      })
      .filter((row) => row !== null);

    workTableData.push([
      "Total",
      getTotalBathed(dayVisits).toString(),
      getTotalChoped(dayVisits).toString(),
      getTotalBrushed(dayVisits).toString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Usuario", "Baños", "Cortes", "Cepillados"]],
      body: workTableData,
      theme: "grid",
      headStyles: { fillColor: [255, 200, 150], textColor: 0, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Tablas finales (trabajos después de las 3PM y resumen financiero)
    const specialUserId = "87HaSzqB34VDwk3GislJvbYWgDB3";
    const specialUserName = mapUsers[specialUserId]?.name || "N/A";

    const chopedAfter3PM = dayVisits.filter(
      (v) =>
        v.choped &&
        v.choped?.userUid === specialUserId &&
        v.choped?.date &&
        new Date(v.choped.date).getHours() >= 15,
    ).length;

    const bathedAfter3PM = dayVisits.filter(
      (v) =>
        v.bathed &&
        v.bathed?.userUid === specialUserId &&
        v.bathed?.date &&
        new Date(v.bathed.date).getHours() >= 15,
    ).length;

    // Tabla izquierda (trabajos después de 3PM)
    autoTable(doc, {
      startY: yPosition,
      body: [
        [`Cortes después de las 3PM: ${specialUserName}`],
        [chopedAfter3PM.toString()],
        [`Baños después de las 3PM: ${specialUserName}`],
        [bathedAfter3PM.toString()],
      ],
      theme: "grid",
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 150 },
    });

    // Tabla derecha (resumen financiero)
    const dayBillsTotal = groupedBills[date]
      ? getBillsTotalAmount(groupedBills[date])
      : 0;
    const subtotal = totalCash + totalQr;
    const finalTotal = subtotal - dayBillsTotal;

    autoTable(doc, {
      startY: yPosition,
      body: [
        ["Total Efectivo", `${totalCash} Bs.`],
        ["Total QR", `${totalQr} Bs.`],
        ["Subtotal", `${subtotal} Bs.`],
        ["Gastos", `${dayBillsTotal} Bs.`],
        ["Total", `${finalTotal} Bs.`],
      ],
      theme: "grid",
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        1: { halign: "center" },
      },
      margin: { left: 150 },
    });
  });

  // Descargar PDF
  doc.save("Reporte.pdf");
};

export const generateByMonth = async (
  visits: Visit[],
  mapUsers: Record<string, User>,
  bills: Bill[],
  tenantId: string,
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Cargar logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadImage(`/src/core/assets/logo.png`);
  } catch (error) {
    console.warn("No se pudo cargar el logo:", error);
  }

  const appName = tenantId === "CH0001" ? "Can Hijos" : "Puro Amor Arte Canino";

  let yPosition = 15;

  // Header con logo y nombre
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, yPosition, 15, 15);
  }
  doc.setFontSize(16);
  doc.text(`Peluqueria: ${appName}`, 270, yPosition + 8, { align: "right" });
  yPosition += 25;

  // Título del reporte
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Reporte de ${visits[0]?.date.format("MMMM")}`, 15, yPosition);
  yPosition += 10;

  // Tabla de Trabajos Realizados por Usuario
  const workTableData = Object.values(mapUsers)
    .map((user) => {
      const totalBathed = visits.filter(
        (v) => v.bathed && v.bathed?.userUid === user.id,
      ).length;
      const totalChoped = visits.filter(
        (v) => v.choped && v.choped?.userUid === user.id,
      ).length;
      const totalBrushed = visits.filter(
        (v) => v.brushed && v.brushed?.userUid === user.id,
      ).length;

      if (totalBathed === 0 && totalChoped === 0 && totalBrushed === 0) {
        return null;
      }

      return [
        user.name,
        totalBathed.toString(),
        totalChoped.toString(),
        totalBrushed.toString(),
      ];
    })
    .filter((row) => row !== null);

  workTableData.push([
    "Total",
    getTotalBathed(visits).toString(),
    getTotalChoped(visits).toString(),
    getTotalBrushed(visits).toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Usuario", "Baños", "Cortes", "Cepillados"]],
    body: workTableData,
    theme: "grid",
    headStyles: { fillColor: [255, 200, 150], textColor: 0, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Tabla de Resumen Financiero (alineada a la derecha)
  const totalPrice = visits.reduce((acc, v) => acc + v.price, 0);
  const totalCash = visits.reduce(
    (acc, v) =>
      acc +
      (v.payments
        ?.filter((p) => p.method === "EFECTIVO")
        .reduce((pAcc, p) => pAcc + p.amount, 0) ?? 0),
    0,
  );
  const totalQr = visits.reduce(
    (acc, v) =>
      acc +
      (v.payments
        ?.filter((p) => p.method === "QR")
        .reduce((pAcc, p) => pAcc + p.amount, 0) ?? 0),
    0,
  );
  const billsTotal = getBillsTotalAmount(bills);
  const subtotal = totalCash + totalQr;
  const finalTotal = subtotal - billsTotal;

  const summaryTableData = [
    ["Total mascotas", `${visits.length} Mascotas`],
    ["Precio total registrado", `${totalPrice.toFixed(2)} Bs.`],
    ["Total Efectivo", `${totalCash} Bs.`],
    ["Total QR", `${totalQr} Bs.`],
    ["Subtotal", `${subtotal} Bs.`],
    ["Gastos", `${billsTotal} Bs.`],
    ["Total", `${finalTotal} Bs.`],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: summaryTableData,
    theme: "grid",
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "left", cellWidth: 60 },
      1: { halign: "center", cellWidth: 50 },
    },
    margin: { left: 180 }, // Alinear a la derecha
  });

  // Descargar PDF con nombre formateado
  const fileName = `Reporte-${visits[0]?.date.format("MMMM-YYYY")}.pdf`;
  doc.save(fileName);
};

export const generateRateReport = async (visits: Visit[], tenantId: string) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Cargar logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadImage(`/src/core/assets/logo.png`);
  } catch (error) {
    console.warn("No se pudo cargar el logo:", error);
  }

  const appName = tenantId === "CH0001" ? "Can Hijos" : "Puro Amor Arte Canino";

  let yPosition = 15;

  // Header con logo y nombre
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, yPosition, 15, 15);
  }
  doc.setFontSize(16);
  doc.text(`Peluqueria: ${appName}`, 200, yPosition + 8, { align: "right" });
  yPosition += 25;

  // Título del reporte
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Reporte de Calificaciones`, 15, yPosition);
  yPosition += 10;

  const feedbackDic = {
    great: "Excelente",
    medium: "Regular",
    bad: "Mala",
  };

  // Tabla de Calificaciones
  const rateTableData = visits
    .filter((v) => v.feedback)
    .map((visit, index) => [
      (index + 1).toString(),
      visit.petName,
      visit.ownerName,
      feedbackDic[visit.feedback as keyof typeof feedbackDic],
      visit.date.format("DD/MM/YYYY"),
    ]);
  autoTable(doc, {
    startY: yPosition,
    head: [["N°", "Mascota", "Dueño", "Calificación", "Fecha"]],
    body: rateTableData,
    theme: "grid",
    headStyles: { fillColor: [255, 200, 150], textColor: 0, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      4: { halign: "center" },
    },
  });

  // generate total ratings summary
  const totalRatings = rateTableData.length;
  const greatRatings = visits.filter((v) => v.feedback === "great").length;
  const mediumRatings = visits.filter((v) => v.feedback === "medium").length;
  const badRatings = visits.filter((v) => v.feedback === "bad").length;

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text(`Resumen de Calificaciones:`, 15, yPosition);
  yPosition += 7;
  doc.setFontSize(10);
  doc.text(`Total de Calificaciones: ${totalRatings}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Calificaciones Excelente: ${greatRatings}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Calificaciones Regular: ${mediumRatings}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Calificaciones Mala: ${badRatings}`, 15, yPosition);

  // Descargar PDF
  doc.save("Reporte_Calificaciones.pdf");
};
