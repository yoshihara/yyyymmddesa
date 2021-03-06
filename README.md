# yyyymmddesa

[![CircleCI](https://circleci.com/gh/yoshihara/yyyymmddesa.svg?style=svg)](https://circleci.com/gh/yoshihara/yyyymmddesa)

Tiny tools for daily report in [esa.io](https://esa.io).

![screen_shot](https://github.com/yoshihara/yyyymmddesa/blob/master/screenshot.png)

With this extension, you opened a post in esa.io having `yyyy/mm/dd` category, it shows links to esa.io's posts created at previous/next date by opened post's author.

## How to use

1. Open options page
1. Get esa.io token, and save it in options page
1. :)

## Troubleshooting

1. Clear cache in options page
1. Report to issue with debug log
    1. Put Debug mode is on in options page
    1. Open the page in esa.io
    1. Copy logs in developer tools
    1. Please create issue with it

## develop

```sh
$ npm install
$ npm run build
$ npm run watch
```

### update packages

```sh
$ npm install -g npm-check-updates
$ ncu -u
$ npm update
```
