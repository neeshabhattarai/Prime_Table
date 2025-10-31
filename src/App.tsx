import { useEffect, useRef, useState, type MouseEvent } from "react";
import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { OverlayPanel } from "primereact/overlaypanel";
import type { PaginatorPageChangeEvent } from "primereact/paginator";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
  artist_title: string;
}

function App() {
  const [data, setData] = useState<Artwork[]>([]);
  const [page, setPage] = useState<number>(1);
  const [row, setRows] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [rowCount, setRowCount] = useState<string>("");
  const ref = useRef<OverlayPanel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${row} `
        );
        const result = await res.json();
        setData(result.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, row]);

  const handleSubmit = (e: MouseEvent<HTMLElement>) => {
    const count = parseInt(rowCount);
    if (!isNaN(count) && count > 0) {
      setSelectedArtworks(data.slice(0, count));
    }

    ref.current?.toggle(e);
  };

  const headerTemplate = () => (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={(e) => ref.current?.toggle(e)}
      >
        <span>⌄</span>
        <span>Title</span>
      </div>

      <OverlayPanel ref={ref} className="flex flex-col !gap-1 !mt-1">
        <input
          type="number"
          placeholder="Enter value"
          value={rowCount}
          onChange={(e) => setRowCount(e.target.value)}
          className="p-inputtext p-component w-50 border rounded-md p-1"
        />
        <button
          onClick={handleSubmit}
          className="!p-button !p-component !p-button-sm !bg-indigo-500 !text-white !rounded-md py-1"
        >
          Submit
        </button>
      </OverlayPanel>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    );

  if (!isLoading && data.length === 0)
    return (
      <h3 style={{ textAlign: "center", marginTop: "2rem" }}>No data found</h3>
    );

  return (
    <div className="p-4">
      <Card>
        <DataTable
          value={data}
          paginator
          rows={row}
          lazy
          rowsPerPageOptions={[5, 10, 15, 20]}
          // first={(page - 1) * 10}
          totalRecords={50}
          onPage={(e: PaginatorPageChangeEvent) => {
            setPage(e.page + 1);
            setRows(e.rows);
          }}
          responsiveLayout="scroll"
          emptyMessage="No artworks found."
          tableStyle={{ minWidth: "65rem" }}
          selectionMode="checkbox"
          selection={selectedArtworks}
          onSelectionChange={(e) => setSelectedArtworks(e.value)}
          dataKey="id"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="title" header={headerTemplate} />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Start Date" />
          <Column field="date_end" header="End Date" />
          <Column field="artist_title" header="Artist" />
        </DataTable>
      </Card>
    </div>
  );
}

export default App;
