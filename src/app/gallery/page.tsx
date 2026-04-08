"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/wizard/Lightbox";

interface GallerySession {
  sessionId: string;
  images: string[];
  createdAt: string;
}

export default function GalleryPage() {
  const [sessions, setSessions] = useState<GallerySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-muted-foreground text-sm">
              All generated images across sessions
            </p>
          </div>
          <Link href="/wizard/step-1-upload">
            <Button>New Batch</Button>
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading gallery...</p>
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No images generated yet.
            </p>
            <Link href="/wizard/step-1-upload">
              <Button variant="outline">Start Your First Batch</Button>
            </Link>
          </div>
        )}

        {sessions.map((session) => (
          <div key={session.sessionId} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{session.sessionId}</h2>
              <span className="text-xs text-muted-foreground">
                {formatDate(session.createdAt)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.images.length} images
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
              {session.images.map((img) => (
                <Card
                  key={img}
                  className="overflow-hidden cursor-zoom-in"
                  onClick={() => setLightboxSrc(img)}
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
