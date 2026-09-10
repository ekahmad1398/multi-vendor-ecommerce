# Multi-Vendor E-Commerce

Full-stack e-commerce application with a Next.js frontend and an Express/MongoDB API.

## Project Structure

- `client/`: Next.js frontend.
- `server/`: Express API, authentication, MongoDB models, uploads, and email services.

## Local Setup

1. Install dependencies in both workspaces:

	```bash
	npm install --prefix server
	npm install --prefix client
	```

2. Copy `server/.env.example` to `server/.env` and fill in the required values.
3. Create `client/.env.local` with:

	```env
	NEXT_PUBLIC_API_URL=http://localhost:30001/api
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
	```

4. Start the API and frontend in separate terminals:

	```bash
	npm run dev --prefix server
	npm run dev --prefix client
	```

## Deployment

- Deploy `client` as a Vercel project with `client` as its Root Directory.
- Set `NEXT_PUBLIC_API_URL` to the deployed API URL ending in `/api`.
- Deploy `server` separately as a Node.js service. Set `CLIENT_URL` to the Vercel URL and configure all variables from `server/.env.example` in the hosting provider.
- Never commit `.env`, `.env.local`, database credentials, JWT secrets, or Cloudinary secrets.

Public routes include `GET /api/products`, `GET /api/categories`, and authentication routes under `/api/auth`. Product search supports `keyword`, `category`, `minPrice`, `maxPrice`, `page`, and `limit` query parameters.
