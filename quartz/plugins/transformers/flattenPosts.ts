import { QuartzTransformerPlugin } from "../types"
import { FilePath, FullSlug, slugifyFilePath } from "../../util/path"

/**
 * FlattenPosts
 *
 * Removes the leading `posts/` segment from any file that lives under the
 * `posts/` folder so that the generated slug lives at the root of the site
 * rather than under `/posts/...`.
 *
 * For backwards-compatibility, the original slug (with the `posts/` prefix)
 * is preserved as an alias so that any existing links will continue to work
 * via the `AliasRedirects` emitter.
 */
export const FlattenPosts: QuartzTransformerPlugin = () => {
  return {
    name: "FlattenPosts",
    markdownPlugins(ctx) {
      return [
        () => {
          return (_tree, file) => {
            const relPath: FilePath | undefined = file.data.relativePath
            if (!relPath) return

            // Only operate on notes that are inside the `posts/` directory
            if (relPath.startsWith("posts/") && relPath !== "posts/index.md") {
              const originalSlug = file.data.slug as FullSlug
              // Remove the leading "posts/" segment
              const newRelativePath = relPath.replace(/^posts\//, "") as FilePath
              const newSlug = slugifyFilePath(newRelativePath)

              // Update the canonical slug
              file.data.slug = newSlug

              // Ensure the old slug continues to resolve by keeping it as an alias
              const aliases = file.data.aliases ?? []
              aliases.push(originalSlug)
              file.data.aliases = aliases

              // Update global slug list so that other plugins (e.g. links) are aware of
              // the new canonical slug.
              const index = ctx.allSlugs.indexOf(originalSlug)
              if (index !== -1) {
                ctx.allSlugs.splice(index, 1)
              }
              ctx.allSlugs.push(newSlug)
            }
          }
        },
      ]
    },
  }
} 