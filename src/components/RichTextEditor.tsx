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
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, label, placeholder, minHeight }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(16);

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
