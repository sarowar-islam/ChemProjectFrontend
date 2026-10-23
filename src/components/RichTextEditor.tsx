import { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Plus,
  Palette,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export default function RichTextEditor({ value, onChange, label, placeholder, minHeight }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(16);
  const [hue, setHue] = useState<number>(145);
  const [sat, setSat] = useState<number>(74);
  const [val, setVal] = useState<number>(33);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#166534');

  const showColorPickerRef = useRef(showColorPicker);
  showColorPickerRef.current = showColorPicker;

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (showColorPickerRef.current && colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updateColorFromHsv = (h: number, s: number, v: number) => {
    setHue(h);
    setSat(s);
    setVal(v);
    const hex = hsvToHex(h, s, v);
    setSelectedColor(hex);
    executeCommand('foreColor', hex);
  };

  const applyColor = (color: string) => {
    setSelectedColor(color);
    executeCommand('foreColor', color);
  };

  const handleSvMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = (clientX: number, clientY: number) => {
      let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      let y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      let s = Math.round((x / rect.width) * 100);
      let v = Math.round((1 - y / rect.height) * 100);
      updateColorFromHsv(hue, s, v);
    };
    update(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => update(moveEvent.clientX, moveEvent.clientY);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = (clientX: number) => {
      let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      let h = Math.round((x / rect.width) * 360);
      updateColorFromHsv(h, sat, val);
    };
    update(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => update(moveEvent.clientX);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const updateCurrentFontSize = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const computedSize = window.getComputedStyle(el).fontSize;
        if (computedSize) {
          const px = parseInt(computedSize, 10);
          if (!isNaN(px)) {
            setFontSize(px);
            return;
          }
        }
      }
      node = node.parentNode;
    }
    setFontSize(16);
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHeading = (level: 'h1' | 'h2' | 'h3') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      executeCommand('formatBlock', `<${level}>`);
      updateCurrentFontSize();
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const classMap = {
      h1: 'text-2xl font-bold my-2 text-foreground',
      h2: 'text-xl font-bold my-2 text-foreground',
      h3: 'text-lg font-bold my-2 text-foreground',
    };

    const html = `<${level} class="${classMap[level]}">${selectedText || level.toUpperCase()}</${level}>`;
    document.execCommand('insertHTML', false, html);

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateCurrentFontSize();
  };

  const applyFontSize = (newSizePx: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) {
      const span = document.createElement('span');
      span.style.fontSize = `${newSizePx}px`;
      span.innerHTML = '&#8203;';
      range.deleteContents();
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      setFontSize(newSizePx);
      return;
    }

    const span = document.createElement('span');
    span.style.fontSize = `${newSizePx}px`;
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(newRange);

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setFontSize(newSizePx);
  };

  const handleLink = () => {
    const url = prompt('Enter URL (e.g. https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const decreaseSize = () => {
    const newSize = Math.max(8, fontSize - 1);
    applyFontSize(newSize);
  };

  const increaseSize = () => {
    const newSize = Math.min(96, fontSize + 1);
    applyFontSize(newSize);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="border border-border rounded-xl bg-card shadow-xs focus-within:border-accent/60 transition-colors">
        {/* Toolbar */}
        <div className="sticky top-0 z-40 flex flex-wrap items-center gap-1 p-2 bg-card/95 backdrop-blur-sm rounded-t-xl border-b border-border select-none shadow-sm">
          {/* Minimized & Modern Font Size Stepper */}
          <div className="inline-flex items-center h-8 bg-card border border-border rounded-lg shadow-2xs px-1 gap-0.5">
            <button
              type="button"
              onClick={decreaseSize}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Decrease Font Size (-1px)"
            >
              <Minus className="w-3 h-3" />
            </button>
            <div className="flex items-center justify-center">
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setFontSize(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFontSize(fontSize);
                  }
                }}
                onBlur={() => applyFontSize(fontSize)}
                className="w-7 bg-transparent text-center text-xs font-semibold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="Font Size (px)"
                min={8}
                max={96}
              />
              <span className="text-[10px] font-medium text-muted-foreground/70 pr-0.5">px</span>
            </div>
            <button
              type="button"
              onClick={increaseSize}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Increase Font Size (+1px)"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Inline Text Formatting */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyFull')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleHeading('h1')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors font-bold text-xs"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h2')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors font-bold text-xs"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h3')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors font-bold text-xs"
              title="Heading 3"
            >
              H3
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Extras */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand('hiliteColor', '#fef08a')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLink}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Text Color"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showColorPicker && (
                <div className="absolute left-0 mt-2 z-50 w-64 p-3.5 bg-card border border-border rounded-xl shadow-elevated space-y-3 select-none">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Text Color</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">{selectedColor}</span>
                  </div>

                  {/* 2D Saturation/Value Color Box */}
                  <div
                    onMouseDown={handleSvMouseDown}
                    className="relative w-full h-32 rounded-lg overflow-hidden cursor-crosshair border border-border shadow-inner"
                    style={{ backgroundColor: hsvToHex(hue, 100, 100) }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: `${sat}%`,
                        top: `${100 - val}%`,
                        backgroundColor: selectedColor,
                      }}
                    />
                  </div>

                  {/* Bottom Controls: Preview Circle, Hex, Hue Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <div
                      className="w-7 h-7 rounded-full border-2 border-border shadow-2xs shrink-0"
                      style={{ backgroundColor: selectedColor }}
                      title={selectedColor}
                    />
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => {
                        const valText = e.target.value;
                        setSelectedColor(valText);
                        if (/^#[0-9A-F]{6}$/i.test(valText)) {
                          applyColor(valText);
                        }
                      }}
                      className="w-20 h-7 px-2 text-xs bg-secondary/50 border border-border rounded text-foreground font-mono focus:outline-none focus:border-accent"
                    />
                    <div
                      onMouseDown={handleHueMouseDown}
                      className="relative flex-1 h-4 rounded-full overflow-hidden cursor-pointer shadow-inner border border-border"
                      style={{
                        background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                      }}
                    >
                      <div
                        className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-800 shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${(hue / 360) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggested Colors in One Row (Strict Circles) */}
                  <div className="pt-2 border-t border-border">
                    <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">Suggested Colors</div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        '#000000', '#1e293b', '#166534', '#10b981', '#2563eb',
                        '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c',
                        '#d97706', '#ca8a04', '#64748b', '#ffffff'
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => applyColor(color)}
                          className={`w-5 h-5 min-w-[20px] min-h-[20px] aspect-square rounded-full border transition-all hover:scale-125 shrink-0 ${
                            selectedColor.toLowerCase() === color.toLowerCase()
                              ? 'ring-2 ring-accent ring-offset-1 border-white'
                              : 'border-border shadow-2xs'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editable Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(e) => {
            onChange(e.currentTarget.innerHTML);
            updateCurrentFontSize();
          }}
          onClick={updateCurrentFontSize}
          onKeyUp={updateCurrentFontSize}
          className="p-4 focus:outline-none prose prose-sm max-w-none text-foreground bg-card [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none"
          style={{ minHeight: minHeight || '250px' }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Format text with bold, italic, underline, alignments (left, center, right, justify), lists, headings, and font sizing.</p>
    </div>
  );
}
