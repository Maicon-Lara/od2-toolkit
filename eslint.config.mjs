import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

// Reproduz o scan de revisão da loja do Obsidian: typescript-eslint "type-checked"
// (pega Promise/void e os acessos unsafe a `any`) + as regras do plugin oficial
// obsidianmd (builtin-modules, window.requestAnimationFrame etc.). As regras
// type-checked exigem informação de tipo, então o lint roda só sobre os .ts.
export default tseslint.config(
  { ignores: ["main.js", "node_modules/**", "**/*.mjs"] },
  ...tseslint.configs.recommendedTypeChecked,
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Desligada: força minúsculas em todo texto de UI, rebaixando siglas próprias
      // (OD2, ODO, Initiative Tracker) e quebrando a localização pt-BR. Não faz parte
      // do scan de revisão da loja.
      "obsidianmd/ui/sentence-case": "off",
      // Desligada: dispara falso-positivo em coerções intencionais de `unknown`/
      // frontmatter (String(x ?? "")). Também fora do scan de revisão da loja.
      "@typescript-eslint/no-base-to-string": "off",
    },
  },
);
