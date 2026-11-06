import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, Microscope, Plus, Search, Trash2, Edit, X, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { instrumentService } from '@/services/instrument.service';
import { Instrument, InstrumentCategory, InstrumentStatus } from '@/services/types';
import { INSTRUMENT_STATUSES, STATUS_CONFIG } from '@/lib/instrumentUtils';
import { optimizeImage } from '@/lib/imageUtils';
import { inlineUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InstrumentImage, StatusBadge } from './InstrumentShared';

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  status: InstrumentStatus;
  imageUrl: string;
  sopUrl: string;
  operatingProcedureUrl: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  responsibleAdminName: string;
  responsibleAdminEmail: string;
  featuresText: string;
  requirementsText: string;
  specs: { label: string; value: string }[];
  openingHour: number;
  closingHour: number;
  slotIntervalMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  advanceBookingDays: number;
}

const blankForm = (categoryId: string): FormState => ({
  name: '',
  shortDescription: '',
  description: '',
  categoryId,
  status: 'available',
  imageUrl: '',
  sopUrl: '',
  operatingProcedureUrl: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  location: '',
  responsibleAdminName: '',
  responsibleAdminEmail: '',
  featuresText: '',
  requirementsText: '',
  specs: [{ label: '', value: '' }],
  openingHour: 9,
  closingHour: 18,
  slotIntervalMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 240,
  advanceBookingDays: 60,
});

const lines = (t: string) => t.split('\n').map((l) => l.trim()).filter(Boolean);

