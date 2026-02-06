import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Fix script loading for file:// protocol - IIFE format, move script to end of body
// Only apply to production builds
function fixScriptLoadingPlugin(): any {
  return {
    name: 'fix-script-loading',
    apply: 'build' as const,
    transformIndexHtml(html: string) {
      // Remove type="module" and crossorigin for file:// compatibility
      let result = html
        .replace(/\s+type="module"/g, '')
        .replace(/\s+crossorigin/g, '')

      // Move script tag from head to end of body (before closing body tag)
      // Match script tag in head
      const scriptMatch = result.match(
        /<script[^>]*src="[^"]*"[^>]*><\/script>/,
      )
      if (scriptMatch) {
        // Remove script from head
        result = result.replace(scriptMatch[0], '')
        // Add script before closing body tag
        result = result.replace('</body>', `${scriptMatch[0]}\n  </body>`)
      }

      return result
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'TimeCal',
      },
    },
  },
  plugins: [react(), fixScriptLoadingPlugin()],
})
