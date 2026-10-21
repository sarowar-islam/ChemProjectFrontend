import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Newspaper, X, Plus } from 'lucide-react';
import { newsService } from '@/services/news.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';

export default function AdminNewsEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchNewsItem = async () => {
        const res = await newsService.getNews();
        if (res.success && res.data) {
          const found = res.data.find((item: any) => item.id === id);
          if (found) {
            setTitle(found.title || '');
            setContent(found.content || '');
            if (found.imageUrl) {
              const urls = found.imageUrl.split(',').filter(Boolean);
              setImageUrls(urls);
            }
          } else {
            toast({ title: 'Error', description: 'News article not found', variant: 'destructive' });
            navigate('/admin');
          }
        }
        setLoading(false);
      };
      fetchNewsItem();
    }
  }, [id, isEditing, navigate, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const uploadRes = await newsService.uploadNewsImage(file);
        if (uploadRes.success && uploadRes.data?.imageUrl) {
          uploadedUrls.push(uploadRes.data.imageUrl);
        } else {
          toast({
            title: 'Image Upload Failed',
            description: uploadRes.error || `Failed to upload "${file.name}". News was not published.`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      const allUrls = [...imageUrls, ...uploadedUrls];
      const finalImageUrl = allUrls.join(',');

      // Generate summary from content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const summary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

      const payload = {
        title,
        content,
        summary,
        imageUrl: finalImageUrl,
        author: '',
      };

      if (isEditing && id) {
        const res = await newsService.updateNews(id, payload);
        if (res.success) {
          toast({ title: 'Success', description: 'News updated successfully' });
          navigate('/admin');
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update news', variant: 'destructive' });
        }
      } else {
        const res = await newsService.createNews(payload);
        if (res.success) {
          toast({ title: 'Success', description: 'News published successfully' });
          navigate('/admin');
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to publish news', variant: 'destructive' });
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
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {isEditing ? 'Edit News Article' : 'Publish News Article'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter article title, attach multiple images, and use the rich text editor below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                required
                className="mt-1"
              />
            </div>

            {/* Multiple Images Upload & Previews */}
            <div>
              <Label className="block mb-2">Featured Images (Multiple allowed)</Label>
              <div className="flex items-center gap-4 mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 text-accent hover:bg-accent/25 font-medium text-sm transition-colors border border-accent/30">
                  <Plus className="w-4 h-4" />
                  <span>Select Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-muted-foreground">You can select multiple photos at once.</span>
              </div>

              {/* Previews Grid */}
              {(imageUrls.length > 0 || selectedFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  {/* Existing URLs */}
                  {imageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden border border-border bg-card aspect-video">
                      <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Newly selected files */}
                  {selectedFiles.map((file, index) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div key={`file-${index}`} className="relative group rounded-lg overflow-hidden border border-border bg-card aspect-video">
                        <img src={previewUrl} alt={`New ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-md"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <RichTextEditor
                label="Article Content (Rich Text) *"
                value={content}
                onChange={setContent}
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
                {saving ? 'Saving...' : isEditing ? 'Update News' : 'Publish News'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
