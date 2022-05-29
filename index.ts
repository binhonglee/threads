import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  copyFileSync,
} from "fs";
import path, { join } from "path";
import { genThreadHTMLFromTweets, genThread, genTweetHTML } from "twitter-threads";

import { AltimeterConfig, AltimeterDestination } from "@globetrotte/altimeter";

const tweets = [
  "1530566974744383489",
  "1528434798351425536", "1527457305112899584", "1515418065302827011",
  "1504916910692966400", "1507791682288295936", "1487614039219789825",
  "1472079288694235139", "1467308938282500096", "1461617488848834563",
  "1459624305860378624", "1457409282698190851", "1451743926465884160",
  "1449855648334708742", "1444441812840505349", "1441841488464257028",
  "1439043099473235968", "1410524280362717188", "1405745451500900361",
];

const outDir = "dist"
const threadsCSS = "threads.css"

let tweetHTMLs = "";

if (existsSync(outDir)) {
  rmSync(outDir, {
    recursive: true,
    force: true
  });
}

mkdirSync(outDir);
copyFileSync(threadsCSS, join(outDir, threadsCSS));

genRun();
genConfig();

async function genRun() {
  for (const id of tweets) {
    await genProcessTweet(id);
  }
  parseToTemplate("index", tweetHTMLs);
}

async function genProcessTweet(id: string) {
  const thread = await genThread(id);
  const html = await genThreadHTMLFromTweets(thread);
  const firstID = thread[0].id_str;
  const desc = thread[0].text.split("\n").join(" ");
  tweetHTMLs = tweetHTMLs + (await genTweetHTML(firstID))
    .replace("<a rel=\"noopener noreferrer\" href=\"https://twitter.com/binhonglee/status/" + firstID, "<a href=\"./" + id + ".html")
    .replace("Read more...</a>\n  </p>", "Read this thread...</a>\n  </p>");
  parseToTemplate(id, html, desc);
}

function parseToTemplate(id: string, html: string, description: string = "A collection of my own Twitter threads.") {
  writeFileSync(
    join(outDir, id + ".html"),
    readFileSync("template.html")
      .toString()
      .replace(
        "{{ $CONTENT }}",
        html.split("\n").join("\n          ")
      )
      .split("{{ $DESCRIPTION }}")
      .join(description)
      .split("{{ $ID }}")
      .join(id)
    );
}

async function genConfig() {
  let config = new AltimeterConfig();
  config.baseURL = "http://localhost:1313";
  
  config.destURLs = tweets.map((tweet) => {
    return new AltimeterDestination(tweet, tweet);
  });

  config.destURLs.push(new AltimeterDestination("index", "index"));

  config.dir = "dist/preview";
  writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(config, null, 2));
}
