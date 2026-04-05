import { useState } from 'react';
import { useApplyToJob } from '../../hooks/queries/useApplications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'react-toastify';

interface ApplyToJobDialogProps {
  jobId: string;
  jobTitle: string;
}

export default function ApplyToJobDialog({ jobId, jobTitle }: ApplyToJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const applyToJob = useApplyToJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    try {
      await applyToJob.mutateAsync({
        jobId,
        coverLetter: coverLetter.trim(),
      });
      setCoverLetter('');
      setOpen(false);
      toast.success('Application submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply. You may have already applied to this job.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>Tell the provider why you're a great fit for this job</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're interested in this job..."
              rows={8}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={applyToJob.isPending || !coverLetter.trim()}>
              {applyToJob.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

