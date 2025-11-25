# Candy2 Theme (Hugo Version)

A beautiful, modern Hugo theme with glassmorphism effects and horizontal scrolling design. 

![Candy2 Hugo Theme](https://i.loli.net/2021/02/20/uzfTSEHPlFOeR4r.png)

## ✨ Features

- 🎨 **Glassmorphism Design** - Beautiful frosted glass effects with backdrop-filter
- 📜 **Horizontal Scrolling** - Unique horizontal card-based navigation on desktop
- 🎭 **Modal Post View** - Smooth modal animations for reading posts using View Transitions API
- 📱 **Fully Responsive** - Seamless experience on mobile and desktop
- ⚡ **Lightning Fast** - Static site generation with Hugo v0.152.2+
- 🎬 **Smooth Animations** - Scale-up, slide-in, and fade effects
- 🔖 **Tag Support** - Organize posts with tags
- 💎 **Original Visual Design** - All aesthetic elements preserved from Candy2

## 🚀 Quick Start

### Installation

1. **Install Hugo Extended** (v0.152.2 or later required):
```bash
# Check your Hugo version
hugo version

# Download Hugo Extended v0.152.2 if needed
# https://github.com/gohugoio/hugo/releases/tag/v0.152.2
```

2. **Add the theme to your Hugo site**:

   **Option A: Git Submodule (Recommended)**
   ```bash
   cd your-hugo-site
   git submodule add https://github.com/Archeb/candy2-hugo.git themes/candy2
   ```

   **Option B: Git Clone**
   ```bash
   cd your-hugo-site/themes
   git clone https://github.com/Archeb/candy2-hugo.git candy2
   ```

   **Option C: Download**
   - Download the [latest release](https://github.com/Archeb/candy2-hugo/releases)
   - Extract to `your-hugo-site/themes/candy2`

3. **Configure your site**:

   Update `hugo.toml` (or `config.toml`):
   ```toml
   baseURL = 'https://example.com/'
   languageCode = 'zh-CN'
   title = 'My Candy2 Blog'
   theme = 'candy2'

   [params]
     author = "Your Name"
     description = "Your site description"
     avatar = "/img/icon-circle.png"
     defaultImage = "/img/cover1.jpg"
     copyright = "© 2025"

   [[menu.main]]
     name = "文章"
     url = "/"
     weight = 1

   [[menu.main]]
     name = "技术"
     url = "/tags/tech/"
     weight = 2
     pre = ""

   [[menu.main]]
     name = "关于"
     url = "/about/"
     weight = 3

   [markup.goldmark.renderer]
     unsafe = true
   ```

4. **Start the development server**:
   ```bash
   hugo server
   ```

5. Visit `http://localhost:1313`

## 📝 Creating Content

### New Post

```bash
hugo new content posts/my-first-post.md
```

### Post Front Matter

```yaml
---
title: "My First Post"
date: 2024-11-24T10:00:00+08:00
draft: false
tags: ["tech", "hugo"]
image: "/img/cover1.jpg"
description: "A short description of your post"
---

Your content here in Markdown format...
```

### Required Front Matter Fields

- `title`: Post title
- `date`: Publication date
- `tags`: Array of tags (optional but recommended)
- `image`: Featured image URL (optional, uses defaultImage if not set)
- `description`: Short description for card preview

## 🎨 Customization

### Colors and Styling

Edit `static/css/style.css` to customize colors, animations, and effects.

### Menu Items

Add menu items in `hugo.toml`:

```toml
[[menu.main]]
  name = "Custom Page"
  url = "/custom/"
  weight = 4
  pre = "&#xe614;"  # Optional icon
```

### Avatar and Images

Place your images in `static/img/` and reference them in params:

```toml
[params]
  avatar = "/img/your-avatar.png"
  defaultImage = "/img/your-default-cover.jpg"
```

## 📁 Theme Structure

```
candy2/
├── archetypes/
│   └── default.md          # Content template
├── assets/
│   ├── css/
│   │   └── main.css        # Processed CSS
│   └── js/
│       └── main.js         # Theme JavaScript (if any)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html     # Base template
│   │   ├── list.html       # List page template
│   │   └── single.html     # Single post template (modal)
│   ├── index.html          # Homepage template
│   └── partials/
│       ├── head.html       # HTML head
│       ├── header.html     # Header section
│       ├── navigation.html # Sidebar navigation
│       └── footer.html     # Footer
├── static/
│   ├── css/
│   │   └── style.css       # Main stylesheet (690 lines)
│   ├── js/
│   │   └── candy2.js       # Interactive features
│   └── img/                # Theme images
├── exampleSite/            # Example site for testing
├── theme.toml              # Theme metadata
├── README.md               # This file
└── LICENSE                 # GPL-3.0 License
```

## 🎬 Interactive Features

### Bean-Main Scroll Behavior

The left navigation sidebar (bean-main) automatically shrinks from full width to mini size as you scroll horizontally, creating more space for article cards.

### Modal Post View

Clicking on a post card opens it in a modal overlay with:
- Smooth scale-up animation (0.7 → 1.0)
- View Transitions API for seamless navigation
- Scroll position preservation
- Browser history integration
- ESC key or close button to exit

### Post Slide-In Animation

Posts slide in from the right when you start scrolling and remain visible (don't fade back out).

## 🌐 Browser Support

- ✅ **Chrome/Edge 111+** - Full View Transitions API support
- ✅ **Firefox** - Graceful fallback for View Transitions
- ✅ **Safari** - Graceful fallback, may have limited backdrop-filter support
- ✅ **Mobile browsers** - Fully responsive with vertical scrolling

## 🔧 Build for Production

```bash
# Generate static site
hugo --minify

# Output will be in public/ directory
```

## 📦 ExampleSite

The theme includes an `exampleSite/` directory with:
- Sample configuration
- Example posts demonstrating features
- Proper content structure

To run the example site:

```bash
cd exampleSite
hugo server
```

## 🐛 Troubleshooting

### Posts not appearing

- Ensure `draft: false` in front matter
- Check that content is in `content/posts/` directory
- Verify `hugo.toml` has correct theme name: `theme = 'candy2'`

### Styles not loading

- Use Hugo Extended version (required for CSS processing)
- Clear browser cache
- Check browser console for errors

### Modal not working

- Verify JavaScript is enabled
- Check browser supports modern JavaScript features
- View Transitions API may not be available in all browsers (fallback provided)

## 🙏 Credits

- **Original Candy2 Theme**: [Archeb](https://github.com/Archeb) - Vue.js version
- **Hugo**: [GoHugo.io](https://gohugo.io) - Static site generator

## 📄 License

GPL-3.0 - See [LICENSE](LICENSE) file for details.

Inherits license from the original [Candy2 project](https://github.com/Archeb/Candy2).

## 📸 Screenshots

**Homepage with Horizontal Scrolling:**
![Homepage](https://github.com/user-attachments/assets/a2baddfb-fb5e-466b-9acc-9a6ceb8c7c37)

**Modal Post View:**
![Modal View](https://github.com/user-attachments/assets/e4a58d96-b40e-4ef3-9dc4-5f65e23ab7b1)

**Initial State:**
![Initial State](https://github.com/user-attachments/assets/8f4e3dd8-c66e-4833-988b-4bc23cee041c)

---

Made with ♥ using Hugo
