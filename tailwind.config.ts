import type { Config } from "tailwindcss";
import catppuccin from "@catppuccin/tailwindcss";
import typography from "@tailwindcss/typography";

let accent = "blue";
let linkColor = "yellow";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.ctp-text.DEFAULT"),
            "--tw-prose-headings": theme(`colors.ctp-text.DEFAULT`),
            "--tw-prose-lead": theme("colors.ctp-text.DEFAULT"),
            "--tw-prose-links": theme(`colors.ctp-${linkColor}.DEFAULT`),
            "--tw-prose-bold": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-counters": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-bullets": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-hr": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-quotes": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-quote-borders": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-captions": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-code": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-pre-code": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-pre-bg": theme(`colors.ctp-mantle.DEFAULT`),
            "--tw-prose-th-borders": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-td-borders": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-body": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-headings": theme("colors.white"),
            "--tw-prose-invert-lead": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-links": theme("colors.white"),
            "--tw-prose-invert-bold": theme("colors.white"),
            "--tw-prose-invert-counters": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-bullets": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-hr": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-quotes": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-quote-borders": theme(
              `colors.ctp-${accent}.DEFAULT`,
            ),
            "--tw-prose-invert-captions": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-code": theme("colors.white"),
            "--tw-prose-invert-pre-code": theme(`colors.ctp-${accent}.DEFAULT`),
            "--tw-prose-invert-pre-bg": "rgb(0 0 0 / 50%)",
            "--tw-prose-invert-th-borders": theme(
              `colors.ctp-${accent}.DEFAULT`,
            ),
            "--tw-prose-invert-td-borders": theme(
              `colors.ctp-${accent}.DEFAULT`,
            ),
          },
        },
      }),
    },
  },

  safelist: [
    "ctp-latte",
    "ctp-frappe",
    "ctp-macchiato",
    "ctp-mocha",
  ],

  plugins: [
    catppuccin({
      prefix: "ctp",
    }),
    typography,
  ],
} satisfies Config;
