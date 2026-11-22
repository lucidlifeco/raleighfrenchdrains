# raleighfrenchdrains.com

A plain static site built with Eleventy. Pages are Markdown files in `src/`, and the template does the rest.

## Before launch
1. Phone: (984) 400-4942 (Twilio). The call flow is `twilio/call.js`, deployed as a Twilio Function at path `/call`. To send calls to a renter, change the `FORWARD_TO` environment variable in Twilio. The site doesn't change.
2. Optional: set `formEndpoint` to your form handler (CallRail form tracking, Formspree, etc.). If it's empty, the form stays hidden and only the call button shows.
3. Set up `info@raleighfrenchdrains.com` with Cloudflare Email Routing (free), forwarding to your inbox.
4. The privacy policy and terms are plain-language templates, not legal advice.

## Add a page
Copy any `.md` file in `src/`, change the front matter (`title`, `description`, `permalink`) and write the content. Commit and push, and Cloudflare Pages rebuilds automatically.

## Deploy on Cloudflare Pages
- Connect the GitHub repo in Cloudflare Pages
- Build command: `npm run build`
- Output directory: `_site`
- Add the custom domain `raleighfrenchdrains.com`

## Run locally
`npm install`, then `npm start` (serves at http://localhost:8080)

## Reuse for another market
Copy the repo, edit `src/_data/site.js` (name, url, city, region, phone, areas), and rewrite the page content for the new city. Never reuse page text word for word across sites.
