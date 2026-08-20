"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@formbro/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@formbro/ui/empty";
import { Input } from "@formbro/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@formbro/ui/table";
import { TypographyH1, TypographySubheading } from "@formbro/ui/typography";
import {
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiDownloadLine,
  RiFileDownloadLine,
  RiFilterLine,
  RiInboxLine,
  RiArrowRightUpLine,
} from "@remixicon/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type Row as TanStackRow,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { useRequiredWorkspaceFormData } from "../_data-provider";
import {
  FormSubmissionsDataProvider,
  useFormSubmissionsData,
  useSubmissionPrewarmIntent,
} from "./_data-provider";

type SubmissionsResult = FunctionReturnType<typeof api.submissions.list>;
type SubmissionsData = NonNullable<Extract<SubmissionsResult, { ok: true }>["data"]>;
type SubmissionColumn = SubmissionsData["columns"][number];
type SubmissionRow = SubmissionsData["rows"][number];

const selectColumnId = "_select";
const submittedAtColumnId = "_submitted_at";
const pageSizeOptions = [10, 25, 50, 100] as const;
const columnSize = {
  select: 36,
  submitted: 176,
  submittedMin: 144,
  field: 176,
  fieldMin: 112,
  fieldMax: 480,
} as const;

function getFieldColumnId(fieldId: string) {
  return `field:${fieldId}`;
}

function getColumnSizeStyle(size: number): CSSProperties {
  return { width: size, minWidth: size, maxWidth: size };
}

function getStickyColumnClass(columnId: string) {
  switch (columnId) {
    case selectColumnId:
      return "left-0 z-40";
    case submittedAtColumnId:
      return "left-9 z-30";
    default:
      return undefined;
  }
}

function getStickyCellClass(columnId: string) {
  switch (columnId) {
    case selectColumnId:
      return "sticky left-0 z-20 bg-background text-center group-hover:bg-muted";
    case submittedAtColumnId:
      return "sticky left-9 z-10 bg-background group-hover:bg-muted";
    default:
      return undefined;
  }
}

const tableDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatTableDate(value: number) {
  return tableDateFormatter.format(new Date(value));
}

function formatCsvDate(value: number) {
  return new Date(value).toISOString();
}

function escapeCsvCell(value: string) {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function getCsvLabel(column: SubmissionColumn, columns: SubmissionColumn[]) {
  const labelCount = columns.filter((candidate) => candidate.label === column.label).length;
  return labelCount > 1 ? `${column.label} (${column.id})` : column.label;
}

function makeCsv(data: SubmissionsData, rows = data.rows) {
  const headers = [
    "Submitted at",
    ...data.columns.map((column) => getCsvLabel(column, data.columns)),
  ];
  const csvRows = rows.map((row) => [
    formatCsvDate(row.submittedTime),
    ...data.columns.map((column) => row.values[column.id] ?? ""),
  ]);

  return [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getDownloadBaseName(formSlug: string) {
  return formSlug.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "form";
}

function getDownloadTimestamp() {
  return new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "-");
}

function SubmissionCell({ value }: { value: string | undefined }) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span className="line-clamp-2 whitespace-pre-wrap">{value}</span>;
}

function Checkbox({
  checked,
  indeterminate,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(input) => {
        if (input) input.indeterminate = Boolean(indeterminate);
      }}
      onChange={(event) => onChange(event.currentTarget.checked)}
      className="size-3.5 rounded border border-input accent-foreground"
    />
  );
}

