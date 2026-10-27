const fs = require('fs');

const html = fs.readFileSync('stats.html', 'utf8');
const start = html.indexOf('const data = ');
const end = html.indexOf(';\n', start);
const data = JSON.parse(html.slice(start + 'const data = '.length, end));

const nodeParts = data.nodeParts || {};
const nodeMetas = data.nodeMetas || {};

console.log('=== BUNDLE DETAILED BREAKDOWN ===\n');

for (const chunk of data.tree.children) {
  const chunkName = chunk.name;
  let totalRendered = 0;
  let totalGzip = 0;
  let totalBrotli = 0;

  const categories = {
    antd: { rendered: 0, gzip: 0, brotli: 0 },
    antDesignIcons: { rendered: 0, gzip: 0, brotli: 0 },
    antDesignOther: { rendered: 0, gzip: 0, brotli: 0 },
    ownSrc: { rendered: 0, gzip: 0, brotli: 0 },
    otherVendor: { rendered: 0, gzip: 0, brotli: 0 },
  };

  function traverse(node) {
    if (node.uid && nodeParts[node.uid]) {
      const part = nodeParts[node.uid];
      const r = part.renderedLength || 0;
      const g = part.gzipLength || 0;
      const b = part.brotliLength || 0;
      totalRendered += r;
      totalGzip += g;
      totalBrotli += b;

      const meta = nodeMetas[part.metaUid] || {};
      const id = meta.id || node.name || '';

      if (id.includes('/node_modules/antd/')) {
        categories.antd.rendered += r;
        categories.antd.gzip += g;
        categories.antd.brotli += b;
      } else if (id.includes('/node_modules/@ant-design/icons/')) {
        categories.antDesignIcons.rendered += r;
        categories.antDesignIcons.gzip += g;
        categories.antDesignIcons.brotli += b;
      } else if (id.includes('/node_modules/@ant-design/')) {
        categories.antDesignOther.rendered += r;
        categories.antDesignOther.gzip += g;
        categories.antDesignOther.brotli += b;
      } else if (id.includes('/src/')) {
        categories.ownSrc.rendered += r;
        categories.ownSrc.gzip += g;
        categories.ownSrc.brotli += b;
      } else {
        categories.otherVendor.rendered += r;
        categories.otherVendor.gzip += g;
        categories.otherVendor.brotli += b;
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(chunk);

  if (totalRendered > 15000) { // only show chunks > 15KB
    console.log(`\n📦 Chunk: ${chunkName}`);
    console.log(`   Total Size: ${(totalRendered / 1024).toFixed(2)} KB | Gzip: ${(totalGzip / 1024).toFixed(2)} KB | Brotli: ${(totalBrotli / 1024).toFixed(2)} KB`);
    console.log(`   - antd: ${(categories.antd.rendered / 1024).toFixed(2)} KB (${((categories.antd.rendered / totalRendered) * 100).toFixed(1)}%) | Gzip: ${(categories.antd.gzip / 1024).toFixed(2)} KB`);
    console.log(`   - @ant-design/icons: ${(categories.antDesignIcons.rendered / 1024).toFixed(2)} KB (${((categories.antDesignIcons.icons || categories.antDesignIcons.rendered / totalRendered) * 100).toFixed(1)}%) | Gzip: ${(categories.antDesignIcons.gzip / 1024).toFixed(2)} KB`);
    console.log(`   - @ant-design other (cssinjs): ${(categories.antDesignOther.rendered / 1024).toFixed(2)} KB (${((categories.antDesignOther.rendered / totalRendered) * 100).toFixed(1)}%)`);
    console.log(`   - Own code (src/): ${(categories.ownSrc.rendered / 1024).toFixed(2)} KB (${((categories.ownSrc.rendered / totalRendered) * 100).toFixed(1)}%)`);
    console.log(`   - Other vendor libs: ${(categories.otherVendor.rendered / 1024).toFixed(2)} KB (${((categories.otherVendor.rendered / totalRendered) * 100).toFixed(1)}%)`);
  }
}
