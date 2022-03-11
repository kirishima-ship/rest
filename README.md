<div align="center">

![Kirishima Banner](https://cdn.discordapp.com/attachments/891939988088975372/931079377771450388/kirishima-ship-banner.png)

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

    const tracks = await lavalinkSocket.lavalinkRest("never gonna give you up");
    console.log(tracks);
})()