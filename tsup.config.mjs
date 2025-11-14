import { defineConfig } from "tsup"
import Metadata from "./package.json"

export default defineConfig({
    entry: ["./source/index.ts"],
    clean: true,
    dts: true,
    format: ["cjs","esm"],
    target: "esnext",
    platform: "neutral",
    noExternal: Object.keys(Metadata?.dependencies ?? []),
    define: {
        PKG_NAME: JSON.stringify(Metadata.name),
        PKG_VERSION: JSON.stringify(Metadata.version)
    }
})