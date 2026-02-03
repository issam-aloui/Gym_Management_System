# Environment Configuration

## Production Deployment

When deploying to production (e.g., Render), update the `BASE_URL` in your environment variables:

```env
BASE_URL=https://your-app-name.onrender.com
NODE_ENV=production
```

## Local Development

For local development, the default configuration is:

```env
BASE_URL=http://localhost:5000
NODE_ENV=development
```

## How It Works

1. **Backend**: The `BASE_URL` environment variable is set in `/back_end/.env`
2. **Frontend**: All API calls now use relative paths (e.g., `/auth/login` instead of `http://localhost:5000/auth/login`)
3. **API Config Endpoint**: A `/api/config` endpoint provides configuration to the frontend if needed
4. **Config Script**: `/front_end/scripts/config.js` can be used for advanced URL handling

## Files Updated

- `.env` - Added `BASE_URL` variable
- `serve-front.js` - Added `/api/config` endpoint
- All frontend scripts - Changed to use relative paths:
  - `login.js`
  - `signup.js`
  - `card.js`
  - `creategym.js`
  - `accountdeletion.js`
  - `datachange.js`
  - `joingym.js`
  - `ownerjs/scanqrcode.js`
  - `ownerjs/Myreviews.js`
  - `ownerjs/Myannouncements.js`

## Testing

Test both environments:

```bash
# Development
docker-compose up --build

# Set production URL in .env and test
BASE_URL=https://your-production-url.com
```
