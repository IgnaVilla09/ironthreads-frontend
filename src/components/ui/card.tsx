import * as React from 'react';
import { cn } from '@/lib/utils';
import { renderChatContent } from '@/lib/chat-content';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-black/10 bg-card text-card-foreground shadow-none',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

const Message = React.forwardRef<HTMLDivElement, { role: 'user' | 'assistant'; content: string }>(
  ({ role, content }, ref) => {
    const isError = content.toLowerCase().includes('error');
    const bubbleClass =
      role === 'user'
        ? 'bg-primary text-black'
        : isError
          ? 'bg-red-600 text-white'
          : 'bg-black text-white';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3',
          role === 'user' ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[80%] px-3.5 py-2 rounded-2xl text-sm shadow [overflow-wrap:anywhere]',
            bubbleClass,
            role === 'user' ? 'rounded-br-sm self-end' : 'rounded-bl-sm self-start'
          )}
        >
          {renderChatContent(content)}
        </div>
      </div>
    );
  }
);
Message.displayName = 'Message';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, Message };
