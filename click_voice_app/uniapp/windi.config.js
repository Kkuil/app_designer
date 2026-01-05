import {defineConfig} from 'windicss/helpers'

export default defineConfig({
    prefixer: false,
    preflight: false,
    extract: {
        // 明确指定要扫描的文件
        include: [
            'src/**/*.{vue,js,ts,jsx,tsx,html}',
            'index.html'
        ],
        exclude: ['node_modules', '.git', 'dist', 'unpackage']
    },
    safelist: [
        // 确保常用类名被包含（动态生成的类名）
        'bg-yellow-50',
        'bg-[#FDD403]',
        'text-[#FDD403]',
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FDD403"
            },
        }
    },
    corePlugins: {
        container: false
    }
})
