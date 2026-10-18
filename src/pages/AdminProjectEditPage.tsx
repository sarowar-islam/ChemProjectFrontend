import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FolderKanban } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';

export default function AdminProjectEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    researchLink: '',
    status: 'ongoing' as 'ongoing' | 'completed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchProject = async () => {
        const res = await adminService.getProjects();
        if (res.success && res.data) {
          const found = res.data.find((item: any) => item.id === id);
          if (found) {
            setFormData({
              title: found.title || '',
              description: found.description || '',
              researchLink: found.researchLink || '',
              status: found.status || 'ongoing',
              startDate: found.startDate || new Date().toISOString().split('T')[0],
              endDate: found.endDate || '',
            });
          } else {
            toast({ title: 'Error', description: 'Project not found', variant: 'destructive' });
            navigate('/admin');
          }
        }
        setLoading(false);
      };
      fetchProject();
    }
  }, [id, isEditing, navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        const res = await adminService.updateProject(id, formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Project updated successfully' });
          navigate('/admin');
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update project', variant: 'destructive' });
        }
      } else {
        const res = await adminService.createProject(formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Project created successfully' });
          navigate('/admin');
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to create project', variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-wide py-20 text-center">
        <div className="animate-pulse space-y-4 max-w-xl mx-auto">
          <div className="h-8 bg-secondary rounded w-3/4 mx-auto" />
          <div className="h-64 bg-secondary rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container-wide max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </button>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="p-3 rounded-xl bg-accent/15 text-accent">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {isEditing ? 'Edit Research Project' : 'Add New Research Project'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter project information and format descriptions with rich text formatting.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter project title..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="researchLink">External Research Link</Label>
              <Input
                id="researchLink"
                value={formData.researchLink}
                onChange={(e) => setFormData({ ...formData, researchLink: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as 'ongoing' | 'completed' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              {formData.status === 'completed' && (
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div>
              <RichTextEditor
                label="Project Description (Rich Text) *"
                value={formData.description}
                onChange={(description) => setFormData({ ...formData, description })}
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-accent text-primary-foreground hover:bg-accent/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
