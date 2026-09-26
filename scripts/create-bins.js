const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.join(process.cwd(), 'node_modules');
const binDir = path.join(nodeModulesDir, '.bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

function processPkg(pkgDir) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (!pkg.bin) return;

    const bins = typeof pkg.bin === 'string' ? { [pkg.name.split('/').pop()]: pkg.bin } : pkg.bin;

    for (const [binName, binRelPath] of Object.entries(bins)) {
      const targetPath = path.resolve(pkgDir, binRelPath);
      const binScriptPath = path.join(binDir, binName);

      if (fs.existsSync(targetPath)) {
        // Create shell wrapper script
        const wrapperContent = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*)
        if command -v cygpath > /dev/null 2>&1; then
            basedir=\`cygpath -w "$basedir"\`
        fi
    ;;
esac

if [ -x "$basedir/node" ]; then
  exec "$basedir/node" "${targetPath}" "$@"
else
  exec node "${targetPath}" "$@"
fi
`;
        fs.writeFileSync(binScriptPath, wrapperContent, { mode: 0o755 });
        console.log(`Created executable wrapper .bin/${binName} -> ${targetPath}`);
      }
    }
  } catch (e) {}
}

const entries = fs.readdirSync(nodeModulesDir);
for (const entry of entries) {
  if (entry.startsWith('.')) continue;
  const fullPath = path.join(nodeModulesDir, entry);
  if (entry.startsWith('@')) {
    const subEntries = fs.readdirSync(fullPath);
    for (const sub of subEntries) {
      processPkg(path.join(fullPath, sub));
    }
  } else {
    processPkg(fullPath);
  }
}

console.log('✅ Shell bin wrappers generated in node_modules/.bin!');
