import { useEffect, useState } from "react";

export function useWebViewLoadState(url: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadedUrl(null);
  }, [url]);

  const handleLoad = (nextUrl: string) => {
    setLoadedUrl(nextUrl);
    setIsLoading(false);
  };

  return { isLoading, loadedUrl, handleLoad };
}
