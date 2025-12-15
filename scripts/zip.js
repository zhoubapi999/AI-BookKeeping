const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const archiver = require('archiver')

const rootDir = path.resolve(__dirname, '..')

// Get file list respecting .gitignore
console.log('Getting file list (git tracked + untracked but not ignored)...')

let allFiles = []
try {
  const tracked = execSync('git ls-files', { cwd: rootDir, encoding: 'utf8' }).split('\n').filter(Boolean)
  const untracked = execSync('git ls-files --others --exclude-standard', { cwd: rootDir, encoding: 'utf8' }).split('\n').filter(Boolean)
  allFiles = [...new Set([...tracked, ...untracked])]
}
catch (error) {
  console.error('Error listing files via git:', error)
  process.exit(1)
}

// Start Archiving
const output = fs.createWriteStream(path.join(rootDir, 'release.zip'))
const archive = archiver('zip', {
  zlib: { level: 9 },
})

output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`)
  console.log(`Zip file created at: ${path.join(rootDir, 'release.zip')}`)
  console.log(`Total files: ${allFiles.length}`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)

console.log('Adding files to zip...')
allFiles.forEach((file) => {
  const filePath = path.join(rootDir, file)
  // Ensure file exists and is not a directory (git ls-files returns files)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    archive.file(filePath, { name: file })
  }
})

// Special handling: Ensure .env is available if requested
// If .env.production exists but .env is missing/ignored, we might want to include it as .env?
// The user previously wanted "dist to contain environment variables".
// If we are zipping source, usually we keep original names.
// But to be helpful for deployment:
const envProd = 'backend/.env.production'
const envDest = 'backend/.env'
if (allFiles.includes(envProd) && !allFiles.includes(envDest)) {
  console.log('Adding backend/.env.production as backend/.env for convenience...')
  archive.file(path.join(rootDir, envProd), { name: envDest })
}

archive.finalize()
