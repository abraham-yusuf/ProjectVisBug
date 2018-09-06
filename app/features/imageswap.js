import $ from 'blingblingjs'
import { htmlStringToDom } from './utils'

let imgs      = []
  , overlays  = []

export function watchImagesForUpload() {
  imgs = $('img')

  clearWatchers(imgs)
  initWatchers(imgs)
}

const initWatchers = imgs => {
  imgs.on('dragover', onDragEnter)
  imgs.on('dragleave', onDragLeave)
  document.addEventListener('drop', onDrop)
}

const clearWatchers = imgs => {
  imgs.off('dragenter', onDragEnter)
  imgs.off('dragleave', onDragLeave)
  document.removeEventListener('drop', onDrop)
  imgs = []
}

const previewFile = file => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => resolve(reader.result)
  })
}

const onDragEnter = e => {
  e.preventDefault()
  const pre_selected = $('img[data-selected=true]')

  if (!pre_selected.length && e.target.nodeName === 'IMG')
    showOverlay(e.target, 0)
  else
    pre_selected.forEach((img, i) =>
      showOverlay(img, i))
}

const onDragLeave = e => 
  hideOverlays()

const onDrop = async e => {
  e.preventDefault()

  const selectedImages = $('img[data-selected=true]')

  const srcs = await Promise.all(
    [...e.dataTransfer.files].map(previewFile))
  
  if (!selectedImages.length && e.target.nodeName === 'IMG')
    e.target.src = srcs[0]
  else if (selectedImages.length) {
    let i = 0
    selectedImages.forEach(img => {
      img.src = srcs[i++]
      if (i >= srcs.length) i = 0
    })
  }
  else {
    e.stopPropagation()
    e.preventDefault()
  }

  hideOverlays()
}

const showOverlay = (node, i) => {
  const { x, y, width, height, top, left } = node.getBoundingClientRect()
  const overlay = overlays[i]

  if (overlay) {
    overlay.style.display = 'block'
    overlay.children[0].setAttribute('width', width + 'px')
    overlay.children[0].setAttribute('height', height + 'px')
    overlay.children[0].setAttribute('x', left)
    overlay.children[0].setAttribute('y', top)
  }
  else {
    overlays[i] = htmlStringToDom(`
      <svg 
          class="pb-overlay"
          overlay-id="${i}"
          style="
            display:none;
            position:absolute;
            top:0;
            left:0;
            overflow:visible;
            pointer-events:none;
            z-index: 999;
          " 
          width="${width}px" height="${height}px" 
          viewBox="0 0 ${width} ${height}" 
          version="1.1" xmlns="http://www.w3.org/2000/svg"
        >
          <rect 
            fill="hsla(330, 100%, 71%, 0.5)"
            width="100%" height="100%"
          ></rect>
        </svg>
    `)

    document.body.appendChild(overlays[i])
  }
}

const hideOverlays = () => {
  overlays.forEach(overlay =>
    overlay.remove())
  overlays = []
}