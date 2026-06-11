/**
 * Custom RFC-4180 compliant CSV parser
 * Parses CSV strings and handles escaped quotes and newlines.
 * @param {string} text 
 * @returns {string[][]} Array of rows containing array of cells
 */
export function parseCSV(text) {
  const lines = [];
  let row = [''];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  
  return lines.filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));
}

/**
 * Normalizes date strings to YYYY-MM-DD
 * @param {string} dateStr 
 * @returns {string} Normalized date or empty string
 */
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(/[-.]/g, '/'));
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // Ignore and return empty/original
  }
  return '';
}

/**
 * Heuristically extracts invoice details from text.
 * @param {string} text 
 * @returns {object} Extracted invoice schema fields
 */
export function extractFieldsFromText(text) {
  const result = {
    invoiceId: '',
    clientName: '',
    clientEmail: '',
    invoiceDate: '',
    dueDate: '',
    items: [],
    taxRate: 0,
    status: 'Sent',
    notes: '',
    totalAmount: 0
  };

  if (!text) return result;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      result.clientEmail = match[1];
      break;
    }
  }

  // 2. Invoice ID extraction
  // Look for terms like "Invoice #", "INV-1002", etc.
  const invIdRegexes = [
    /invoice\s*(?:number|no|#|num)?\s*[:#-]?\s*([a-z0-9-]+)/i,
    /inv(?:[-#\s]*)([a-z0-9-]+)/i,
    /#\s*([a-z0-9-]+)/i
  ];

  for (const regex of invIdRegexes) {
    for (const line of lines) {
      const match = line.match(regex);
      if (match && match[1] && match[1].length >= 3 && isNaN(match[1])) {
        result.invoiceId = match[1].toUpperCase();
        break;
      }
    }
    if (result.invoiceId) break;
  }

  // Fallback Invoice ID: first token that looks like INV-XXX or a strong code
  if (!result.invoiceId) {
    for (const line of lines) {
      const match = line.match(/\b(INV-\d+)\b/i);
      if (match) {
        result.invoiceId = match[1].toUpperCase();
        break;
      }
    }
  }

  // 3. Client Name heuristics
  // Look for "Bill To", "To:", "Client:", "Sold To:" and grab the name on the line or the next line
  const clientNameKeywords = [
    /bill\s*to\s*:\s*(.*)/i,
    /invoice\s*to\s*:\s*(.*)/i,
    /client\s*:\s*(.*)/i,
    /bill\s*to\b/i,
    /invoice\s*to\b/i,
    /client\b/i
  ];

  let clientLineIndex = -1;
  for (const keyword of clientNameKeywords) {
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(keyword);
      if (match) {
        if (match[1] && match[1].trim()) {
          result.clientName = match[1].trim();
        } else {
          // Grab the next line if it doesn't look like a header or date or address
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.includes(':') && nextLine.length > 2) {
            result.clientName = nextLine.trim();
          }
        }
        clientLineIndex = i;
        break;
      }
    }
    if (result.clientName) break;
  }

  // 4. Date extraction
  // Look for keywords "date", "issued", "due"
  const dateRegex = /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/i;
  
  // Look for issue date
  const issueKeywords = [/invoice\s*date/i, /issue\s*date/i, /date\s*:\s*/i, /issued\b/i];
  for (const kw of issueKeywords) {
    for (const line of lines) {
      if (kw.test(line)) {
        const match = line.match(dateRegex);
        if (match) {
          result.invoiceDate = normalizeDate(match[1]);
          break;
        }
      }
    }
    if (result.invoiceDate) break;
  }

  // Look for due date
  const dueKeywords = [/due\s*date/i, /due\s*by/i, /payable\s*by/i, /due\b/i];
  for (const kw of dueKeywords) {
    for (const line of lines) {
      if (kw.test(line)) {
        const match = line.match(dateRegex);
        if (match) {
          result.dueDate = normalizeDate(match[1]);
          break;
        }
      }
    }
    if (result.dueDate) break;
  }

  // Fallback dates: search for any date patterns in the text
  const allDates = [];
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const normalized = normalizeDate(match[1]);
      if (normalized && !allDates.includes(normalized)) {
        allDates.push(normalized);
      }
    }
  }

  if (allDates.length > 0) {
    if (!result.invoiceDate) result.invoiceDate = allDates[0];
    if (!result.dueDate) result.dueDate = allDates[1] || allDates[0];
  }

  // 5. Total Amount extraction
  const totalKeywords = [
    /(?:total|balance\s*due|amount\s*due|grand\s*total)(?:\s*amount)?[\s:-]*\$?\s*([\d,]+\.\d{2})/i,
    /(?:total|due)(?:\s*amount)?[\s:-]*\$?\s*([\d,]+\.\d{2})/i
  ];
  for (const kw of totalKeywords) {
    for (const line of lines) {
      const match = line.match(kw);
      if (match) {
        result.totalAmount = parseFloat(match[1].replace(/,/g, '')) || 0;
        break;
      }
    }
    if (result.totalAmount) break;
  }

  // Search for tax rate percentage
  const taxKeywords = [/tax\s*(?:rate)?\s*[:(-]?\s*([\d.]+)%/i, /tax[\s:-]+([\d.]+)%/i];
  for (const kw of taxKeywords) {
    for (const line of lines) {
      const match = line.match(kw);
      if (match) {
        result.taxRate = parseFloat(match[1]) || 0;
        break;
      }
    }
    if (result.taxRate) break;
  }

  // 6. Line Items Extraction
  // We look for patterns like: [Description] [Quantity] [Rate/Price] [Total]
  // Description: text, Qty: integer, Rate: decimal/currency
  const itemRowRegex = /^(.*?)\s+(\d+)\s+(?:\$?\s*([\d,]+(?:\.\d{2})?))\s+(?:\$?\s*([\d,]+(?:\.\d{2})?))$/;
  // Fallback pattern without item total: e.g. [Description] [Quantity] @ [Price]
  const itemRowRegex2 = /^(.*?)\s+(\d+)\s*(?:x|@)?\s*(?:\$?\s*([\d,]+(?:\.\d{2})?))$/;

  for (const line of lines) {
    // Skip lines with headers
    if (/description|quantity|subtotal|total|invoice|date|due|client|bill/i.test(line)) continue;

    let match = line.match(itemRowRegex);
    if (match) {
      const description = match[1].replace(/^[-*•\s]+/, '').trim();
      const quantity = parseInt(match[2], 10) || 1;
      const rate = parseFloat(match[3].replace(/,/g, '')) || 0;
      if (description && quantity > 0 && rate >= 0) {
        result.items.push({
          id: `item-parsed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          description,
          quantity,
          rate
        });
      }
    } else {
      match = line.match(itemRowRegex2);
      if (match) {
        const description = match[1].replace(/^[-*•\s]+/, '').trim();
        const quantity = parseInt(match[2], 10) || 1;
        const rate = parseFloat(match[3].replace(/,/g, '')) || 0;
        if (description && quantity > 0 && rate >= 0) {
          result.items.push({
            id: `item-parsed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            description,
            quantity,
            rate
          });
        }
      }
    }
  }

  // If we couldn't extract any specific line items but did extract a totalAmount,
  // create a single default line item to make the builder form valid
  if (result.items.length === 0 && result.totalAmount > 0) {
    let subtotal = result.totalAmount;
    if (result.taxRate > 0) {
      subtotal = result.totalAmount / (1 + (result.taxRate / 100));
    }
    result.items.push({
      id: `item-parsed-default`,
      description: 'Imported past invoice summary',
      quantity: 1,
      rate: parseFloat(subtotal.toFixed(2))
    });
  }

  return result;
}

