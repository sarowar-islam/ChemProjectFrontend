import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  schema?: object | object[];
}

const SITE_NAME = 'Biochemical and Environmental Research Lab (BCER Lab)';
const DEFAULT_DESCRIPTION = 'Official website of the Biochemical and Environmental Research Lab (BCER Lab), led by Professor Dr. Yunus Ahmed at CUET. Advancing environmental remediation, nanomaterials, and sustainable chemistry.';
const BASE_URL = 'https://bcerlab.com';
const DEFAULT_IMAGE = `${BASE_URL}/photos/bcerlab-og-image.png`;

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Professor Dr. Yunus Ahmed`;
    document.title = fullTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const canonicalUrl = `${BASE_URL}${canonicalPath}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Open Graph
    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setOgMeta('og:title', fullTitle);
    setOgMeta('og:description', description);
    setOgMeta('og:url', canonicalUrl);
    setOgMeta('og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    setOgMeta('og:type', type);
    setOgMeta('og:site_name', 'Biochemical and Environmental Research Lab (BCER Lab)');

    // Twitter
    const setTwitterMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setTwitterMeta('twitter:card', 'summary_large_image');
    setTwitterMeta('twitter:title', fullTitle);
    setTwitterMeta('twitter:description', description);
    setTwitterMeta('twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);

    // Structured Data JSON-LD
    const existingScript = document.getElementById('seo-json-ld');
    if (existingScript) existingScript.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, image, type, schema]);

  return null;
}
