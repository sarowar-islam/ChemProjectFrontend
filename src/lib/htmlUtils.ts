export function stripHtml(html: string): string {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export function linkifyHtml(html: string): string {
  if (!html) return '';
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const walkAndLinkify = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || '';
      if (urlRegex.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent/80">$1</a>');
        node.parentNode?.replaceChild(span, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName !== 'A' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
        Array.from(el.childNodes).forEach(walkAndLinkify);
      }
    }
  };

  Array.from(tempDiv.childNodes).forEach(walkAndLinkify);
  return tempDiv.innerHTML;
}
