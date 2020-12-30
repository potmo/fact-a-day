"use strict";
const fs = require('fs-extra');
const path = require('path');
const renderer = require('./renderer');


run()
.then(()=>{
  console.log('done');
})
.catch((err)=>{
  console.error(`error: ${err.stack}`);
});

async function run() {

  let body = `
### header
This is some nice **facts**. This is also nice _right here_.

bannas This is a link here. [google](http://www.google.com)

<img width="123" alt="nisse" src="https://user-images.githubusercontent.com/1089422/103317427-6a283080-4a2b-11eb-9e4d-db9c5510e4ae.png">

> This is a quote

Inlined \`some code in here\` to show this and a ^[footnote right here yes].
We also have some "nice" quotes here. Some ^superscript^ and some ~subscript~

- Point
- - Sub point
- - Sub point
- Point
- Point

1. One
2. Two
3. Three
4. Four


- [ ] Non checked
- [x] checcked
- [ ] non checked
- [ ] non checked

Some emojis: 📦🏷🪧📪
`;

let body2 = `

<!--<figure>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Contemporaine_afb_jeanne_d_arc.png" alt="Trulli" style="width:100%">
  <figcaption>Fig.1 - Trulli, Puglia, Italy.</figcaption>
</figure>-->
<!--<img width="123" alt="jeanne_darc" src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Contemporaine_afb_jeanne_d_arc.png"/>-->

There is no known depiction or description of what __Joanne of Arc__^[French: Jeanne d'Arc, c. 1412 – 30 May 1431] looked like by anyone who saw her with their own eyes from when she was alive.

The earliest known picture of her is from May 10, 1429 by __Clément de Fauquembergue__ who, dispite never meeting her, made a doodle of her _from imagination_ in the margin of the parliamentary council register.

Joanne of Arc is also the only one that has been killed by the catholic church and later been canonizated by it^[16 May 1920 by Pope Benedict XV].

`;

let title = 'Joanne of Arc';

  await renderer.render(title, body2, './build');
}