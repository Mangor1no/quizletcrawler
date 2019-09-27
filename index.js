const puppeteer = require('puppeteer');
const fs = require('fs');
let URL = require('./config')
let crawlURL = URL.crawlURL;
let exportURL = URL.exportURL;

(async() => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(crawlURL, { waitUntil: 'networkidle0' });

    const title = await page.evaluate(() => {
        t = document.getElementsByClassName('UIHeading UIHeading--one')[0].innerText
        return t;
    })

    const getQuizzes = await page.evaluate(() => {
        let quizzes = document.querySelectorAll('div.SetPageTerm-content');
        quizzes = [...quizzes];
        let quiz = quizzes.map(e => ({
            quiz: e.childNodes
        }))
        quiz = [...quiz]
        if (quiz[0].quiz[0].innerText.length == 1) {
            let questions = quiz.map(e => (e.quiz[1].innerText))
            let answers = quiz.map(e => (e.quiz[0].innerText))
            let textQuiz = {}
            for (let i = 0; i < questions.length; i++) {
                textQuiz[questions[i]] = answers[i];
            }
            return textQuiz;
        } else {
            let questions = quiz.map(e => (e.quiz[0].innerText))
            let answers = quiz.map(e => (e.quiz[1].innerText))
            let textQuiz = {}
            for (let i = 0; i < questions.length; i++) {
                textQuiz[questions[i]] = answers[i];
            }
            return textQuiz;
        }
    });
    try {
        if (fs.existsSync(exportURL + title)) {
            console.log('Folder existed')
        } else {
            await fs.mkdir(exportURL + title, err => { console.log('create folder error: ' + err); return; });
            await fs.writeFile(exportURL + title + '\\quizbank.txt', JSON.stringify(getQuizzes, null, 2), err => { console.log('write question error: ' + err); return; })
        }
    } catch (error) {
        console.log(error)
    }
    await browser.close();
})();