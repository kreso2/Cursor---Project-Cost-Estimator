# Currency Conversion Feature Guide

This guide explains the Currency Conversion component that has been added to the Project Calculator.

## Overview

The Currency Conversion component allows users to:
- Add multiple roles with different currencies
- Convert hourly rates and costs to a target currency using live exchange rates
- View real-time currency conversion with caching for performance
- Toggle between net and gross pricing with tax calculations

## Features

### 1. **Live Exchange Rates**
- Uses ExchangeRate.host API for real-time currency conversion
- Automatic caching (5 minutes) to improve performance
- Error handling with fallback to cached rates
- Support for 30+ currencies worldwide

### 2. **Role Management**
- Add multiple roles (e.g., Developer, Designer, QA)
- Set role title, hourly rate, hours, and currency
- Real-time cost calculation in target currency
- Remove roles as needed

### 3. **Currency Selection**
- Dropdown with 30+ supported currencies
- Automatic conversion of all rates when currency changes
- Clear display of exchange rates for reference

### 4. **Net/Gross Pricing**
- Toggle between net and gross pricing
- Configurable tax rate (default 20%)
- Automatic calculation of tax amounts
- Clear display of net cost, gross cost, and tax amount

### 5. **Real-time Updates**
- Reactive UI that updates immediately when values change
- Automatic recalculation of totals
- Live exchange rate updates with manual refresh option

## How to Use

### Accessing the Component
1. Navigate to the Project Calculator
2. Click on the "Currency Conversion" tab
3. The component will load with live exchange rates

### Adding Roles
1. Click "Add Role" button
2. Fill in:
   - **Role Title**: e.g., "Senior Developer"
   - **Hourly Rate**: e.g., 75.00
   - **Hours**: e.g., 160
   - **Currency**: Select from dropdown
3. The total cost will be calculated automatically

### Changing Currency
1. Select a new target currency from the dropdown
2. All hourly rates and costs will be converted automatically
3. Exchange rates are fetched from the API
4. Updated rates are displayed for reference

### Net/Gross Pricing
1. Check "Show Net/Gross" checkbox
2. Set tax rate percentage (default 20%)
3. View:
   - **Total Cost**: Gross amount including tax
   - **Net Cost**: Amount excluding tax
   - **Tax Amount**: Tax portion of the total

### Updating Exchange Rates
1. Click "Update Rates" button
2. Fresh rates will be fetched from the API
3. All calculations will be updated automatically

## Technical Details

### API Integration
- **Service**: ExchangeRate.host (free tier)
- **Endpoint**: `https://api.exchangerate.host/latest?base={currency}`
- **Caching**: 5-minute cache to reduce API calls
- **Error Handling**: Graceful fallback to cached rates

### Supported Currencies
- Major currencies: USD, EUR, GBP, CAD, AUD, CHF, JPY
- European currencies: SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, HRK
- Asian currencies: CNY, INR, KRW, SGD, HKD, THB, MYR, IDR, PHP, VND
- Other currencies: RUB, BRL, MXN, ZAR, TRY

### Performance Features
- **Caching**: Exchange rates cached for 5 minutes
- **Lazy Loading**: Rates fetched only when needed
- **Error Recovery**: Uses cached rates if API fails
- **Reactive Updates**: UI updates immediately on changes

## Error Handling

### API Failures
- Displays error message with details
- Falls back to cached rates if available
- Shows warning when using cached data
- Manual refresh option available

### Invalid Data
- Validates currency codes
- Checks for required fields
- Shows helpful error messages
- Prevents invalid calculations

### Network Issues
- Handles network timeouts
- Retries with exponential backoff
- User-friendly error messages
- Graceful degradation

## Integration with Project Calculator

The Currency Conversion component integrates seamlessly with the main Project Calculator:

- **Data Flow**: Results can be passed back to main calculator
- **Currency Sync**: Uses same currency options as main calculator
- **Consistent UI**: Matches the design and styling
- **State Management**: Integrates with existing state patterns

## Future Enhancements

### Planned Features
- **Historical Rates**: View rate changes over time
- **Rate Alerts**: Notifications for significant rate changes
- **Bulk Import**: Import roles from CSV/Excel
- **Advanced Tax**: Multiple tax rates and rules
- **Export Options**: Export calculations to various formats

### API Improvements
- **Multiple Providers**: Fallback to different rate providers
- **Rate Limits**: Better handling of API limits
- **WebSocket**: Real-time rate updates
- **Offline Mode**: Work with cached rates when offline

## Troubleshooting

### Common Issues

1. **Rates Not Updating**
   - Check internet connection
   - Click "Update Rates" button
   - Check browser console for errors

2. **Incorrect Conversions**
   - Verify currency codes are correct
   - Check if rates are cached (old data)
   - Refresh rates manually

3. **API Errors**
   - Check ExchangeRate.host status
   - Verify API endpoint is accessible
   - Check rate limits (free tier)

4. **Performance Issues**
   - Clear browser cache
   - Check for too many API calls
   - Verify caching is working

### Getting Help

- Check browser console for detailed error messages
- Verify network connectivity
- Test with different currencies
- Check ExchangeRate.host documentation

## Security Considerations

- **API Keys**: No API keys required (free tier)
- **Data Privacy**: No sensitive data sent to external APIs
- **Rate Limiting**: Built-in caching reduces API calls
- **Error Handling**: Secure error messages (no sensitive data exposed) 