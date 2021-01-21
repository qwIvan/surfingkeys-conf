const util = require("./util")
const keys = require("./keys")
const completions = require("./completions")

// ---- Settings ----//
util.addSettings({
  hintAlign:                "left",
  omnibarSuggestionTimeout: 500,
  richHintsForKeystroke:    1,
  theme:                    `
    body {
      font-family: "DejaVu Sans", DejaVu, Arial, sans-serif;
    }

    /* Disable RichHints CSS animation */
    .expandRichHints {
        animation: 0s ease-in-out 1 forwards expandRichHints;
    }
    .collapseRichHints {
        animation: 0s ease-in-out 1 forwards collapseRichHints;
    }
  `,
  language: "zh-CN",
})

if (typeof Hints !== "undefined") {
  Hints.characters = "qwertasdfgzxcvb"
}

// Leader for site-specific mappings
const siteleader = "<Space>"

// Leader for OmniBar searchEngines
const searchleader = "a"

// Process mappings and completions
// See ./keys.js and ./completions.js
util.rmMaps(keys.unmaps.mappings)
util.rmSearchAliases(keys.unmaps.searchAliases)
util.processMaps(keys.maps, keys.aliases, siteleader)
util.processCompletions(completions, searchleader)

module.exports = { siteleader, searchleader }

Front.registerInlineQuery({
  url(q) {
    return `http://dict.youdao.com/w/eng/${q}/#keyfrom=dict2.index`
  },
  parseResult(res) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(res.text, "text/html")
    const collinsResult = doc.querySelector("#collinsResult")
    const authTransToggle = doc.querySelector("#authTransToggle")
    const examplesToggle = doc.querySelector("#examplesToggle")
    if (collinsResult) {
      collinsResult.querySelectorAll("div>span.collinsOrder").forEach((span) => {
        span.nextElementSibling.prepend(span)
      })
      collinsResult.querySelectorAll("div.examples").forEach((div) => {
        // eslint-disable-next-line no-param-reassign
        div.innerHTML = div.innerHTML.replace(/<p/gi, "<span").replace(/<\/p>/gi, "</span>")
      })
      const exp = collinsResult.innerHTML
      return exp
    } if (authTransToggle) {
      authTransToggle.querySelector("div.via.ar").remove()
      return authTransToggle.innerHTML
    } if (examplesToggle) {
      return examplesToggle.innerHTML
    }
    return ""
  },
})
