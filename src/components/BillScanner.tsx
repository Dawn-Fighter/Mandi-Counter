import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import Tesseract from 'tesseract.js';
import type { BillScannerProps } from '@/types';
import { parseBillData } from '@/utils/billParser';

export function BillScanner({ onDataExtracted }: BillScannerProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleImageCapture = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setProgress(0);
        setIsProcessing(true);

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const parsedData = parseBillData(result.data.text);
            onDataExtracted(parsedData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process image';
            setError(message);
            console.error('OCR Error:', err);
        } finally {
            // Cleanup
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            setIsProcessing(false);
            setProgress(0);

            // Reset file input
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                id="bill-capture"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden" // Hide the ugly default input
                disabled={isProcessing}
            />

            <label
                htmlFor="bill-capture"
                className="relative flex flex-col items-center justify-center w-full p-6 transition-all border-2 border-dashed bg-muted/30 border-primary/20 hover:border-primary/40 rounded-3xl active:scale-[0.98] active:bg-muted/50 cursor-pointer overflow-hidden group"
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center space-y-4 w-full">
                        {previewUrl ? (
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50 blur-sm" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                    <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden backdrop-blur-md">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-foreground mt-2 bg-background/60 px-2 py-1 rounded-full backdrop-blur-md">
                                        Scanning... {progress}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-sm font-medium text-muted-foreground">Processing Image...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-3 py-2 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">
                            📷
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-foreground text-lg">Scan Receipt</h3>
                            <p className="text-xs font-medium text-muted-foreground max-w-[200px] leading-relaxed">
                                Auto-detect date & amount
                            </p>
                        </div>
                    </div>
                )}
            </label>

            {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-destructive">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-xs font-bold text-destructive/70 hover:text-destructive mt-1"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
