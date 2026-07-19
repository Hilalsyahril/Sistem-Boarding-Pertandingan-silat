async function test() {
  const text = "Panggilan kepada partai nomor 1";
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
  const res = await fetch(url);
  console.log(res.ok);
  const buf = await res.arrayBuffer();
  console.log(buf.byteLength);
}
test();
