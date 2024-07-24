"use client";
import * as React from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function DataTable({ columns, data }) {
	// console.log(data);
	const [sorting, setSorting] = React.useState([]);
	const [columnFilters, setColumnFilters] = React.useState([]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});
	if (!data)
		return (
			<div>
				{" "}
				<div className="flex items-center py-4 justify-between">
					<Link to="/tutors/create-course">
						<Button>
							<PlusCircle className="h-4 w-4 mr-2" />
							New course
						</Button>
					</Link>
				</div>{" "}
				<p className="text-center mt-20">No data to display</p>
			</div>
		);

	return (
		<div className="w-full">
			<div className="flex items-center py-4 justify-between">
				<Input
					placeholder="Filter courses..."
					value={table?.getColumn("title")?.getFilterValue() ?? ""}
					onChange={(event) =>
						table?.getColumn("title")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<Link to="/tutors/create-course">
					<Button>
						<PlusCircle className="h-4 w-4 mr-2" />
						New course
					</Button>
				</Link>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table?.getHeaderGroups()?.map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers?.map((header) => {
									return (
										<TableHead key={header.id}>
											{header?.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table?.getRowModel().rows?.length ? (
							table?.getRowModel().rows?.map((row) => (
								<TableRow
									key={row.id}
									data-state={row?.getIsSelected() && "selected"}
								>
									{row?.getVisibleCells()?.map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table?.previousPage()}
					disabled={!table?.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table?.nextPage()}
					disabled={!table?.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
