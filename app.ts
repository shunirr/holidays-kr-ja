import * as deepl from 'npm:deepl-node'

const y2024 = JSON.parse(
  Deno.readTextFileSync('./holidays-kr/src/holidays/2024.json')
)
const y2025 = JSON.parse(
  Deno.readTextFileSync('./holidays-kr/src/holidays/2025.json')
)
const holidaysKoJa = JSON.parse(
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
  const detectSubstitute = originalKoHoliday.match(/^대체공휴일\((.*)\)$/)
  if (detectSubstitute) {
    koHoliday = detectSubstitute[1]
  }

  let jaHoliday = holidaysKoJa[koHoliday]
  if (!jaHoliday) {
    jaHoliday = `${await translateByDeepL(koHoliday)}（${koHoliday}）`
  }

  if (detectSubstitute) {
    return `[振替休日] ${jaHoliday}`
  }

  return jaHoliday
}

const calendar = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//shunirr.github.io//holidays-kr-ja//JA',
  `X-WR-CALNAME:韓国の祝日`,
  'X-WR-TIMEZONE:Asia/Tokyo',
  'X-WR-CALDESC:https://shunirr.github.io/holidays-kr-ja/',
]

const dtstamp =
  new Date().toISOString().replace(/-|:/g, '').substring(0, 15) + 'Z'

const years = [y2024, y2025]

for (const year of years) {
  for (const date of Object.keys(year)) {
    const todayHolidays = year[date]
    for (const todayHoliday of todayHolidays) {
      const formattedDateString = date.replace(/-/g, '')
      const translated = await translateHoliday(todayHoliday)
      calendar.splice(
        calendar.length,
        0,
        ...[
          'BEGIN:VEVENT',
          `DTSTART;VALUE=DATE:${formattedDateString}`,
          `DTSTAMP:${dtstamp}`,
          `UID:${formattedDateString}-${dtstamp}`,
          `SUMMARY:${translated}`,
          'CLASS:PUBLIC',
          'TRANSP:TRANSPARENT',
          'END:VEVENT',
        ]
      )
    }
  }
}
calendar.push('END:VCALENDAR')

const translatedIcs = calendar.join('\n')
try {
  Deno.mkdirSync('public')
} catch {}

Deno.writeTextFileSync('./public/translated.ics', translatedIcs)
