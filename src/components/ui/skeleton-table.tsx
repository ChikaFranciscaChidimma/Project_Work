
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Skeleton } from "./skeleton";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <TableHead key={`header-${i}`}>
                  <Skeleton className="h-4 w-[80%]" />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rows)
            .fill(0)
            .map((_, i) => (
              <TableRow key={`row-${i}`}>
                {Array(columns)
                  .fill(0)
                  .map((_, j) => (
                    <TableCell key={`cell-${i}-${j}`}>
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
