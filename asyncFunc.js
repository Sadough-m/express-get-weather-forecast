const helper =require('./helper')
var fs = require('fs');


module.exports=async function app (){

    let urlSplit=helper.splitFirstArg(process.argv)
    const dayUrls=helper.makeGetUrlArray(urlSplit)
    const urlCallResult=await helper.getUrlsPage(dayUrls)
    const jsons=helper.getDataFromPage(urlCallResult,urlSplit,process.argv)
    console.log('jsons',jsons)
    fs.writeFile(__dirname+'/savedData/'+`${encodeURIComponent(process.argv.slice(2))}.json`, JSON.stringify(jsons), function(err) {
        if (err) {
            console.log(err);
        }
    });
}
