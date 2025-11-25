# Candy2 Theme Example Site

This is an example site for the Candy2 Hugo theme.

## Running the Example Site

### Option 1: From exampleSite directory

```bash
cd exampleSite
hugo server --themesDir ../..
```

Visit `http://localhost:1313`

### Option 2: Copy to your Hugo site

1. Copy the theme to your Hugo site's themes directory:
   ```bash
   cp -r path/to/candy2-hugo your-hugo-site/themes/candy2
   ```

2. Copy example content and configuration:
   ```bash
   cp exampleSite/hugo.toml your-hugo-site/
   cp -r exampleSite/content/* your-hugo-site/content/
   ```

3. Run Hugo:
   ```bash
   cd your-hugo-site
   hugo server
   ```

## What's Included

- **Configuration**: `hugo.toml` with theme settings
- **Sample Posts**: 2 blog posts demonstrating various features
- **About Page**: Example static page
- **Tags**: Posts are tagged for demonstration

## Customization

Edit `hugo.toml` to customize:
- Site title and description
- Author information
- Menu items
- Theme parameters (avatar, default images, etc.)

For more information, see the [main README](../README.md).
