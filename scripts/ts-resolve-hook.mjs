// Node で src/lib/*.ts をそのまま実行するための解決フック。
// Node 24 は .ts を直接実行できるが、ESM の仕様上「拡張子なしの相対 import」を解決できない。
// src 側は Next.js/TypeScript の作法どおり拡張子なしで書いてあるので、
// 解決に失敗したときだけ ".ts" を補って再試行する（テスト実行専用。本番ビルドには一切関与しない）。
//
// 使い方: node --import ./scripts/ts-resolve-hook.mjs scripts/test-line-ack.ts
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier)) {
      try {
        return nextResolve(specifier, context);
      } catch {
        return nextResolve(specifier + ".ts", context);
      }
    }
    return nextResolve(specifier, context);
  },
});
