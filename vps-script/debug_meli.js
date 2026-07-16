async function test() {
  const url = "https://meli.la/2dbz95n";
  const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
  
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('location');
    console.log('Redirected to:', loc);
    
    const res2 = await fetch(loc, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res2.status >= 300 && res2.status < 400) {
      console.log('Redirected 2 to:', res2.headers.get('location'));
    } else {
      console.log('Status 2:', res2.status);
      const html = await res2.text();
      // look for canonical
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
      console.log('Canonical:', canonical ? canonical[1] : 'not found');
      
      const mlbMatch = html.match(/(MLB-?\d+)/i);
      console.log('First MLB Match in HTML:', mlbMatch ? mlbMatch[1] : 'not found');
    }
  }
}
test();
