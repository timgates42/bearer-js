const path = require('path')
const fs = require('fs')
const copy = require('copy-template-dir')
const Case = require('case')
const { spawn, execSync } = require('child_process')

function prepare(emitter, config) {
  return async ({ install = true } = { install: true }) => {
    try {
      const {
        rootPathRc,
        scenarioConfig: { scenarioTitle }
      } = config
      const rootLevel = path.dirname(rootPathRc)
      const screensDirectory = path.join(rootLevel, 'screens')
      const buildDirectory = path.join(screensDirectory, '.build')

      // Create hidden folder
      emitter.emit('start:prepare:buildFolder')
      if (!fs.existsSync(buildDirectory)) {
        fs.mkdirSync(buildDirectory)
        fs.mkdirSync(path.join(buildDirectory, 'src'))
      }

      // Symlink node_modules
      emitter.emit('start:symlinkNodeModules')
      const nodeModuleLink = path.join(buildDirectory, 'node_modules')
      createEvenIfItExists(
        path.join(screensDirectory, 'node_modules'),
        nodeModuleLink
      )

      // symlink package.json
      emitter.emit('start:symlinkPackage')

      const packageLink = path.join(buildDirectory, 'package.json')
      createEvenIfItExists(
        path.join(screensDirectory, 'package.json'),
        packageLink
      )

      // Copy stencil.config.json
      emitter.emit('start:prepare:stencilConfig')

      const vars = {
        componentTagName: Case.kebab(scenarioTitle)
      }
      const inDir = path.join(__dirname, 'templates/start/.build')
      const outDir = buildDirectory

      copy(inDir, outDir, vars, (err, createdFiles) => {
        if (err) throw err
        createdFiles.forEach(filePath =>
          emitter.emit('start:prepare:copyFile', filePath)
        )
      })

      if (install) {
        emitter.emit('start:prepare:installingDependencies')
        execSync('yarn install', { cwd: screensDirectory })
      }

      return {
        buildDirectory
      }
    } catch (error) {
      emitter.emit('start:prepare:failed', { error })
      return {}
    }
  }
}

const start = (emitter, config) => async ({ open, install }) => {
  try {
    const { buildDirectory } = await prepare(emitter, config)({ install })
    emitter.emit('start:watchers')
    // Launch in ||
    //    bearer-tsc
    //    stencil-dev-server
    //
    const args = ['start']
    if (!open) {
      args.push('--no-open')
    }
    const stencil = spawn('yarn', args, {
      cwd: buildDirectory
    })
    stencil.stdout.on('data', data => {
      emitter.emit('start:watchers:stencil:stdout', { data })
    })

    stencil.stderr.on('data', data => {
      emitter.emit('start:watchers:stencil:stderr', { data })
    })

    stencil.on('close', code => {
      console.log(`child process exited with code ${code}`)
    })
  } catch (e) {
    emitter.emit('start:failed', { error: e })
  }
}

function createEvenIfItExists(target, path) {
  try {
    fs.symlinkSync(target, path)
  } catch (e) {
    if (!e.code === 'EEXIST') {
      throw e
    }
  }
}

module.exports = {
  prepare,
  useWith: (program, emitter, config) => {
    program
      .command('start')
      .description(
        `Start local development server.
    $ bearer start
`
      )
      .option('--no-open', 'Do not open web browser')
      .option('--no-install', 'Do not run yarn|npm install')
      .action(start(emitter, config))
  }
}
