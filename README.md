# Computer Modern Webfonts

This is an NPM package that contains the Computer Modern fonts in webfont format (WOFF2 and TTF, because modern browsers don't really need much else).

## Licensing and Attribution

The Computer Modern fonts are licensed under the SIL Open Font License. See the [SIL Open Font License](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL) for details. This package merely provides the fonts in a different format, and is not a derivative work. The original font files can be downloaded from [SourceForge](https://cm-unicode.sourceforge.io/).

## Usage

This package breaks the fonts down based on family. The most common one is CMU Serif.

```css
/* Import all Computer Modern fonts */
@import "computer-modern/index.css";

/* Import individual families */
@import "computer-modern/cmu-bright.css";
@import "computer-modern/cmu-classical-serif.css";
@import "computer-modern/cmu-concrete.css";
@import "computer-modern/cmu-sans-serif-demi-condensed.css";
@import "computer-modern/cmu-sans-serif.css";
@import "computer-modern/cmu-serif-extra.css";
@import "computer-modern/cmu-serif-upright-italic.css";
@import "computer-modern/cmu-serif.css"; /* ← most common! */
@import "computer-modern/cmu-typewriter-text-variable-width.css";
@import "computer-modern/cmu-typewriter-text.css";
```

Depending on what fonts you import, you can use them like this:

```css
.example-selector {
  font-family: "CMU Bright";
  font-family: "CMU Classical Serif";
  font-family: "CMU Concrete";
  font-family: "CMU Sans Serif";
  font-family: "CMU Sans Serif Demi Condensed";
  font-family: "CMU Serif";
  font-family: "CMU Serif Extra";
  font-family: "CMU Serif Upright Italic";
  font-family: "CMU Typewriter Text";
  font-family: "CMU Typewriter Text Variable Width";
}
```