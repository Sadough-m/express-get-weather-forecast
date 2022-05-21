const axios = require("axios");
const cheerio = require('cheerio');
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

module.exports = {
    splitFirstArg: (process_argv) => {
        const myArgs = process_argv.slice(2);
        console.log('myArgs: ', myArgs);
        return myArgs[0].split('/')
    },
    calculateDifferenceDate:(date2,date1,abs=true)=>{
        const diffTimeLastFromFirst =abs? Math.abs(date1 - date2):date2 - date1;
        const diffDaysLastFromFirst = Math.ceil(diffTimeLastFromFirst / (1000 * 60 * 60 * 24))+1;
    },
    makeGetUrlArray:function (splitUrl) {
        let arrayOfDailyGet = []
        let monthName=splitUrl[7].split('-')[0]
        console.log('monthName',monthName)
        splitUrl[7] = 'daily-weather-forecast'
        let monthNum = month.findIndex(x=>x.toLowerCase()==monthName.toLowerCase());
        console.log('monthNum',monthNum)
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), monthNum, 2);
        var currentDay=date
        var lastDay = new Date(date.getFullYear(), monthNum+1 , 1);
        const diffTimeLastFromFirst = Math.abs(lastDay - firstDay);
        const diffDaysLastFromFirst = Math.ceil(diffTimeLastFromFirst / (1000 * 60 * 60 * 24))+1;

        const diffTimeFirstFromCurrent= firstDay - currentDay;
        const diffDaysFirstFromCurrent = Math.ceil(diffTimeFirstFromCurrent / (1000 * 60 * 60 * 24))+1;

        console.log('firstDay',firstDay)
        console.log('lastDay',lastDay)
        console.log('currentDay',currentDay)
        console.log('diffDaysLastFromFirst',diffDaysLastFromFirst)
        console.log('diffDaysFirstFromCurrent',diffDaysFirstFromCurrent)
        // var d = new Date();
        // d.setDate(d.getDate() + 0);
        // console.log(d)
        for (let i = 1; i <= diffDaysLastFromFirst; i++) {
            var d = new Date(firstDay);
            d.setDate(d.getDate() + i-1);
            arrayOfDailyGet.push({date:d,url:diffDaysFirstFromCurrent+i-2>0?splitUrl.join('/') + `?day=${diffDaysFirstFromCurrent+i-2}`:''})
        }
        // arrayOfDailyGet=arrayOfDailyGet.filter(x=>x.date.getTime()>=firstDay.getTime() && x.date.getTime()<=lastDay.getTime())
        console.log('arrayOfDailyGet',arrayOfDailyGet)
        return arrayOfDailyGet
    },
    getUrlsPage: async (urlArray) => {
        return await Promise.all(urlArray.map(async (x, ind) => ({
            day: ind + 1,
            page:x.url? await axios({
                url: x.url,
                method: 'get'
            }):''
        })))
    },
    getDataFromPage: (responsePageList, urlSplit,process_argv) => {
            let returnJson = {url:process_argv.slice(2),
                result:{days:{}}
            }
        responsePageList.forEach(x => {
            if (x.page) {
            const $ = cheerio.load(x.page.data);
                // console.log('urlCallResult',$('div.phrase').innerText())
                returnJson.result.days[x.day] = {
                    Day: {
                        "description": $('div.phrase').eq(0).text(),
                        "iconPath": urlSplit[2] + $('svg.icon').eq(0).attr('src'),
                        "maxUvIndex": $('p.panel-item').first().children().first().text(),
                        "wind": $('p.panel-item').eq(1).children().first().text(),
                        "windGusts": $('p.panel-item').eq(2).children().first().text(),
                        "probabilityOfPrecipitation": $('p.panel-item').eq(3).children().first().text(),
                        "probabilityOfThunderstorms": $('p.panel-item').eq(4).children().first().text(),
                        "precipitation": $('p.panel-item').eq(5).children().first().text(),
                        "rain": $('p.panel-item').eq(6).children().first().text(),
                        "hoursOfPrecipitation": $('p.panel-item').eq(7).children().first().text(),
                        "hoursOfRain": $('p.panel-item').eq(8).children().first().text(),
                        "cloudCover": $('p.panel-item').eq(9).children().first().text(),
                    },
                    "Night": {
                        "description": $('div.phrase').eq(1).text(),
                        "iconPath": urlSplit[2] + $('svg.icon').eq(1).attr('src'),
                        "wind": $('p.panel-item').eq(10).children().first().text(),
                        "windGusts": $('p.panel-item').eq(11).children().first().text(),
                        "probabilityOfPrecipitation": $('p.panel-item').eq(12).children().first().text(),
                        "probabilityOfThunderstorms": $('p.panel-item').eq(13).children().first().text(),
                        "precipitation": $('p.panel-item').eq(14).children().first().text(),
                        "cloudCover": $('p.panel-item').eq(15).children().first().text(),
                    },
                    SunriseOrSunset: {
                        Sun: {
                            "duration": $('div.duration').eq(0).children().first().text().replace(/\t/g, '').replace(/\n/g, '') + ' ' +
                                $('div.duration').eq(0).children().last().text().replace(/\t/g, '').replace(/\n/g, ''),
                            "risingTime": $('span.text-value').eq(0).text(),
                            "fallingTime": $('span.text-value').eq(1).text()
                        },
                        Moon: {
                            "duration": $('div.duration').eq(1).children().first().text().replace(/\t/g, '').replace(/\n/g, '') + ' ' +
                                $('div.duration').eq(1).children().last().text().replace(/\t/g, '').replace(/\n/g, ''),
                            "risingTime": $('span.text-value').eq(2).text(),
                            "fallingTime": $('span.text-value').eq(3).text()
                        }
                    },
                    "temperatureHistory": {
                        "forecast": {
                            "low": $('div.temperature').eq(2).text(),
                            "high": $('div.temperature').eq(3).text()
                        },
                        "average": {
                            "low": $('div.temperature').eq(4).text(),
                            "high": $('div.temperature').eq(5).text()
                        },
                        "lastYear": {
                            "low": $('div.temperature').eq(6).text(),
                            "high": $('div.temperature').eq(7).text()
                        }
                    }
                }
                // console.log('returnJson', returnJson[1].temperatureHistory)
            } else {
                returnJson.result.days[x.day] = {}
            }

        })
            return returnJson

    }
}
