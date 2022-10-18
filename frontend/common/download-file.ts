export function downloadTextFile(name: string, content: string) {
    const file = new Blob(content.split('/n'), { type: 'text/plain' })

    const element = document.createElement('a')
    element.href = URL.createObjectURL(file)
    element.download = name + '.txt'

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
