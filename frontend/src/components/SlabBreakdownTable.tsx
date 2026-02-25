import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BillDetails } from '../backend';

interface SlabBreakdownTableProps {
  billDetails: BillDetails;
}

export default function SlabBreakdownTable({ billDetails }: SlabBreakdownTableProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent" style={{ background: 'oklch(0.72 0.18 195 / 0.08)' }}>
            <TableHead className="text-energy text-xs font-semibold uppercase tracking-wider">Slab</TableHead>
            <TableHead className="text-energy text-xs font-semibold uppercase tracking-wider text-right">Units</TableHead>
            <TableHead className="text-energy text-xs font-semibold uppercase tracking-wider text-right">Rate (₹/unit)</TableHead>
            <TableHead className="text-energy text-xs font-semibold uppercase tracking-wider text-right">Cost (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billDetails.slabCosts.map((slab, idx) => (
            <TableRow key={idx} className="border-border hover:bg-muted/20">
              <TableCell className="text-sm text-foreground">{slab.name}</TableCell>
              <TableCell className="text-sm text-right text-foreground">{Number(slab.units)}</TableCell>
              <TableCell className="text-sm text-right text-muted-foreground">
                ₹{(Number(slab.perUnitCost) / 100).toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-right font-medium text-energy">
                ₹{Number(slab.cost).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-border hover:bg-muted/20">
            <TableCell className="text-sm text-foreground" colSpan={3}>Fixed Charges</TableCell>
            <TableCell className="text-sm text-right font-medium text-energy">
              ₹{Number(billDetails.fixedCharges).toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow style={{ background: 'oklch(0.72 0.18 195 / 0.1)' }}>
            <TableCell colSpan={3} className="font-bold text-foreground">Total Estimated Bill</TableCell>
            <TableCell className="text-right font-bold text-energy text-base">
              ₹{Number(billDetails.totalCost).toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