export function AdminInstrumentsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const sopFileRef = useRef<HTMLInputElement>(null);
  const opFileRef = useRef<HTMLInputElement>(null);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [categories, setCategories] = useState<InstrumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | InstrumentStatus>('all');
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Instrument | null>(null);
  const [form, setForm] = useState<FormState>(blankForm(''));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSop, setUploadingSop] = useState(false);
  const [uploadingOp, setUploadingOp] = useState(false);
  const [toDelete, setToDelete] = useState<Instrument | null>(null);

  const refresh = async () => {
    const [i, c] = await Promise.all([instrumentService.getInstruments(), instrumentService.getCategories()]);
    if (i.success && i.data) setInstruments(i.data);
    if (c.success && c.data) setCategories(c.data);
    setLoading(false);
    queryClient.invalidateQueries({ queryKey: ['instruments'] });
    queryClient.invalidateQueries({ queryKey: ['instrument'] });
    queryClient.invalidateQueries({ queryKey: ['instrument-calendar'] });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: instruments.length };
    INSTRUMENT_STATUSES.forEach((s) => (c[s] = instruments.filter((i) => i.status === s).length));
    return c;
  }, [instruments]);

  const filtered = instruments.filter((i) => {
    const q = search.trim().toLowerCase();
    const matches = !q || [i.name, i.manufacturer, i.model, i.category].some((v) => v.toLowerCase().includes(q));
    return matches && (statusFilter === 'all' || i.status === statusFilter);
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...blankForm(categories[0]?.id ?? ''),
      responsibleAdminName: user?.username ?? '',
      responsibleAdminEmail: user?.email ?? '',
    });
    setDialogOpen(true);
  };

  const openEdit = (i: Instrument) => {
    setEditing(i);
    setForm({
      name: i.name,
      shortDescription: i.shortDescription,
      description: i.description,
      categoryId: i.categoryId,
      status: i.status,
      imageUrl: i.imageUrl,
      sopUrl: i.sopUrl ?? '',
      operatingProcedureUrl: i.operatingProcedureUrl ?? '',
      manufacturer: i.manufacturer,
      model: i.model,
      serialNumber: i.serialNumber ?? '',
      location: i.location,
      responsibleAdminName: i.responsibleAdminName,
      responsibleAdminEmail: i.responsibleAdminEmail,
      featuresText: i.features.join('\n'),
      requirementsText: i.usageRequirements.join('\n'),
      specs: i.specifications.length ? i.specifications.map((s) => ({ label: s.label, value: s.value })) : [{ label: '', value: '' }],
      openingHour: i.openingHour,
      closingHour: i.closingHour,
      slotIntervalMinutes: i.slotIntervalMinutes,
      minDurationMinutes: i.minDurationMinutes,
      maxDurationMinutes: i.maxDurationMinutes,
      advanceBookingDays: i.advanceBookingDays,
    });
    setDialogOpen(true);
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, 4, 1400, 0.85);
      const res = await instrumentService.uploadInstrumentImage(optimized);
      if (res.success && res.data) setField('imageUrl', res.data.imageUrl);
      else toast({ title: 'Upload failed', description: res.error, variant: 'destructive' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Invalid image', variant: 'destructive' });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSop(true);
    try {
      const res = await instrumentService.uploadInstrumentDocument(file);
      if (res.success && res.data) setField('sopUrl', res.data.fileUrl);
      else toast({ title: 'SOP upload failed', description: res.error, variant: 'destructive' });
    } catch (err) {
      toast({ title: 'SOP upload failed', description: err instanceof Error ? err.message : 'Invalid file', variant: 'destructive' });
    }
    setUploadingSop(false);
    if (sopFileRef.current) sopFileRef.current.value = '';
  };

  const handleOp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingOp(true);
    try {
      const res = await instrumentService.uploadInstrumentDocument(file);
      if (res.success && res.data) setField('operatingProcedureUrl', res.data.fileUrl);
      else toast({ title: 'Operating Procedure upload failed', description: res.error, variant: 'destructive' });
    } catch (err) {
      toast({ title: 'Operating Procedure upload failed', description: err instanceof Error ? err.message : 'Invalid file', variant: 'destructive' });
    }
    setUploadingOp(false);
    if (opFileRef.current) opFileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.shortDescription.trim() || !form.categoryId) {
      toast({ title: 'Missing information', description: 'Name, short description and category are required.', variant: 'destructive' });
      return;
    }
    if (form.closingHour <= form.openingHour) {
      toast({ title: 'Invalid hours', description: 'Closing hour must be after opening hour.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const category = categories.find((c) => c.id === form.categoryId);
    const payload = {
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim() || form.shortDescription.trim(),
      categoryId: form.categoryId,
      category: category?.name ?? '',
      status: form.status,
      imageUrl: form.imageUrl,
      sopUrl: form.sopUrl.trim() || undefined,
      operatingProcedureUrl: form.operatingProcedureUrl.trim() || undefined,
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim() || undefined,
      location: form.location.trim(),
      responsibleAdminId: editing?.responsibleAdminId ?? user?.id ?? 'admin-001',
      responsibleAdminName: form.responsibleAdminName.trim(),
      responsibleAdminEmail: form.responsibleAdminEmail.trim(),
      features: lines(form.featuresText),
      usageRequirements: lines(form.requirementsText),
      specifications: form.specs.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
      openingHour: Number(form.openingHour),
      closingHour: Number(form.closingHour),
      slotIntervalMinutes: Number(form.slotIntervalMinutes),
      minDurationMinutes: Number(form.minDurationMinutes),
      maxDurationMinutes: Number(form.maxDurationMinutes),
      advanceBookingDays: Number(form.advanceBookingDays),
    };
    const res = editing
      ? await instrumentService.updateInstrument(editing.id, payload)
      : await instrumentService.createInstrument(payload);
    setSaving(false);
    if (res.success) {
      toast({ title: editing ? 'Instrument updated' : 'Instrument added' });
      setDialogOpen(false);
      refresh();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const changeStatus = async (i: Instrument, status: InstrumentStatus) => {
    const res = await instrumentService.updateStatus(i.id, status);
    if (res.success) {
      toast({ title: 'Status updated', description: `${i.name} is now ${STATUS_CONFIG[status].label}.` });
      refresh();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const res = await instrumentService.deleteInstrument(toDelete.id);
    if (res.success) {
      toast({ title: 'Instrument deleted' });
      setToDelete(null);
      refresh();
    }
  };

  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
      active ? 'bg-accent text-primary-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'
    }`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl text-foreground">Instruments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage the laboratory inventory, specifications and availability status.</p>
        </div>
        <Button onClick={openCreate} className="bg-accent text-primary-foreground hover:bg-accent/90 self-start">
          <Plus className="w-4 h-4 mr-2" /> Add Instrument
        </Button>
      </div>

      {/* Status summary + filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {INSTRUMENT_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`text-left bg-card border rounded-xl p-4 shadow-sm transition-colors ${statusFilter === s ? 'border-accent' : 'border-border hover:border-accent/40'}`}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} /> {STATUS_CONFIG[s].label}
            </div>
            <div className="text-3xl font-bold text-accent mt-1">{counts[s]}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('all')} className={chip(statusFilter === 'all')}>All ({counts.all})</button>
          {INSTRUMENT_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
              {STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search instruments..." className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-card border border-border rounded-xl">
          <Microscope className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-60" />
          <h3 className="font-heading text-lg text-foreground mb-1">No instruments found</h3>
          <p className="text-sm text-muted-foreground">Add an instrument or change the filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <div key={i.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-full md:w-28 h-32 md:h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                <InstrumentImage src={i.imageUrl} alt={i.name} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{i.name}</h3>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{i.manufacturer} {i.model} · {i.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{i.location}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={i.status} onValueChange={(v) => changeStatus(i, v as InstrumentStatus)}>
                  <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INSTRUMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => openEdit(i)}><Edit className="w-4 h-4 mr-1.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => setToDelete(i)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{editing ? 'Edit instrument' : 'Add instrument'}</DialogTitle>
            <DialogDescription>Provide complete details so researchers can find and book this instrument.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image */}
            <div className="space-y-2">
              <Label>Instrument image</Label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-28 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                  <InstrumentImage src={form.imageUrl} alt="Preview" className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                    Upload image
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG or PNG, up to 4 MB.</p>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setField('imageUrl', '')} className="text-xs text-destructive hover:underline">Remove image</button>
                  )}
                </div>
              </div>
            </div>

            {/* SOP and Operating Procedure Document Upload (2 in a row) */}
            <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-border">
              {/* SOP Upload */}
              <div className="space-y-2">
                <Label>Upload SOP Document</Label>
                <div className="space-y-2">
                  <input ref={sopFileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleSop} />
                  <Button type="button" variant="outline" size="sm" disabled={uploadingSop} onClick={() => sopFileRef.current?.click()} className="w-full">
                    {uploadingSop ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2 text-accent" />}
                    {form.sopUrl ? 'Change SOP Document' : 'Upload SOP (PDF/Doc)'}
                  </Button>
                  {form.sopUrl && (
                    <div className="flex items-center justify-between text-xs bg-secondary/50 p-2 rounded border border-border">
                      <a href={inlineUrl(form.sopUrl)} target="_blank" rel="noopener noreferrer" className="truncate max-w-[180px] text-primary hover:underline font-medium">
                        {form.sopUrl.split('/').pop()}
                      </a>
                      <button type="button" onClick={() => setField('sopUrl', '')} className="text-destructive hover:underline ml-2 font-medium">Remove</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Operating Procedure Upload */}
              <div className="space-y-2">
                <Label>Operating Procedure Document</Label>
                <div className="space-y-2">
                  <input ref={opFileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleOp} />
                  <Button type="button" variant="outline" size="sm" disabled={uploadingOp} onClick={() => opFileRef.current?.click()} className="w-full">
                    {uploadingOp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2 text-accent" />}
                    {form.operatingProcedureUrl ? 'Change Procedure Document' : 'Upload Procedure (PDF/Doc)'}
                  </Button>
                  {form.operatingProcedureUrl && (
                    <div className="flex items-center justify-between text-xs bg-secondary/50 p-2 rounded border border-border">
                      <a href={inlineUrl(form.operatingProcedureUrl)} target="_blank" rel="noopener noreferrer" className="truncate max-w-[180px] text-primary hover:underline font-medium">
                        {form.operatingProcedureUrl.split('/').pop()}
                      </a>
                      <button type="button" onClick={() => setField('operatingProcedureUrl', '')} className="text-destructive hover:underline ml-2 font-medium">Remove</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setField('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField('status', v as InstrumentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INSTRUMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Short description *</Label>
                <Input value={form.shortDescription} onChange={(e) => setField('shortDescription', e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full description</Label>
                <RichTextEditor value={form.description} onChange={(val) => setField('description', val)} placeholder="Provide detailed description with formatting..." />
              </div>
              <div className="space-y-1.5"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Model</Label><Input value={form.model} onChange={(e) => setField('model', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Serial number</Label><Input value={form.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setField('location', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Responsible admin</Label><Input value={form.responsibleAdminName} onChange={(e) => setField('responsibleAdminName', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Admin email</Label><Input type="email" value={form.responsibleAdminEmail} onChange={(e) => setField('responsibleAdminEmail', e.target.value)} /></div>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setField('specs', [...form.specs, { label: '', value: '' }])}>
                  <Plus className="w-4 h-4 mr-1" /> Add row
                </Button>
              </div>
              {form.specs.map((s, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input placeholder="Label (e.g. Wavelength range)" value={s.label} onChange={(e) => setField('specs', form.specs.map((x, n) => (n === idx ? { ...x, label: e.target.value } : x)))} />
                  <Input placeholder="Value" value={s.value} onChange={(e) => setField('specs', form.specs.map((x, n) => (n === idx ? { ...x, value: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setField('specs', form.specs.length > 1 ? form.specs.filter((_, n) => n !== idx) : [{ label: '', value: '' }])}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Key features (one per line)</Label>
                <Textarea rows={4} value={form.featuresText} onChange={(e) => setField('featuresText', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Usage requirements (one per line)</Label>
                <Textarea rows={4} value={form.requirementsText} onChange={(e) => setField('requirementsText', e.target.value)} />
              </div>
            </div>

            {/* Booking rules */}
            <div className="space-y-2">
              <Label>Booking rules</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ['openingHour', 'Opening hour (0-23)'],
                  ['closingHour', 'Closing hour (1-24)'],
                  ['slotIntervalMinutes', 'Slot interval (min)'],
                  ['minDurationMinutes', 'Min duration (min)'],
                  ['maxDurationMinutes', 'Max duration (min)'],
                  ['advanceBookingDays', 'Advance booking (days)'],
                ] as const).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <Input type="number" min={0} value={form[key]} onChange={(e) => setField(key, Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-primary-foreground hover:bg-accent/90">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Save changes' : 'Add instrument'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes its bookings, reviews and specifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
