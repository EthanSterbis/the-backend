"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  flexRender,
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

const columns: ColumnDef<TeamRow>[] = [
  { accessorKey: "posteam", header: "Team" },
  { accessorKey: "epa", header: "EPA/play", cell: c => (c.getValue<number>() ?? 0).toFixed(3) },
  { accessorKey: "success_rate", header: "Success %", cell: c => `${((c.getValue<number>() ?? 0) * 100).toFixed(1)}%` },
  { accessorKey: "epa_pass", header: "EPA/pass", cell: c => (c.getValue<number>() ?? 0).toFixed(3) },
  { accessorKey: "epa_rush", header: "EPA/rush", cell: c => (c.getValue<number>() ?? 0).toFixed(3) },
  { accessorKey: "plays", header: "Plays" },
];

export default function LeaderboardTable({ rows }: { rows: TeamRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "epa", desc: true }]);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th
                  key={h.id}
                  className="px-3 py-2 text-left font-semibold cursor-pointer select-none"
                  onClick={h.column.getToggleSortingHandler()}
                  aria-sort={h.column.getIsSorted() ? (h.column.getIsSorted() + "-ending") as any : "none"}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <span className="opacity-60">
                      {h.column.getIsSorted() === "asc" ? "▲" : h.column.getIsSorted() === "desc" ? "▼" : ""}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(r => (
            <tr key={r.id} className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-950 dark:even:bg-neutral-900">
              {r.getVisibleCells().map(c => (
                <td key={c.id} className="px-3 py-2">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
