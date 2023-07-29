// export async function onCopy (copyText = '', msg:string) {
//   try {
//     const Clip = clipBorad
//     const { toClipboard } = Clip()
//     await toClipboard(copyText)
//     notify({ cType: 'success', message: msg })
//   } catch (e) {
//     console.log(e)
//   }
// }

export function isNumeric (val: any) {
  return val !== null && val !== '' && !isNaN(val)
}

export function parseTime (time:any, cFormat?: string) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        time = parseInt(time)
      } else {
        // eslint-disable-next-line prefer-regex-literals
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  return format.replace(/{([ymdhisa])+}/g, (result, key) => {
    // @ts-ignore
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
}
