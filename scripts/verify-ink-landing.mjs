import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle','--use-angle=metal'] });
const page = await browser.newPage({viewport:{width:1440,height:1000}, deviceScaleFactor:2});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://localhost:3001/');
 await page.waitForFunction(()=>window.socratinkInk?.call('ink_get_scene').rendering.ready);
 for(const [label,name] of [['ink droplet','Ink droplet'],['question mark','Question mark'],['bridge','Bridge'],['open notebook','Open notebook']]) {
  const button=page.getByRole('button',{name:'Preview '+label,exact:true}); await button.click();
  await page.waitForFunction(()=>!window.socratinkInk.call('ink_get_scene').rendering.transitioning);
  assert.equal(await page.evaluate(()=>window.socratinkInk.call('ink_get_scene').scene.name),name);
  assert.equal(await button.getAttribute('aria-pressed'),'true');
 }
 await fs.mkdir('lab/ink-landing',{recursive:true});
 await page.screenshot({path:'lab/ink-landing/desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Preview question mark',exact:true}).click();
 await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>window.socratinkInk.call('ink_get_scene').rendering.reducedMotion);
 await page.getByRole('button',{name:'Preview open notebook',exact:true}).click();
 await page.waitForFunction(()=>!window.socratinkInk.call('ink_get_scene').rendering.transitioning);
 await page.screenshot({path:'lab/ink-landing/mobile.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('http://localhost:3001/?shape=code&morph=1');
 await page.waitForSelector('canvas');
 assert.equal(await page.getByRole('group',{name:'Explore the ink symbols'}).count(),0);
 assert.deepEqual(errors,[]);
 console.log('Landing ink passed: four real controls, selected state, mobile, reduced motion, legacy comparison; no page errors.');
}finally{await browser.close();}
