#  Lanyard.js

Simple wrapper to interface with [Lanyard](https://github.com/phineas/lanyard)'s socket service.

## Add dependency
```
yarn add lanyard.js
```

## Use
```js
import { Lanyard } from "lanyard.js";

const lanyard = new Lanyard({ subscribe_to_ids: ["369752813577961472"] });

lanyard.on("ready", () => {
  console.log("Connected");
});

lanyard.on("init", async (state) => {
  console.log(state);
});

lanyard.on("PRESENCE_UPDATE", (presence) => {
  console.log(presence);
});

// Make regular request
(async () => {
  const response = await lanyard.get("36752813577961472");
  if ("error" in response) {
    return console.log("Error> " + response.error.message);
  }
  console.log(response.data);
})();
```

## Acknowledgements
* [Phineas](https://github.com/phineas) - Author of Lanyard
* [Alistair](https://github.com/alii) - Types for this lib
* [Rob](https://github.com/robjmorrissey) - Creator of this library
* [Looskie](https://github.com/looskie) - Fixed Ali's name
