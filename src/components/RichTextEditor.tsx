import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Highlighter, Link as LinkIcon } from 'lucide-react';

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
      // No text selected: insert a span with zero-width space at cursor so subsequent typing uses this size
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

    // Keep text selected
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
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/50 border-b border-border">
          {/* Font Size Number Input with +/- buttons (Left-most) */}
          <div className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded border border-border">
            <button
              type="button"
              onClick={decreaseSize}
              className="px-1.5 py-0.5 rounded hover:bg-secondary text-foreground text-xs font-bold transition-colors"
              title="Decrease Font Size (-1px)"
            >
              -
            </button>
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
              className="w-12 bg-card border border-border rounded px-1.5 py-0.5 text-xs text-center text-foreground focus:outline-none"
              title="Font Size (px)"
              min={8}
              max={96}
            />
            <span className="text-[10px] text-muted-foreground">px</span>
            <button
              type="button"
              onClick={increaseSize}
              className="px-1.5 py-0.5 rounded hover:bg-secondary text-foreground text-xs font-bold transition-colors"
              title="Increase Font Size (+1px)"
            >
              +
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => handleHeading('h1')}
            className="px-2 py-1 rounded hover:bg-secondary text-foreground transition-colors font-bold text-xs"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => handleHeading('h2')}
            className="px-2 py-1 rounded hover:bg-secondary text-foreground transition-colors font-bold text-xs"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => handleHeading('h3')}
            className="px-2 py-1 rounded hover:bg-secondary text-foreground transition-colors font-bold text-xs"
            title="Heading 3"
          >
            H3
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => executeCommand('hiliteColor', '#fef08a')}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="p-2 rounded hover:bg-secondary text-foreground transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
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
      <p className="text-xs text-muted-foreground">Use the toolbar above to format text with bold, italic, underlines, lists, headings (H1, H2, H3), precise font sizing with +/- (1px increments), and highlights. Press Ctrl+Z to undo.</p>
    </div>
  );
}
