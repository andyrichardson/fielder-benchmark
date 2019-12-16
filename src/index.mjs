import p from "puppeteer";
import path from "path";
import { statSync, readdirSync } from "fs";

const __dirname = path.resolve(
  path.dirname(decodeURI(new URL(import.meta.url).pathname))
);

const getMetrics = (m, t) => {
  const start = t.navigationStart;

  return {
    ScriptDuration: getFromMetric(m, "ScriptDuration"),
    TimeToInteractive: t.domInteractive - start,
    TimeToLoaded: t.loadEventEnd - start
  };
};

const getFromMetric = (m, n) => m.metrics.find(mt => mt.name === n).value;

const getPerfDiff = (a, b) => {
  const percentage = (a / b) * 100;

  return percentage < 100
    ? `🚀 ${(100 - percentage).toFixed(2)}% faster`
    : `☹️ ${(percentage - 100).toFixed(2)}% slower`;
};

const benchFileSize = () => {
  // console.log(__dirname);
  const fldJsFile = readdirSync(`${__dirname}/../fielder/dist`).filter(
    f => f.indexOf(".js") > 0
  )[0];
  const fldSize = statSync(`${__dirname}/../fielder/dist/${fldJsFile}`).size;

  const fmkJsFile = readdirSync(`${__dirname}/../formik/dist`).filter(
    f => f.indexOf(".js") > 0
  )[0];
  const fmkSize = statSync(`${__dirname}/../formik/dist/${fmkJsFile}`).size;

  console.log(`=== Bundle size ===`);
  console.log(`Fielder: ${fldSize}`);
  console.log(`Formik: ${fmkSize}`);
  console.log(
    getPerfDiff(fldSize, fmkSize).replace(/faster/, "smaller") + "\n"
  );
};

let browser;

const testChange = async url => {
  browser = browser || (await p.launch());
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send("Performance.enable");

  await page.goto(url);
  await page.waitFor(100);

  // Type invalid value and blur
  await page.click('input[name="username"]');
  await page.keyboard.type("na");
  await page.click("body");

  // Type valid value
  await page.click('input[name="username"]');
  await page.keyboard.type("nanana");
  await page.click("body");

  await page.click('input[name="password"]');
  await page.keyboard.type("thisismypass");
  await page.click("body");

  await page.waitFor(100);
  const timings = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  const metrics = await client.send("Performance.getMetrics");

  await page.close();
  return getMetrics(metrics, timings);
};

const run = async () => {
  const fielder = {};
  const formik = {};
  const runs = 50;

  process.stdout.clearScreenDown();
  console.log(`Benchmarking ${runs} runs \n`);

  let run = 0;

  const printProgress = () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Run ${run + 1}/${runs}`);
  };

  while (run < runs) {
    printProgress();
    const fld = await testChange("http://localhost:5001");
    const fmk = await testChange("http://localhost:5002");

    Object.keys(fld).forEach(key => {
      fielder[key] = (fielder[key] || 0) + fld[key];
    });
    Object.keys(fmk).forEach(key => {
      formik[key] = (formik[key] || 0) + fmk[key];
    });
    run += 1;
  }

  process.stdout.clearLine();
  process.stdout.write("\n");

  benchFileSize();

  Object.keys(fielder).forEach(key => {
    console.log(`=== ${key} ===`);
    console.log(`Fielder: ${fielder[key] / runs} (average)`);
    console.log(`Formik: ${formik[key] / runs} (average)`);
    console.log(getPerfDiff(fielder[key] / runs, formik[key] / runs) + "\n");
  });
};

run();
