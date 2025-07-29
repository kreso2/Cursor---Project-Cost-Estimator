# 06 - Data Integration

## External API Integrations
Implement integrations with external services to enhance the project cost calculator functionality.

## Currency Exchange API
### ExchangeRate.host Integration
- **Endpoint**: https://api.exchangerate.host
- **Features**: Free, no API key required
- **Rate Limits**: 1000 requests per month
- **Supported Currencies**: 170+ currencies
- **Real-time Rates**: Updated every hour

### Implementation
```typescript
interface ExchangeRateResponse {
  success: boolean;
  base: string;
  date: string;
  rates: Record<string, number>;
}

class CurrencyService {
  private cache: Map<string, { rates: Record<string, number>; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    // Check cache first
    const cached = this.cache.get(baseCurrency);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }

    // Fetch from API
    const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`);
    const data: ExchangeRateResponse = await response.json();

    if (data.success) {
      // Cache the result
      this.cache.set(baseCurrency, {
        rates: data.rates,
        timestamp: Date.now()
      });
      return data.rates;
    }

    throw new Error('Failed to fetch exchange rates');
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
    if (fromCurrency === toCurrency) return amount;
    const rate = rates[toCurrency];
    return amount * rate;
  }
}
```

## Email Integration (SendGrid)
### SendGrid API Integration
- **Service**: SendGrid
- **Features**: Transactional emails, templates
- **Rate Limits**: 100 emails/day (free tier)
- **Use Cases**: Project sharing, notifications, reports

### Implementation
```typescript
interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

class EmailService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }]
        }],
        from: { email: emailData.from },
        subject: emailData.subject,
        content: emailData.html ? [
          { type: 'text/html', value: emailData.html }
        ] : [
          { type: 'text/plain', value: emailData.text || '' }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }
  }
}
```

## SMS Integration (Twilio)
### Twilio SMS Integration
- **Service**: Twilio
- **Features**: SMS notifications, alerts
- **Rate Limits**: Varies by plan
- **Use Cases**: Project updates, urgent notifications

### Implementation
```typescript
interface SMSData {
  to: string;
  from: string;
  body: string;
}

class SMSService {
  private accountSid: string;
  private authToken: string;
  private client: any;

  constructor(accountSid: string, authToken: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.client = require('twilio')(accountSid, authToken);
  }

  async sendSMS(smsData: SMSData): Promise<void> {
    try {
      await this.client.messages.create({
        body: smsData.body,
        from: smsData.from,
        to: smsData.to
      });
    } catch (error) {
      throw new Error(`Twilio SMS error: ${error.message}`);
    }
  }
}
```

## PDF Generation
### jsPDF Integration
- **Library**: jsPDF
- **Features**: PDF reports, invoices, quotes
- **Use Cases**: Project reports, cost breakdowns, invoices

### Implementation
```typescript
import jsPDF from 'jspdf';

interface PDFData {
  project: Project;
  roles: ProjectRole[];
  totalCost: number;
  currency: string;
}

class PDFService {
  generateProjectReport(pdfData: PDFData): Blob {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Project Cost Report', 20, 20);
    
    // Add project details
    doc.setFontSize(12);
    doc.text(`Project: ${pdfData.project.name}`, 20, 40);
    doc.text(`Total Cost: ${pdfData.currency} ${pdfData.totalCost.toFixed(2)}`, 20, 50);
    
    // Add role breakdown
    let yPosition = 70;
    pdfData.roles.forEach(role => {
      doc.text(`${role.roleName}: ${role.hours}h @ ${role.hourlyRate}/h = ${role.subtotal}`, 20, yPosition);
      yPosition += 10;
    });
    
    return doc.output('blob');
  }
}
```

## Data Export/Import
### CSV Export
```typescript
interface CSVExportData {
  headers: string[];
  rows: string[][];
  filename: string;
}

class ExportService {
  exportToCSV(data: CSVExportData): void {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
```

## Real-time Updates
### WebSocket Integration
- **Service**: Supabase Realtime
- **Features**: Real-time project updates, collaboration
- **Use Cases**: Live project editing, notifications

### Implementation
```typescript
class RealtimeService {
  private subscription: any;

  subscribeToProject(projectId: string, callback: (payload: any) => void): void {
    this.subscription = supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, callback)
      .subscribe();
  }

  unsubscribe(): void {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }
  }
}
```

## Error Handling & Fallbacks
- **API Rate Limiting**: Implement retry logic with exponential backoff
- **Network Failures**: Graceful degradation, offline support
- **Data Validation**: Input sanitization, type checking
- **Caching Strategy**: Local storage, session storage, memory cache
- **Error Logging**: Centralized error tracking and reporting

## Security Considerations
- **API Key Management**: Environment variables, secure storage
- **Data Encryption**: Sensitive data encryption in transit and at rest
- **Input Validation**: Sanitize all external inputs
- **Rate Limiting**: Implement client-side rate limiting
- **CORS Configuration**: Proper CORS setup for external APIs 


ChatGPT Prompt suggestion:
Implement data integrations:
- Real-time exchange rates for currency conversion
- Supabase RLS policies, triggers for notifications
- Secure API usage with validation, input sanitization
- Performance: pagination, caching, optimized queries
