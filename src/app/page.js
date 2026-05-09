"use client";

import { useEffect, useMemo, useState } from "react";

const createRows = () =>
  Array.from({ length: 9 }, () => ({
    name: "",
    phone: "",
    rakba: "",
  }));

export default function HomePage() {
  const [rows, setRows] = useState(createRows);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  useEffect(() => {
    const fetchRegister = async () => {
      try {
        const res = await fetch("/api/register", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          if (Array.isArray(data.register.rows) && data.register.rows.length > 0) {
            setRows(data.register.rows);
          } else {
            setRows(createRows());
          }

          setDataLoaded(true);
        }
      } catch (error) {
        console.log("Register fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchRegister();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;

    setSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/register", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rows }),
        });

        const data = await res.json();

        if (data.success) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (error) {
        setSaveStatus("error");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [rows, dataLoaded]);

  const addRow = () => {
    setRows([...rows, { name: "", phone: "", rakba: "" }]);
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);

    setShowDeleteMessage(true);

    setTimeout(() => {
      setShowDeleteMessage(false);
    }, 1800);
  };

  const handleChange = (index, field, value) => {
    const updated = rows.map((row, i) => {
      if (i === index) {
        return {
          ...row,
          [field]: value,
        };
      }

      return row;
    });

    setRows(updated);
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const rowsWithIndex = rows.map((row, originalIndex) => ({
      row,
      originalIndex,
    }));

    if (!q) return rowsWithIndex;

    return rowsWithIndex.filter(({ row }) => {
      return (
        row.name?.toLowerCase().includes(q) ||
        row.phone?.toLowerCase().includes(q) ||
        row.rakba?.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const csvValue = (value) => {
    return `"${String(value || "").replaceAll('"', '""')}"`;
  };

  const exportCSV = () => {
    const header = ["क्र.सं.", "नाम", "पिता का नाम", "मोबाइल नंबर"];
    const csvRows = [header.map(csvValue).join(",")];

    rows.forEach((row, index) => {
      csvRows.push(
        [
          csvValue(index + 1),
          csvValue(row.name),
          csvValue(row.phone),
          csvValue(row.rakba),
        ].join(",")
      );
    });

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bhumi_survey_register.csv";
    link.click();
  };

  const escapeHTML = (value) => {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const exportPDF = () => {
    const printWindow = window.open("", "", "width=900,height=700");

    if (!printWindow) {
      alert("Popup blocked. Please allow popup for PDF.");
      return;
    }

    let tableRows = "";

    rows.forEach((row, index) => {
      tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(row.name)}</td>
          <td>${escapeHTML(row.phone)}</td>
          <td>${escapeHTML(row.rakba)}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>किस्तवार - Bhumi Survey Register</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            .brand-title {
              font-size: 34px;
              font-weight: 900;
              margin: 0;
            }

            .brand-subtitle {
              margin-top: 6px;
              letter-spacing: 8px;
              color: #666;
              font-size: 13px;
            }

            .box {
              border: 1px solid #ddd;
              padding: 20px;
              margin-top: 24px;
              margin-bottom: 24px;
            }

            .label {
              color: #9f1239;
              font-weight: 700;
              letter-spacing: 6px;
              margin: 0 0 10px 0;
            }

            .village {
              font-size: 34px;
              font-weight: 900;
              margin: 0 0 16px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #9ca3af;
              padding: 12px;
              text-align: left;
              font-size: 18px;
            }

            th {
              font-weight: 800;
              background: #f3f4f6;
            }
          </style>
        </head>

        <body>
          <h1 class="brand-title">किस्तवार</h1>
          <div class="brand-subtitle">BHUMI SURVEY REGISTER</div>

          <div class="box">
            <p class="label">मौजा / ग्राम</p>
            <h2 class="village">Supaul</h2>
            <p>थाना नं.: 23 &nbsp;&nbsp;&nbsp; जिला: Darbhanga</p>
            <p>प्रविष्टियां: <b>${rows.length}</b></p>
          </div>

          <table>
            <thead>
              <tr>
                <th>क्र.सं.</th>
                <th>नाम</th>
                <th>पिता का नाम</th>
                <th>मोबाइल नंबर</th>
              </tr>
            </thead>

            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 text-center text-2xl text-gray-500">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      {showDeleteMessage && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-white px-4 py-4 shadow-md">
          <div className="mx-auto flex max-w-6xl items-center gap-4 text-xl font-bold text-emerald-700 sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white sm:h-12 sm:w-12">
              ✓
            </span>
            पंक्ति हटा दी गई
          </div>
        </div>
      )}

      <header className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-[3px] border-[#9f1239] text-[#9f1239] sm:h-16 sm:w-16 sm:border-4">
              <span className="text-2xl sm:text-3xl">▦</span>
            </div>

            <div>
              <h1 className="text-2xl font-black leading-none tracking-tight text-black sm:text-4xl">
                किस्तवार
              </h1>
              <p className="mt-2 text-[10px] font-medium tracking-[0.35em] text-gray-500 sm:mt-3 sm:text-sm sm:tracking-[0.5em]">
                BHUMI SURVEY REGISTER
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1 border border-gray-200 px-3 py-2 text-sm text-gray-600 sm:gap-2 sm:px-7 sm:py-4 sm:text-2xl">
            <span className="text-xl sm:text-3xl">↪</span>
            लॉगआउट
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-lg font-semibold tracking-[0.35em] text-[#9f1239] sm:text-2xl sm:tracking-[0.45em]">
              रजिस्टर सूची
            </p>

            <h2 className="text-4xl font-black leading-tight text-black sm:text-6xl">
              मौजा एवं ग्राम
            </h2>
          </div>

          <p className="text-sm font-semibold text-gray-500 sm:text-lg">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </p>
        </div>

        <div className="border border-gray-300 bg-white px-5 py-8 shadow-sm sm:px-14 sm:py-16">
          <p className="mb-4 text-lg font-semibold tracking-[0.3em] text-[#9f1239] sm:mb-5 sm:text-2xl sm:tracking-[0.35em]">
            मौजा / ग्राम
          </p>

          <h2 className="text-4xl font-black text-black sm:text-6xl">
            Supaul
          </h2>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xl text-gray-600 sm:mt-12 sm:gap-x-16 sm:text-3xl">
            <p>
              <span className="font-bold">थाना नं.:</span> 23
            </p>

            <p>
              <span className="font-bold">जिला:</span> Darbhanga
            </p>

            <p>
              <span className="font-bold">प्रविष्टियां:</span>{" "}
              <span className="font-black text-[#0b43aa]">{rows.length}</span>
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:flex sm:flex-wrap sm:gap-6">
            <button
              onClick={addRow}
              className="flex items-center justify-center gap-4 bg-[#0b43aa] px-6 py-5 text-2xl font-bold text-white shadow-md active:scale-[0.99] sm:gap-5 sm:px-10 sm:py-6 sm:text-4xl"
            >
              <span className="text-4xl font-light sm:text-5xl">+</span>
              नई पंक्ति
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-4 bg-[#008264] px-6 py-5 text-2xl font-bold text-white shadow-md active:scale-[0.99] sm:gap-5 sm:px-10 sm:py-6 sm:text-4xl"
            >
              <span className="text-3xl sm:text-4xl">⇩</span>
              Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-4 bg-[#d60000] px-6 py-5 text-2xl font-bold text-white shadow-md active:scale-[0.99] sm:gap-5 sm:px-10 sm:py-6 sm:text-4xl"
            >
              <span className="text-3xl sm:text-4xl">▣</span>
              PDF
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4 border-b border-gray-200 pb-4 text-xl text-gray-400 sm:mt-20 sm:gap-5 sm:text-3xl">
            <span className="text-3xl sm:text-4xl">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, पिता का नाम या मोबाइल नंबर में खोजें..."
              className="w-full bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="mt-10 overflow-x-auto sm:mt-16">
          <table className="w-full min-w-[760px] border-collapse bg-white">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-10 text-center text-xl font-black sm:px-8 sm:py-16 sm:text-3xl">
                  क्र.सं.
                </th>

                <th className="border border-gray-300 px-4 py-10 text-left text-xl font-black sm:px-8 sm:py-16 sm:text-3xl">
                  नाम
                </th>

                <th className="border border-gray-300 px-4 py-10 text-left text-xl font-black sm:px-8 sm:py-16 sm:text-3xl">
                  पिता का नाम
                </th>

                <th className="border border-gray-300 px-4 py-10 text-left text-xl font-black sm:px-8 sm:py-16 sm:text-3xl">
                  मोबाइल नंबर
                </th>

                <th className="border border-gray-300 px-4 py-10 text-center text-xl font-black sm:px-8 sm:py-16 sm:text-3xl">
                  क्रिया
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(({ row, originalIndex }) => (
                <tr key={originalIndex}>
                  <td className="border border-gray-300 px-4 py-6 text-center text-xl text-gray-700 sm:px-8 sm:py-8 sm:text-3xl">
                    {originalIndex + 1}
                  </td>

                  <td className="border border-gray-300 px-4 py-6 sm:px-8 sm:py-8">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) =>
                        handleChange(originalIndex, "name", e.target.value)
                      }
                      className="w-full bg-transparent text-xl outline-none sm:text-3xl"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-6 sm:px-8 sm:py-8">
                    <input
                      type="text"
                      value={row.phone}
                      onChange={(e) =>
                        handleChange(originalIndex, "phone", e.target.value)
                      }
                      className="w-full bg-transparent text-xl outline-none sm:text-3xl"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-6 sm:px-8 sm:py-8">
                    <input
                      type="tel"
                      value={row.rakba}
                      onChange={(e) =>
                        handleChange(originalIndex, "rakba", e.target.value)
                      }
                      className="w-full bg-transparent text-xl outline-none sm:text-3xl"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-6 text-center sm:px-8 sm:py-8">
                    <button
                      onClick={() => deleteRow(originalIndex)}
                      className="text-2xl text-gray-500 active:scale-95 sm:text-4xl"
                      title="हटाएँ"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="border border-t-0 border-gray-300 p-8 text-center text-xl text-gray-500 sm:text-2xl">
              कोई डेटा नहीं मिला।
            </div>
          )}
        </div>
      </section>
    </main>
  );
}