<div align="center">

![Kirishima Banner](https://i.kagchi.my.id/kirishima-ship-banner.jpg)

# @kirishima/rest

</div>


# Features
- Written in TypeScript
- Support ESM & CommonJS

# Example 
```ts
import { REST } from "@kirishima/rest";

(async () => {
    const lavalinkRest = new REST("http://lava.link:80")
    .setAuthorization("youshallnotpass")

    const tracks = await lavalinkRest.loadTracks("never gonna give you up");
    console.log(tracks);
})()
