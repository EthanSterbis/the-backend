"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

export type TeamRow = {
  posteam: string;
  season: number;
  epa: number;
  epa_pass: number;
  epa_rush: number;
  success_rate: number;
  plays: number;
};

export default function LeaderboardTable({ rows }: { rows: TeamRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "epa", desc: true },
  ]);

  const columns = React.useMemo<ColumnDef<TeamRow>[]>(
    () => [
      { accessorKey: "posteam", header: "Team" },
      { accessorKey: "season", header: "Season" },
      { accessorKey: "plays", header: "Plays" },
      {
        accessorKey: "success_rate",
        header: "SR",
        cell: (info) => info.getValue<number>().toFixed(3),
      },
      {
        accessorKey: "epa",
        header: "EPA/play",
        cell: (info) => info.getValue<number>().toFixed(3),
      },
      {
        accessorKey: "epa_pass",
        header: "EPA pass",
        cell: (info) => info.getValue<number>().toFixed(3),
      },
      {
        accessorKey: "epa_rush",
        header: "EPA rush",
        cell: (info) => info.getValue<number>().toFixed(3),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className="px-2 py-1 text-left cursor-pointer select-none"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{
                    asc: " ▲",
                    desc: " ▼",
                  }[h.column.getIsSorted() as "asc" | "desc"] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id} className="odd:bg-neutral-50">
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-2 py-1">
                  {flexRender(
                    c.column.columnDef.cell ?? c.column.columnDef.header,
                    c.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
