/** @type {import('next').NextConfig} */
const nextConfig = {
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // ヘッダーはnetlify.tomlで管理（COOP/COEPはNetlify側で設定）
};

export default nextConfig;
