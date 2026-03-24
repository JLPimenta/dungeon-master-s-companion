import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
