import * as React from 'react';

const TOKEN_REGEX = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]*)\))/g;

type KeyGen = () => number;

function renderInline(content: string, nextKey: KeyGen): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    const token = match[0];

    if (token.startsWith('**')) {
      const inner = match[2];
      parts.push(<strong key={nextKey()}>{renderInline(inner, nextKey)}</strong>);
    } else {
      const label = match[4];
      const href = match[5];
      parts.push(
        <a
          key={nextKey()}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {renderInline(label, nextKey)}
        </a>
      );
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export function renderChatContent(content: string): React.ReactNode[] {
  let key = 0;
  const nextKey: KeyGen = () => key++;

  return renderInline(content, nextKey);
}