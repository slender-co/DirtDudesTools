# Repo setup – Dirt Dudes Tools

## What’s done

- **`.gitignore`** added so `node_modules/`, `dist/`, and other generated files are not committed.

## What we need from you

**Your GitHub repo URL** – e.g. one of:

- `https://github.com/YourUsername/dirt-dudes-tools.git`
- `git@github.com:YourUsername/dirt-dudes-tools.git`

(Replace `YourUsername` and repo name with yours.)

---

## Option 1: Connect this folder in GitHub Desktop (recommended)

1. **Open GitHub Desktop.**

2. **Add this folder as a repo:**
   - **File → Add local repository…**
   - Browse to: `C:\Users\Bradley Slender\Desktop\Dirt Dudes Tools`
   - If it says “this directory does not appear to be a Git repository”:
     - Click **“create a repository”** (or use Option 2 below to init from terminal first, then Add again).

3. **If you had to create the repo in GitHub Desktop:**
   - **Repository → Publish repository**
   - Choose name, uncheck “Keep this code private” if you want it public, then **Publish**.

4. **If the repo already exists on GitHub:**
   - **Repository → Add remote…** (or **Repository → Repository settings**)
   - Remote name: `origin`
   - URL: your GitHub repo URL (e.g. `https://github.com/YourUsername/dirt-dudes-tools.git`)
   - Then **Repository → Push** (you may need to make an initial commit first).

---

## Option 2: Initialize Git from terminal, then use GitHub Desktop

Run in terminal (from this folder):

```bash
cd "c:\Users\Bradley Slender\Desktop\Dirt Dudes Tools"
git init
git add .
git commit -m "Initial commit: retaining wall bid tool"
```

Then in **GitHub Desktop**: **File → Add local repository…** and choose this folder.  
Then add your GitHub repo as remote and push (see step 4 in Option 1).

---

## Making changes with GitHub Desktop

- **Commit:** After editing files, open GitHub Desktop. Changed files appear in the left column. Add a summary (and optional description), then click **Commit to main**.
- **Push:** To send commits to GitHub: **Repository → Push** (or Ctrl+P).
- **Pull:** To get changes from GitHub: **Repository → Pull** (or Ctrl+Shift+P).
- **Branches:** Use the **Current Branch** dropdown to create or switch branches if you want separate lines of work.

Once you have the repo connected, you can customize the bid tool and use GitHub Desktop to commit and push as you go.
