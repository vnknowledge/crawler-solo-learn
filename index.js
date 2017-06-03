/**
 * Created by Cho To Xau Tinh on 12-Oct-16.
 */
let crawler_promise = require('./crawler-promise');
let Promise = require('bluebird');
let fs = require('fs');

const listOfCourses = ["CPlusPlus", "Java", "Python",
                       "JavaScript", "PHP", "CSharp",
                       "Swift", "Ruby", "HTML", "CSS",
                       "SQL"];

const header = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.8,vi;q=0.6',
        'clientID': 'Web.SoloLearn.' + listOfCourses[6],
        'connection': 'keep-alive',
        'content-length': 17,
        'content-type': 'application/json',
        'deviceID': 'DoszvNvf84dcb5qp1YQC44x/ezs=',
        'dnt': 1,
        'host': 'api.sololearn.com',
        'origin': 'https://www.sololearn.com',
        'referer': 'https://www.sololearn.com/Play/' + listOfCourses[6],
        'sessionID': '5eb07c00-d74b-42ca-86d6-7bf4f40ebb43',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
    },
    url = ['https://api.sololearn.com/web/GetCourse', 'https://api.sololearn.com/web/GetLesson'],
    method = ['POST', 'GET', 'PUT', 'DELETE'];

const options = {
    maxConnections: 10,
    headers: header,
    method: method[0]
}

function chapterTrigger(chapter) {
    let lessons = chapter.lessons;

    let payload = lessons.map(function (lesson) {
        return {
            uri: url[1],
            body: JSON.stringify(
                {lessonID: lesson.id}
            ),
        }
    });
    return crawler_promise(options, payload, 'json');
}

function lessonFormat(chapters, lessons, idx) {
    let jsonFormat = {
        chapter: chapters.name,
        lesson: {
            id: lessons.id,
            name: lessons.name,
            type: lessons.type,
            mode: lessons.mode,
            tags: lessons.tags,
            quizzes: [
                {
                    id: lessons.quizzes[idx].id,
                    number: lessons.quizzes[idx].number,
                    type: lessons.quizzes[idx].type,
                    linkedQuizID: lessons.quizzes[idx].linkedQuizID,
                    answers: lessons.quizzes[idx].answers,
                    question: lessons.quizzes.question,
                    textContent: lessons.quizzes.textContent
                }
            ]
        }
    };
    return jsonFormat;
}

function writeFile(chapters) {
    let lessons = new Array();
    for (let idx = 0; idx < chapters.length; ++idx) {
        for (let jdx = idx; jdx < chapters[idx].lessons.length; ++jdx) {
            for (let kdx = 0; kdx < chapters[idx].lessons[jdx].lesson.quizzes.length; ++kdx) {
                lessons.push(lessonFormat(chapters[idx], chapters[idx].lessons[jdx].lesson, kdx));
            }
        }
    }

    Promise.all(lessons).then(function (lessons) {
        fs.writeFileSync('./lesson.json', JSON.stringify(lessons, null, 2));
    });
}

crawler_promise(options, {uri: url[0]}, 'json').then(function (resultCourse) {
    let chapters = resultCourse.course.modules;
    return Promise.map(chapters, function (chapter) {
        return chapterTrigger(chapter).then(function (results) {
            return {
                name: chapter.name,
                lessons: results
            }
        })
    })
}).then(function (chapters) {
    writeFile(chapters);
    console.log('done');
}).catch(function (err) {
    console.error("\033[31m", err, " \033[m");
});
