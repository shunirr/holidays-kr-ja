## holidays-kr-ja

If you want to check South Korean holidays in Japanese, you can use the URL `https://shunirr.github.io/holidays-kr-ja/translated.ics` with your calendar app.

This generates a `.ics` file that registers South Korean holidays in Japanese.

- Original repository: https://github.com/hyunbinseo/holidays-kr

### How to process

1. Get holidays from the [hyunbinseo/holidays-kr](https://github.com/hyunbinseo/holidays-kr) repo using a submodule.
2. Translate the `SUMMARY` section in `public/basic.ics` to Japanese using the DeepL Translate API.
3. Generate `translated.ics` and deploy it to GitHub Pages.
