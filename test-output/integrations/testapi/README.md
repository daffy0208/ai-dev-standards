# Testapi Integration

Integration for testapi API.

## Installation

```bash
# Add environment variables
cp integrations/testapi/.env.example .env.local
```

## Configuration

Add to your `.env.local`:

```bash
TESTAPI_API_KEY=your-api-key-here
TESTAPI_API_URL=https://api.testapi.com
```

## Usage

```typescript
import { testapiClient } from './integrations/testapi'

// Get data
const data = await testapiClient.getData('123')

// Create data
const newData = await testapiClient.createData({
  name: 'Example',
  // ... other fields
})

// Update data
const updated = await testapiClient.updateData('123', {
  name: 'Updated Name'
})

// Delete data
await testapiClient.deleteData('123')
```



## Error Handling

```typescript
try {
  const data = await testapiClient.getData('123')
} catch (error) {
  console.error('testapi error:', error.message)
}
```

## Custom Instance

```typescript
import { TestapiClient } from './integrations/testapi'

const customClient = new TestapiClient({
  apiKey: 'custom-api-key',
  baseUrl: 'https://custom-api.com'
})
```

## TypeScript Types

All methods are fully typed. Import types:

```typescript
import type {
  TestapiClientConfig,
  TestapiClientResponse,
  TestapiClientError
} from './integrations/testapi'
```
