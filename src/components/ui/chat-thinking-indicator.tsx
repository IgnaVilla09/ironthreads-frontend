import { Loader2 } from 'lucide-react';

export function ChatThinkingIndicator() {
  return (
    <div role="status" aria-live="polite" className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-black px-3.5 py-2 text-sm text-white shadow">
        <Loader2 className="h-4 w-4 text-primary motion-safe:animate-spin" aria-hidden="true" />
        <span>Consultando...</span>
      </div>
    </div>
  );
}