/**
 * Dynamically loads PDF.js from cdnjs and extracts text content from PDF file.
 * @param {File} file 
 * @returns {Promise<string>} Plain text content of the PDF
 */
export async function loadPdfText(file) {
  return new Promise((resolve, reject) => {
    // 1. Check if window.pdfjsLib is already loaded
    if (window.pdfjsLib) {
      extractText(window.pdfjsLib, file, resolve, reject);
      return;
    }

    // 2. Load PDF.js script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      // Configure worker src
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      extractText(pdfjsLib, file, resolve, reject);
    };
    script.onerror = () => {
      reject(new Error('Failed to load PDF parsing library from CDN. Please verify your internet connection.'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Extracts text from PDF using loaded pdfjsLib
 */
async function extractText(pdfjsLib, file, resolve, reject) {
  try {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const typedarray = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        let extractedText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // PDF.js extracts text items. Group them by line using their viewport coordinates if possible,
          // or just join them sequentially. In many vector PDFs, they are sequential.
          let lastY = null;
          let pageText = '';
          
          for (const item of textContent.items) {
            // item.transform is [scaleX, skewX, skewY, scaleY, translateX, translateY]
            // translateY is at index 5. If it changes significantly, it's a new line.
            const y = item.transform[5];
            if (lastY !== null && Math.abs(y - lastY) > 5) {
              pageText += '\n';
            } else if (lastY !== null) {
              pageText += ' ';
            }
            pageText += item.str;
            lastY = y;
          }
          extractedText += pageText + '\n\n';
        }
        resolve(extractedText);
      } catch (err) {
        reject(new Error('Could not parse PDF pages: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file binary content.'));
    reader.readAsArrayBuffer(file);
  } catch (err) {
    reject(err);
  }
}
