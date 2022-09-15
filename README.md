# JS MOVE PLAYGROUND

Wrapper [move playground by pontem](https://playground.pontem.network/). Only support Browser environment.

## Demo

[imcoding.online](https://imcoding.online)

## Install

```shell
npm i @imcoding.online/js-move-playground
```

## Use

```typescript
import { setup, openProject } from "@imcoding.online/js-move-playground";

// must setup first
await setup();

// create or open project
const demo = await openProject("demo");

// create or open module
const module = demo.openModule("math.move");
demo.setContent(module, `
module 0x01::Math {
  public fun sum(a: u64, b: u64): u64 {
      a + b
  }
}
  `);

// create or open script
let script = demo.openScript("plus.move");
demo.setContent(script, `
script {
   use 0x01::Math::sum;

   fun plus(a: u64, b: u64) {
     assert!(sum(a, b) == 15, 101);
   }
}
`);

await demo.runScript("plus(10, 5)"); // execute success

await demo.runScript("plus(8, 3)"); // throw Error

// rename file
script = demo.renameFile(script, "plus_v2.move");

// remove file
demo.removeFile(script);

// remove project
await demo.remove();
```