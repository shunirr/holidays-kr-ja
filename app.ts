import * as deepl from 'npm:deepl-node'
import ical from 'npm:ical-generator'

type HolidaysKoJaJson = {
  [ko: string]: string
}

type BasicHolidaysJson = {
  [year: string]: {
    [date: string]: [string]
  }
}

const translateByDeepL = async (text: string): Promise<string> => {
  const translator = new deepl.Translator(
    Deno.env.get('DEEPL_API_KEY') as string
  )
  const translated = await translator.translateText(text, null, 'ja')
  return translated.text
}

const translateHoliday = async (
  translateKoJaMap: HolidaysKoJaJson,
  originalKoHoliday: string
): Promise<string> => {
  let koHoliday = originalKoHoliday
  const detectSubstitute = originalKoHoliday.match(/^대체공휴일\((.*)\)$/)
  if (detectSubstitute) {
    koHoliday = detectSubstitute[1]
  }

  let jaHoliday = translateKoJaMap[koHoliday]
  if (!jaHoliday) {
    jaHoliday = `${await translateByDeepL(koHoliday)}（${koHoliday}）`
  }

  if (detectSubstitute) {
    return `[振替休日] ${jaHoliday}`
  }

  return jaHoliday
}

const holidaysKoJaJson = JSON.parse(
  Deno.readTextFileSync('./assets/holidays_ko_ja.json')
) as HolidaysKoJaJson

const holidaysJson = JSON.parse(
  Deno.readTextFileSync('./holidays-kr/public/basic.json')
) as BasicHolidaysJson

const calendar = ical({
  name: '韓国の祝日',
  timezone: 'Asia/Tokyo',
})

for (const year of Object.keys(holidaysJson)) {
  const currentMonthHolidays = holidaysJson[year]
  for (const date of Object.keys(currentMonthHolidays)) {
    const todayHolidays = currentMonthHolidays[date]
    for (const todayHoliday of todayHolidays) {
      const translated = await translateHoliday(holidaysKoJaJson, todayHoliday)
      calendar.createEvent({
        start: new Date(date),
        allDay: true,
        summary: translated,
      })
    }
  }
}

const translatedIcs = calendar.toString()

try {
  Deno.mkdirSync('public')
} catch {}

Deno.writeTextFileSync('./public/translated.ics', translatedIcs)
