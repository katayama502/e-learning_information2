import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-cache, no-store, must-revalidate",
                    },
                ],
            },
            {
                // Pyodide (WebAssembly / SharedArrayBuffer) requires COOP + COEP
                source: "/joho2/:path*",
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin",
                    },
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "credentialless",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
