"use strict";
const fs = require('fs-extra');
const markdown = require('markdown-it')({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     true,        // Use '/' to close single tags (<br />).
                              // This is only for full CommonMark compatibility.
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                              // useful for external highlighters.
  linkify:      true,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
  typographer:  true,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  highlight: function (/*str, lang*/) { return ''; }
}).use(require('markdown-it-footnote'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-sub'));



markdown.renderer.rules.footnote_caption = (tokens, idx) => {
  var n = Number(tokens[idx].meta.id + 1).toString();

  if (tokens[idx].meta.subId > 0) {
    n += ':' + tokens[idx].meta.subId;
  }

  return n;
}

markdown.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  return '';// '<a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
}


const path = require('path');

async function render(title, body, output_dir) {

  let html_body = markdown.render(body);

  let css = `
    html, body {
      margin: 0;
      height: 100%;
    }

    body {
      font-family: 'Source Serif Pro', serif;  
      font-weight: 300;
      background-color: rgb(255 253 252);
      color: rgb(53 56 115);
    }

    strong {
      font-weight: 400;
    }

    h1 {
      font-weight: 400;
    }

    .container {
      min-width: 100%;
      min-height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .content {  
      max-width: 40em;
      padding: 1em;
    }

    .footnotes {
      font-size: 0.7em;
    }

    .footnotes-list {
      padding-inline-start: 3em;
    }

    .footnotes-list p {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }

    .footnotes-list li {
      line-height: 1.3;
    }

    .footnotes-sep {
      border: 0;
      border-top: 1px solid #AAA;
    }

    h1 {
      margin: 0em;
    }

    img {
      display: block;
      float: right;
      margin: 1em;
    }

    figure {
      display: block;
      float: right;
      margin: 1em;
      max-width: 20%;
      max-height: 80%;
      margin: 1em;
    }

    figure img {
      display: inline-block;
      float: initial;
      margin: 0em;
      padding: 0;
      width: 100%;
    }

    figcaption {
      font-size: 0.7em;
    }

    .footnote-ref a:link {
      color: black;
    }

    .footnote-ref a:visited {
      color: black;
    }

    .footnote-ref a:hover {
      color: black;
    }

    .footnote-ref a:active {
      color: black;
    }

    .footnote-ref a {
      text-decoration: inherit;
      font-size: 0.7em;
      margin-left: 0.2em;
    }

    `


  let html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-1K6QRZ9L23"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-1K6QRZ9L23');
      </script>
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
        <title>${title}</title>
        <style>
        ${css} 
        </style>
      </head>
      <body>
        <div class='container'>
          <div class='content'>
            <h1>${title}</h1>
            ${html_body}
          </div>
        </div>
      </body>
    </html>
    `

  await fs.ensureDir(output_dir)
  let index = path.resolve(output_dir, 'index.html');
  await fs.writeFile(index, html, {encoding: 'utf8'});

}

module.exports = {render}


