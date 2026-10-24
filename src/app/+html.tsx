import { ScrollViewStyleReset } from 'expo-router/html';
import { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Parent-Pal</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background:#E9EEF1}@media (prefers-color-scheme: dark){body{background:#15212A}}' +
              '[role=button]:focus{outline:none}[role=button]:focus-visible,[role=tab]:focus-visible,[role=switch]:focus-visible{outline:2px solid #2F6F95;outline-offset:2px}' +
              '@media (prefers-color-scheme: dark){[role=button]:focus-visible,[role=tab]:focus-visible,[role=switch]:focus-visible{outline-color:#8CC4E6}}' +
              '@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
