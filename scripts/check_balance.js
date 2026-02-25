const fs = require('fs');
const path = process.argv[2];
const s = fs.readFileSync(path,'utf8');
const pairs = { '{':'}','[':']','(':')' };
const stack = [];
for (let i=0;i<s.length;i++){
  const ch = s[i];
  if (pairs[ch]) stack.push({ch,i});
  else if (Object.values(pairs).includes(ch)){
    const last = stack.pop();
    if (!last || pairs[last.ch] !== ch) {
      console.log('Mismatch at', i, 'char', ch, 'expected', last? pairs[last.ch] : 'none');
      process.exit(1);
    }
  }
}
if (stack.length) {
  console.log('Unclosed:', stack.map(x=>x.ch+'@'+x.i));
  process.exit(2);
}
console.log('All balanced');
