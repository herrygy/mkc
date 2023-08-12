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
import { dayjs } from 'element-plus'
export function isNumeric (val: any) {
  return val !== null && val !== '' && !isNaN(val)
}
export function formatBrazilTime (time, isZero = false) {
  if (!time) return null
  if (isZero) {
    time = new Date(time).getTime() - (3 * 60 * 60 * 1000)
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }
  return dayjs(time).tz('Brazil/East').format('YYYY-MM-DD HH:mm:ss')
}
export function parseTime (time:any, cFormat?: string, isBrazil: boolean = false) {
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
export function fixedNumber (num:any, decimals = 2) {
  if (!isNumeric(num)) return num
  const numStrArray = num.toString().split('.')
  if (decimals === 0) return numStrArray[0]
  if (numStrArray.length > 1) {
    if (numStrArray[1].length >= decimals) {
      return `${numStrArray[0]}.${numStrArray[1].slice(0, decimals)}`
    }
    return `${numStrArray[0]}.${numStrArray[1].padEnd(decimals, '0')}`
  }
  return `${numStrArray[0]}.${''.padEnd(decimals, '0')}`
}
