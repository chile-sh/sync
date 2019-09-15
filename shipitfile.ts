import shipitDeploy from 'shipit-deploy'

export default shipit => {
  shipitDeploy(shipit)
  const appName = 'sync'

  const runOnPath = cmd => shipit.remote(`cd ${shipit.releasePath} && ${cmd}`)

  shipit.initConfig({
    default: {
      deployTo: '/home/deploy/apps/sync',
      repositoryUrl: 'https://github.com/chile-sh/sync.git',
      keepReleases: 2,
    },
    production: {
      servers: 'deploy@chile.sh:42069',
    },
  })

  shipit.on('updated', () => {
    shipit.start('install')
  })

  shipit.blTask('install', async () => {
    await runOnPath(`yarn install`)
    await runOnPath(`yarn build`)
  })

  shipit.blTask('pm2:restart', async () => {
    await runOnPath(`pm2 delete -s ${appName} || :`)
    await runOnPath(`pm2 start build/app.js --name "${appName}"`)
  })

  shipit.on('published', () => {
    shipit.start('pm2:restart')
  })
}
