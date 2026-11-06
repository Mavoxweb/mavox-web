import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTs,
  {
    // Dívida técnica de estilo/performance: aviso, não bloqueia. Bugs reais
    // (rules-of-hooks etc.) continuam como erro.
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];
