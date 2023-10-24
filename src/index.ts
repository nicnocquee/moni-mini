import { addTask, processQueue } from "@/process-queue";
import { migrate, getDBPath } from "./database";
import { logWithTimestamp } from "./utils";

async function start() {
  try {
    await migrate();
  } catch (error) {
    console.error(error);
  }

  const dbPath = getDBPath();
  logWithTimestamp(`Using db: ${dbPath}`);

  urls.forEach((url, index) => {
    addTask(`${index}`, { id: `${index}`, urls: [url], dbPath }, 10);
  });

  processQueue();
}

const urls = [
  "http://localhost:8000/api/status",
  "http://localhost:8000/api/delay",
  "https://www.google.com",
  "https://www.youtube.com",
  "https://www.facebook.com",
  "https://www.baidu.com",
  "https://www.wikipedia.org",
  "https://www.qq.com",
  "https://www.taobao.com",
  "https://www.tmall.com",
  "https://www.yahoo.com",
  "https://www.amazon.com",
  "https://www.sohu.com",
  "https://www.jd.com",
  // "https://www.youku.com",
  // "https://www.naver.com",
  // "https://www.csdn.net",
  // "https://www.twitch.tv",
  // "https://www.microsoft.com",
  // "https://www.office.com",
  // "https://www.live.com",
  // "https://www.netflix.com",
  // "https://www.zoom.us",
  // "https://www.reddit.com",
  // "https://www.instagram.com",
  // "https://www.adobe.com",
  // "https://www.vk.com",
  // "https://www.aliexpress.com",
  // "https://www.okezone.com",
  // "https://www.tiktok.com",
  // "https://www.zhihu.com",
  // "https://www.bilibili.com",
  // "https://www.alipay.com",
  // "https://www.bing.com",
  // "https://www.ebay.com",
  // "https://www.netflix.com",
  // "https://www.imgur.com",
  // "https://www.pornhub.com",
  // "https://www.tumblr.com",
  // "https://www.stackoverflow.com",
  // "https://www.quora.com",
  // "https://www.linkedin.com",
  // "https://www.twitter.com",
  // "https://www.github.com",
  // "https://www.gitlab.com",
  // "https://www.bitbucket.org",
  // "https://www.slack.com",
  // "https://www.messenger.com",
  // "https://www.whatsapp.com",
  // "https://www.wechat.com",
  // "https://www.telegram.org",
  // "https://www.snapchat.com",
  // "https://www.pinterest.com",
  // "https://www.medium.com",
  // "https://www.spotify.com",
  // "https://www.soundcloud.com",
  // "https://www.apple.com",
  // "https://www.ibm.com",
  // "https://www.oracle.com",
  // "https://www.mysql.com",
  // "https://www.salesforce.com",
  // "https://www.adobe.com",
  // "https://www.dropbox.com",
  // "https://www.box.com",
  // "https://www.wetransfer.com",
  // "https://www.hulu.com",
  // "https://www.vimeo.com",
  // "https://www.dailymotion.com",
  // "https://www.twitch.tv",
  // "https://www.steamcommunity.com",
  // "https://www.epicgames.com",
  // "https://www.minecraft.net",
  // "https://www.roblox.com",
  // "https://www.etsy.com",
  // "https://www.airbnb.com",
  // "https://www.booking.com",
  // "https://www.tripadvisor.com",
  // "https://www.expedia.com",
  // "https://www.kayak.com",
  // "https://www.uber.com",
  // "https://www.lyft.com",
  // "https://www.doordash.com",
  // "https://www.grubhub.com",
  // "https://www.priceline.com",
  // "https://www.hotels.com",
  // "https://www.agoda.com",
  // "https://www.booking.com",
  // "https://www.homeaway.com",
  // "https://www.vrbo.com",
  // "https://www.zillow.com",
  // "https://www.trulia.com",
  // "https://www.redfin.com",
  // "https://www.apartments.com",
  // "https://www.realtor.com",
  // "https://www.fang.com",
  // "https://www.58.com",
  // "https://www.glassdoor.com",
  // "https://www.indeed.com",
  // "https://www.monster.com",
  // "https://www.simplyhired.com",
  // "https://www.ziprecruiter.com",
  // "https://www.linkedin.com",
];

start();
