import { useState } from 'react';
import { useCreateJob } from '../../hooks/queries/useJobs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');

  const createJob = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !area.trim() || !description.trim()) return;

    try {
      await createJob.mutateAsync({
        title: title.trim(),
        category: category.trim(),
        area: area.trim(),
        description: description.trim(),
      });
      setTitle('');
      setCategory('');
      setArea('');
      setDescription('');
      setOpen(false);
      toast.success('Job posted successfully');
    } catch (error) {
      toast.error('Failed to create job. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>Fill in the details to create a new job listing</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Plumber needed for bathroom renovation"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Plumbing, Carpentry, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Downtown Seattle"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the job requirements, expectations, and any other relevant details..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJob.isPending || !title.trim() || !category.trim() || !area.trim() || !description.trim()}
            >
              {createJob.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Post Job'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

