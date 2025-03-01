module.exports = {
  extends: [
    "next/core-web-vitals", // Next.js recommended rules
    "plugin:tailwindcss/recommended", // Tailwind CSS linting
    "prettier", // Disables conflicting ESLint rules with Prettier
  ],
  plugins: ["tailwindcss"], // Add Tailwind CSS plugin
  rules: {
    // Add custom rules here if necessary
  },
};
