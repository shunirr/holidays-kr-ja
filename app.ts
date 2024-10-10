import * as deepl from 'npm:deepl-node'

const translateKoJaMap: { [ko: string]: string } = JSON.parse(
  Deno.readTextFileSync('./assets/holidays_ko_ja.json')
)

const translateByDeepL = async (text: string): Promise<string> => {
  const translator = new deepl.Translator(
    Deno.env.get('DEEPL_API_KEY') as string
  )
  const translated = await translator.translateText(text, null, 'ja')
  return translated.text
}

const translateHoliday = async (originalKoHoliday: string): Promise<string> => {
  let koHoliday = originalKoHoliday
  const substitute = originalKoHoliday.match(/^대체공휴일\((.*)\)$/)
  if (substitute) {
    koHoliday = substitute[1]
  }
  let jaHoliday = translateKoJaMap[koHoliday]
  if (!jaHoliday) {
    jaHoliday = await translateByDeepL(koHoliday)
  }
  if (substitute) {
    return `[振替休日] ${jaHoliday}`
  }
  return jaHoliday
}

const originalIcs = Deno.readTextFileSync(
  './holidays-kr/public/basic.ics'
) as string
const translatedIcs: string[] = []
for (const line of originalIcs.split('\n')) {
  if (line.startsWith('SUMMARY:')) {
    const text = line.replace(/^SUMMARY:/, '')
    const translated = await translateHoliday(text)
    translatedIcs.push('SUMMARY:' + translated)
  } else if (line.startsWith('X-WR-CALNAME:')) {
    const text = line.replace(/^X-WR-CALNAME:/, '')
    const translated = await translateByDeepL(text)
    translatedIcs.push('X-WR-CALNAME:' + translated)
  } else {
    translatedIcs.push(line)
  }
}

try {
  Deno.mkdirSync('public')
} catch {}

Deno.writeTextFileSync('./public/translated.ics', translatedIcs.join('\n'))
