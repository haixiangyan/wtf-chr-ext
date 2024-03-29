function Panel() {
    this.create()
    this.bind()
}

Panel.prototype.create = function () {
    let html = `<div class="_panel_h">Definition of Abbreviation<span class="close">X</span></div>
      <div class="_panel_m">
        <div class="source">
          <div class="title">Abbreviation</div>
          <div class="content"></div>
        </div>
        <div class="dest">
          <div class="title">Definition</div>
          <div class="content">...</div>
        </div>
      </div>`

    let container = document.createElement('div')
    container.innerHTML = html
    container.classList.add('_panel')

    document.body.appendChild(container)

    this.container = container
}

Panel.prototype.bind = function () {
    this.container.querySelector('.close').onclick = () => {
        this.container.classList.remove('show')
    }
}

Panel.prototype.show = function () {
    this.container.classList.add('show')
}
Panel.prototype.hide = function () {
    this.container.classList.remove('show')
}

Panel.prototype.translate = function (raw, pos) {
    if (pos) {
        this.show()
        this.setPos(pos)
    }

    let fromValue = 'en'
    let toValue = 'zh-CN'

    this.container.querySelector('.source .content').innerText = raw

    chrome.storage.sync.get(['from', 'to'], (result) => {
        if (result.from) {
            fromValue = result.from.value
            this.container.querySelector('.source .title').innerText = result.from.key
        }
        if (result.to) {
            toValue = result.to.value
            this.container.querySelector('.dest .title').innerText = result.to.key
        }

        const userId = '7241'
        const token = 'lNsBjsSApKzOvOaM'

        fetch(`https://www.abbreviations.com/services/v2/abbr.php?uid=${userId}&tokenid=${token}&term=${raw}&format=json`)
            .then(res => res.json())
            .then(result => {
                this.container.querySelector('.dest .content').innerText = result.result[0].definition
            })
    })
}

Panel.prototype.setPos = function (pos) {
    this.container.style.left = pos.x + 'px'
    this.container.style.top = pos.y + 'px'
}

document.onclick = function (e) {
    let selectStr = window.getSelection().toString().trim()
    if (selectStr === '') {
        panel.hide()
        return
    }

    if (panelSwitch === 'off') {
        panel.hide()
        return
    }

    panel.translate(selectStr, {
        x: e.clientX,
        y: e.clientY
    })
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension")
        if (request.switch)
            panelSwitch = request.switch
            sendResponse('ok')
    })

chrome.storage.sync.get(['switch'], (result) => {
    if (result.switch) {
        panelSwitch = result.switch
    }
})

let panel = new Panel()
let panelSwitch = 'on'
