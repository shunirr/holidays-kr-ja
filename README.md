## holidays-kr-ja

This is a generating `.ics` script that registers South Korean holidays in Japanese.

And we provide generated `.ics` file on Github Pages.

If you want to check South Korean holidays in Japanese, you can use the below URL with your calendar app.

- https://shunirr.github.io/holidays-kr-ja/translated.ics

This program depends on https://github.com/hyunbinseo/holidays-kr

### How to process

1. Get holidays from the [hyunbinseo/holidays-kr](https://github.com/hyunbinseo/holidays-kr) repo using a submodule.
2. Translate the holidays name in `public/basic.json` to Japanese using the DeepL Translate API or predefined `assets/holidays_ko_ja.json` file.
3. Generate `translated.ics` and deploy it to GitHub Pages.

