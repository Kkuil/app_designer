import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import WindiCSS from 'vite-plugin-windicss';
import MiniProgramTailwind from '@dcasia/mini-program-tailwind-webpack-plugin/rollup';
import uniTailwind from '@uni-helper/vite-plugin-uni-tailwind';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
        // WindiCSS 需要在 uni 插件之后，确保样式能被正确提取
        WindiCSS({
            scan: {
                dirs: ['./src'],
                fileExtensions: ['vue', 'js', 'ts', 'jsx', 'tsx'],
            },
        }),
        // uniTailwind 主要用于 Tailwind，如果使用 WindiCSS 可以注释掉
        // uniTailwind(),
        // MiniProgramTailwind 主要用于小程序
        // MiniProgramTailwind()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // 确保 scss 变量可以正常使用
                additionalData: `@import "@/uni.scss";`
            }
        }
    },
    build: {
        // 确保 CSS 被正确提取和打包
        cssCodeSplit: false,
        minify: 'terser',
    }
});