function ColumnHeader({
  column,
  subtitle,
  title,
}: {
  column: Column<SubmissionRow, unknown>;
  subtitle?: string;
  title: string;
}) {
  const sorted = column.getIsSorted();
  const filterValue = (column.getFilterValue() as string | undefined) ?? "";
  const SortIcon =
    sorted === "asc" ? RiArrowUpLine : sorted === "desc" ? RiArrowDownLine : RiArrowUpDownLine;

  return (
    <div className="flex min-w-0 items-start justify-between gap-1">
      <span className="flex min-w-0 flex-col items-start">
        <span className="max-w-full truncate font-medium">{title}</span>
        <span className="max-w-full truncate font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
          {filterValue ? "Filtered" : subtitle}
        </span>
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="link"
            size="sm"
            className={twx(
              "h-5 shrink-0 gap-1 px-1 text-[10px] no-underline hover:no-underline",
              filterValue && "text-foreground",
            )}
          >
            {filterValue ? <RiFilterLine className="size-3" /> : null}
            <SortIcon className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            Sort ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            Sort descending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.clearSorting()}>Clear sort</DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <Input
              placeholder="Filter values..."
              value={filterValue}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 text-sm"
            />
          </div>
          {filterValue ? (
            <DropdownMenuItem onClick={() => column.setFilterValue("")}>
              Clear filter
            </DropdownMenuItem>
          ) : null}
          {column.getCanHide() ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                Hide field
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SubmissionsTable({
  basePath,
  data,
  formId,
  rowSelection,
  setRowSelection,
  workspaceSlug,
}: {
  basePath: string;
  data: SubmissionsData;
  formId: SubmissionsData["form"]["_id"];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  workspaceSlug: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: submittedAtColumnId, desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const columns = useMemo<ColumnDef<SubmissionRow>[]>(
    () => [
      {
        id: selectColumnId,
        size: columnSize.select,
        minSize: columnSize.select,
        maxSize: columnSize.select,
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        header: ({ table }) => (
          <Checkbox
            label="Select all visible rows"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            label="Select row"
            checked={row.getIsSelected()}
            onChange={(checked) => row.toggleSelected(checked)}
          />
        ),
      },
      {
        id: submittedAtColumnId,
        accessorKey: "submittedTime",
        size: columnSize.submitted,
        minSize: columnSize.submittedMin,
        enableHiding: false,
        header: ({ column }) => (
          <ColumnHeader column={column} title="Submitted" subtitle="Timestamp" />
        ),
        cell: ({ row }) => (
          <Link
            href={`${basePath}/${row.original.id}`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap underline-offset-4 hover:underline"
          >
            {formatTableDate(row.original.submittedTime)}
            <RiArrowRightUpLine className="size-3 text-muted-foreground" />
          </Link>
        ),
      },
      ...data.columns.map((submissionColumn): ColumnDef<SubmissionRow> => {
        const fieldColumnId = getFieldColumnId(submissionColumn.id);

        return {
          id: fieldColumnId,
          accessorFn: (row) => row.values[submissionColumn.id] ?? "",
          size: columnSize.field,
          minSize: columnSize.fieldMin,
          maxSize: columnSize.fieldMax,
          header: ({ column }) => (
            <ColumnHeader
              column={column}
              title={submissionColumn.label}
              subtitle={submissionColumn.type ?? submissionColumn.id}
            />
          ),
          cell: ({ getValue }) => <SubmissionCell value={getValue<string>()} />,
        };
      }),
    ],
    [basePath, data.columns],
  );

  const columnLabels = useMemo(
    () =>
      new Map([
        [submittedAtColumnId, "Submitted at"],
        ...data.columns.map(
          (column) => [getFieldColumnId(column.id), column.label] satisfies [string, string],
        ),
      ]),
    [data.columns],
  );

  const table = useReactTable({
    data: data.rows,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
    },
    defaultColumn: {
      size: columnSize.field,
      minSize: columnSize.fieldMin,
      maxSize: columnSize.fieldMax,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    columnResizeMode: "onChange",
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).trim().toLowerCase();
      if (!search) return true;

      const original = row.original;
      return (
        formatTableDate(original.submittedTime).toLowerCase().includes(search) ||
        Object.values(original.values).some((value) => value.toLowerCase().includes(search))
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const visibleRows = table.getRowModel().rows;
  const hasFilters = Boolean(globalFilter || columnFilters.length);
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalTableWidth = table.getTotalSize();

  function clearFilters() {
    setGlobalFilter("");
    setColumnFilters([]);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center">
        <Input
          placeholder="Search all submissions..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 lg:max-w-xs"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto">
          {hasFilters ? (
            <Button type="button" variant="outline" size="dense" onClick={clearFilters}>
              Clear
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="dense">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Toggle fields</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    <span className="truncate">{columnLabels.get(column.id) ?? column.id}</span>
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden rounded-none p-0">
        <Table
          containerClassName="max-h-[calc(100vh-18rem)] overflow-auto"
          className="min-w-full table-fixed border-separate border-spacing-0"
          style={{ width: totalTableWidth }}
        >
          <TableHeader className="[&_tr]:border-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={getColumnSizeStyle(header.getSize())}
                    className={twx(
                      "group/header sticky top-0 z-20 border-r border-b bg-muted/80 px-2 py-1.5 backdrop-blur",
                      getStickyColumnClass(header.column.id),
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() ? (
                      <button
                        type="button"
                        aria-label="Resize column"
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={twx(
                          "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-transparent transition-colors group-hover/header:bg-border",
                          header.column.getIsResizing() && "bg-foreground",
                        )}
                      />
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <SubmissionTableRow
                  key={row.id}
                  formId={formId}
                  formSlug={data.form.slug}
                  row={row}
                  workspaceSlug={workspaceSlug}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length || 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No matching submissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-2 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div>
          {selectedRowsCount} selected. Showing {visibleRows.length} of {filteredRowCount} filtered
          rows
          {filteredRowCount !== data.rows.length ? ` (${data.rows.length} total)` : null}.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">Rows</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="w-24 text-center">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubmissionTableRow({
  formId,
  formSlug,
  row,
  workspaceSlug,
}: {
  formId: SubmissionsData["form"]["_id"];
  formSlug: string;
  row: TanStackRow<SubmissionRow>;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const {
    href,
    prefetch: _prefetch,
    ...prewarm
  } = useSubmissionPrewarmIntent(workspaceSlug, formSlug, formId, row.original.id);

  return (
    <TableRow
      {...prewarm}
      className="group cursor-pointer"
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea")) return;
        if (window.getSelection()?.toString()) return;
        router.push(href);
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={getColumnSizeStyle(cell.column.getSize())}
          className={twx(
            "h-9 border-r border-b px-2 py-1.5 align-top text-xs whitespace-normal group-hover:bg-muted/30",
            getStickyCellClass(cell.column.id),
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function FormSubmissionsPageContent() {
  const { submissions } = useFormSubmissionsData();
  const { form, workspace } = useRequiredWorkspaceFormData();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  if (submissions === undefined) {
    return <Loading title="submissions" />;
  }

  if (!submissions.ok) {
    return (
      <PageState
        title="Submissions unavailable"
        description={getErrorMessage(submissions.error)}
        status="error"
      />
    );
  }

  const data = submissions.data;
  const selectedRows = data.rows.filter((row) => rowSelection[row.id]);
  const rowsForDownload = selectedRows.length > 0 ? selectedRows : data.rows;
  const downloadBaseName = getDownloadBaseName(data.form.slug);
  const submissionsPath = `/dashboard/${workspace.slug}/${form.slug}/submissions`;
  const downloadCsv = () => {
    downloadBlob(
      new Blob([makeCsv(data, rowsForDownload)], { type: "text/csv;charset=utf-8" }),
      `${downloadBaseName}-submissions-${getDownloadTimestamp()}.csv`,
    );
  };
  const selectedLabel = selectedRows.length > 0 ? `${selectedRows.length} selected` : "All rows";

  return (
    <Page className="flex max-w-none flex-1 flex-col py-5">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div>
          <TypographyH1>All Submissions</TypographyH1>
          <TypographySubheading>
            {data.rows.length} submission{data.rows.length === 1 ? "" : "s"}
          </TypographySubheading>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button onClick={downloadCsv} title={`Download ${selectedLabel.toLowerCase()}`}>
            <RiDownloadLine className="size-4" /> Download CSV
          </Button>
          <Button
            variant="outline"
            disabled
            title={`Download attachments for ${selectedLabel.toLowerCase()}`}
          >
            <RiFileDownloadLine className="size-4" /> Download Attachments
          </Button>
        </div>
      </div>
      {data.rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiInboxLine className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No submissions yet</EmptyTitle>
            <EmptyDescription>
              Responses will appear here as soon as people submit this form.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <SubmissionsTable
          basePath={submissionsPath}
          data={data}
          formId={form._id}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          workspaceSlug={workspace.slug}
        />
      )}
    </Page>
  );
}

export default function FormSubmissionsPage() {
  return (
    <FormSubmissionsDataProvider>
      <FormSubmissionsPageContent />
    </FormSubmissionsDataProvider>
  );
}
