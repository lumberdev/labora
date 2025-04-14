# Sanity Project

This is a simple Sanity.io content management system (CMS) project for managing the content of a single-page website.

## Overview

This Sanity project contains a minimal setup with just one schema type that powers the entire website. The streamlined approach makes it easy to manage and update content without unnecessary complexity.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or later recommended)
- [pnpm](https://pnpm.io/) package manager


## Project Structure

```
sanity/
├── schemas/         # Content schemas
│   ├── index.js     # Schema entry point
│   └── page.js      # The single page schema
├── static/          # Static files
├── sanity.config.js # Sanity configuration
└── sanity.cli.js    # CLI configuration
```

## Content Schema

This project uses a single schema type to manage all the content for the website. The schema is designed to provide all necessary fields for the page content while keeping the structure simple and maintainable.

## Deployment

To deploy the Sanity Studio to production:

```bash
pnpm sanity deploy
```

This command will build and deploy the Sanity Studio to Sanity's hosted servers. After deployment, you'll receive a URL where your Sanity Studio is accessible.


## Additional Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity Exchange](https://www.sanity.io/exchange)
