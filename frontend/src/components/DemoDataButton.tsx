import { useSeedTestData } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Database, Loader2 } from 'lucide-react';

export default function DemoDataButton() {
  const seedData = useSeedTestData();

  const handleSeed = async () => {
    try {
      await seedData.mutateAsync();
      toast.success('30 days of demo data loaded successfully!');
    } catch (err: any) {
      toast.error('Failed to load demo data. Make sure you are registered.');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-energy/40 text-energy hover:bg-energy/10 hover:border-energy text-xs h-8 transition-all"
          disabled={seedData.isPending}
        >
          {seedData.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          ) : (
            <Database className="w-3 h-3 mr-1.5" />
          )}
          Load Demo Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Load Demo Data?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will insert 30 days of sample consumption data into your account.
            Existing data may be overwritten. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSeed}
            className="bg-energy text-primary-foreground font-semibold hover:bg-energy/90"
          >
            Load Demo Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
