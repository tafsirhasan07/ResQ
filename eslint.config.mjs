import { globalIgnores } from "eslint/config";
import nextCoreVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];

export default eslintConfig;