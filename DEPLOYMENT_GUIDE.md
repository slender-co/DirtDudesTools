# Deploying the Bid Tool to the Web

This guide walks you through putting the bid tool online so you (and others) can use it in a browser at your own domain. We’ll use **Netlify** for hosting (free and simple) and your existing **GoDaddy** domain.

---

## What You’ll End Up With

- The app live at a URL like **https://tools.dirtdudesexcavating.com** (or another subdomain you choose).
- Free hosting, free SSL (HTTPS), and the ability to update the site by re-deploying.

---

## Prerequisites

1. **Node.js** on your computer (so you can build the app).  
   - If you don’t have it: https://nodejs.org — install the LTS version.  
   - Check: open a terminal and run `node -v`; you should see a version number.

2. **A Netlify account** (free).  
   - Sign up at https://www.netlify.com (e.g. “Sign up” with email or GitHub).

3. **Your GoDaddy login** for dirtdudesexcavating.com.

---

## Step 1: Build the App on Your Computer

1. Open a terminal (Command Prompt, PowerShell, or Terminal on Mac).

2. Go into the bid tool folder:
   ```bash
   cd "C:\Users\Bradley Slender\Desktop\Dirt Dudes Tools\arno-bid-tool"
   ```
   (If your path is different, use that path.)

3. Install dependencies (only needed once, or after you add new packages):
   ```bash
   npm install
   ```

4. Create the production build:
   ```bash
   npm run build
   ```

5. When it finishes, you’ll have a **`dist`** folder. That folder is your whole website. Netlify will host the contents of this folder.

---

## Step 2: Put the Site on Netlify (First Time)

### Option A: Drag and drop (simplest)

1. Log in at https://app.netlify.com  
2. On the main dashboard, find the area that says **“Drag and drop your site output folder here”** or **“Add new site” → “Deploy manually”**.  
3. Open File Explorer and go to:
   `C:\Users\Bradley Slender\Desktop\Dirt Dudes Tools\arno-bid-tool`  
4. Drag the **`dist`** folder (the one created by `npm run build`) onto the Netlify drop zone.  
5. Wait for the deploy to finish. Netlify will give you a random URL like `https://random-name-12345.netlify.app`.  
6. Click that URL to confirm the bid tool loads.

You now have a live site. Next, we’ll attach your domain.

### Option B: Deploy with Git (good for updates)

If your project is in a Git repo (e.g. GitHub):

1. Push your code to GitHub (if you haven’t already).  
2. In Netlify: **Add new site** → **Import an existing project**.  
3. Choose **GitHub**, authorize Netlify, and select the repo that contains `arno-bid-tool` (or the repo root if the app is the whole repo).  
4. Set **Build command** to: `npm run build`  
5. Set **Publish directory** to: `dist`  
6. Click **Deploy site**.

After this, every time you push to that repo, Netlify can auto-build and update the site.

---

## Step 3: Use Your GoDaddy Domain (e.g. tools.dirtdudesexcavating.com)

Using a **subdomain** keeps your main site (dirtdudesexcavating.com) separate and is recommended. Example: **tools.dirtdudesexcavating.com** for the bid tool.

### 3.1 Add the domain in Netlify

1. In Netlify, open your site (the one you just deployed).  
2. Go to **Site configuration** (or **Domain settings**) → **Domain management** → **Add custom domain** (or **Add domain alias**).  
3. Type: **tools.dirtdudesexcavating.com** (or the subdomain you want).  
4. Click **Verify** / **Add**.  
5. Netlify will show you what to do in GoDaddy (usually add a **CNAME** record). Keep that Netlify screen open.

### 3.2 Point the subdomain in GoDaddy

1. Log in at https://www.godaddy.com and go to **My Products**.  
2. Click **DNS** (or **Manage DNS**) for **dirtdudesexcavating.com**.  
3. Add a new record:
   - **Type:** CNAME  
   - **Name:** `tools` (so the full name is tools.dirtdudesexcavating.com)  
   - **Value:** the Netlify hostname they gave you, e.g. `random-name-12345.netlify.app` (no `https://`, just the hostname).  
   - **TTL:** 600 or default.  
4. Save.

### 3.3 SSL (HTTPS)

1. Back in Netlify, under **Domain management**, Netlify will issue a free SSL certificate for tools.dirtdudesexcavating.com.  
2. Wait 5–15 minutes (sometimes up to 24 hours) for DNS to update.  
3. When DNS has propagated, Netlify will show “HTTPS” and the padlock. You can then open **https://tools.dirtdudesexcavating.com** and use the bid tool over HTTPS.

---

## Step 4: If You Want the Bid Tool on the Main Domain (dirtdudesexcavating.com)

If you want the bid tool to be the **only** thing at dirtdudesexcavating.com (no separate main website):

1. In Netlify, add **dirtdudesexcavating.com** as a custom domain (and optionally **www.dirtdudesexcavating.com**).  
2. In GoDaddy DNS for dirtdudesexcavating.com, Netlify will usually ask for:
   - **A** record: Name `@`, Value Netlify’s load balancer IP (e.g. `75.2.60.5` — Netlify will show the exact IP).  
   - **CNAME** for `www`: Name `www`, Value your-site.netlify.app.  
3. Save and wait for DNS. Netlify will then serve your bid tool at https://dirtdudesexcavating.com.

If you **already have a main site** at dirtdudesexcavating.com (e.g. on GoDaddy Website Builder or another host), keep that as is and use a **subdomain** (e.g. tools.dirtdudesexcavating.com) for the bid tool so you don’t replace the main site.

---

## Step 5: Updating the Live Site Later

- **If you used drag-and-drop:**  
  Run `npm run build` again, then in Netlify use **Deploys** → **Drag and drop** and upload the new **`dist`** folder.

- **If you connected Git:**  
  Push your changes to GitHub; Netlify will build and deploy automatically (if you left that enabled).

---

## Things to Be Aware Of

1. **Data stays in the browser**  
   Projects and data are stored in **localStorage** on the device. So:
   - Each computer/browser has its own set of projects.  
   - Clearing site data or using a different browser/device means that data isn’t there unless you’ve exported it.

2. **Who can access**  
   Anyone with the URL can open the site. If you need login or private access later, you’d add something like Netlify Password Protection or a simple auth layer (not covered here).

3. **Backups**  
   Use the app’s export/save features and any project backups you already do so you don’t rely only on one browser’s localStorage.

---

## Quick Reference

| Step | What to do |
|------|------------|
| 1 | `npm install` then `npm run build` in `arno-bid-tool` |
| 2 | In Netlify, deploy the `dist` folder (drag-and-drop or via Git) |
| 3 | In Netlify, add custom domain (e.g. tools.dirtdudesexcavating.com) |
| 4 | In GoDaddy DNS, add CNAME for `tools` → your-site.netlify.app |
| 5 | Wait for DNS and SSL; open https://tools.dirtdudesexcavating.com |

If you tell me whether you prefer drag-and-drop or Git, and whether you want a subdomain (e.g. tools) or the main domain, I can give you the exact Netlify and GoDaddy clicks for your case.
