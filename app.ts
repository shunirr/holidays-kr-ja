import * as deepl from 'npm:deepl-node'

const createKrHolidaysMap = async (): Promise<{ [ko: string]: string }> => {
  const translator = new deepl.Translator(Deno.env.get('DEEPL_API_KEY'))
  const holidays = JSON.parse(
    Deno.readTextFileSync('./holidays-kr/public/basic.json')
  )

  const holidaysMap = {}
  for (const year of Object.keys(holidays)) {
    for (const date of Object.keys(holidays[year])) {
      for (const holiday of holidays[year][date]) {
        holidaysMap[holiday] = ''
      }
    }
  }
  const holidaysList = Object.keys(holidaysMap)
  const translated = await translator.translateText(
    holidaysList.join('\n'),
    null,
    'ja'
  )
  const translatedList = translated.text.split('\n')

  for (let i = 0; i < holidaysList.length; i++) {
    holidaysMap[holidaysList[i]] = translatedList[i]
  }

  return holidaysMap
}

const holidaysMap = await createKrHolidaysMap()
const originalIcs = Deno.readTextFileSync(
  './holidays-kr/public/basic.ics'
) as string
const translatedIcs: string[] = []
for (let line of originalIcs.split('\n')) {
  if (line.startsWith('SUMMARY:')) {
    const text = line.replace(/^SUMMARY:/, '')
    translatedIcs.push('SUMMARY:' + holidaysMap[text])
  } else if (line.startsWith('X-WR-CALNAME:')) {
    translatedIcs.push('X-WR-CALNAME:KR Holidays')
  } else {
    translatedIcs.push(line)
  }
}

try {
  Deno.mkdirSync('public')
} catch (e) {}
Deno.writeTextFileSync('./public/translated.ics', translatedIcs.join('\n'))
