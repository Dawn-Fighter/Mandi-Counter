import type { ParsedBillData } from '@/types';

/**
 * Parse bill text from OCR to extract relevant data
 */
export function parseBillData(text: string): ParsedBillData {
    const result: ParsedBillData = {
        totalAmount: null,
        location: null,
        date: new Date(),
        numberOfPeople: 1,
    };

    // Patterns for extracting total amount
    const totalPatterns = [
        /(?:grand\s*total|total\s*amount|total)[\s:]*₹?\s*([\d,]+\.?\d*)/i,
        /(?:amount\s*payable|net\s*amount|amount)[\s:]*₹?\s*([\d,]+\.?\d*)/i,
        /₹\s*([\d,]+\.?\d*)/,
        /(?:rs\.?|inr)[\s:]*([\d,]+\.?\d*)/i,
    ];

    // Try each pattern to find total amount
    for (const pattern of totalPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const cleanedNumber = match[1].replace(/,/g, '');
            const parsed = parseFloat(cleanedNumber);
            if (!isNaN(parsed) && parsed > 0) {
                result.totalAmount = parsed;
                break;
            }
        }
    }

    // Extract location from first meaningful line
    const lines = text.split('\n').filter((line) => line.trim().length > 3);
    if (lines.length > 0) {
        // Usually the restaurant/location name is in the first few lines
        for (const line of lines.slice(0, 3)) {
            const trimmed = line.trim();
            // Skip lines that look like addresses or phone numbers
            if (
                !trimmed.match(/^\d+/) &&
                !trimmed.match(/phone|tel|mobile|fax/i) &&
                !trimmed.match(/gst|gstin/i)
            ) {
                result.location = trimmed;
                break;
            }
        }
    }

    // Date patterns
    const datePatterns = [
        // DD-MM-YYYY or DD/MM/YYYY
        /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/,
        // DD Month YYYY
        /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i,
        // YYYY-MM-DD
        /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                let dateStr: string;

                if (pattern.source.startsWith('(\\d{4})')) {
                    // YYYY-MM-DD format
                    dateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                } else if (pattern.source.includes('jan|feb')) {
                    // DD Month YYYY format
                    const monthMap: Record<string, string> = {
                        jan: '01', feb: '02', mar: '03', apr: '04',
                        may: '05', jun: '06', jul: '07', aug: '08',
                        sep: '09', oct: '10', nov: '11', dec: '12',
                    };
                    const month = monthMap[match[2].toLowerCase().slice(0, 3)];
                    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
                    dateStr = `${year}-${month}-${match[1].padStart(2, '0')}`;
                } else {
                    // DD-MM-YYYY format
                    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
                    dateStr = `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
                }

                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    result.date = parsedDate;
                    break;
                }
            } catch {
                // Continue to next pattern if parsing fails
            }
        }
    }

    // Try to extract number of people
    const peoplePatterns = [
        /(\d+)\s*(?:person|people|pax|guests?|covers?)/i,
        /(?:person|people|pax|guests?|covers?)[\s:]*(\d+)/i,
    ];

    for (const pattern of peoplePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > 0 && num < 50) {
                result.numberOfPeople = num;
                break;
            }
        }
    }

    return result;
}
