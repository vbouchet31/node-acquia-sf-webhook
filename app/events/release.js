const release = {}

release.classes = [
  'Acquia\\SfUpdate\\UpdateDirector'
]

release.events = ['releaseStarted', 'releaseCompleted', 'hotfixStarted', 'hotfixCompleted']

release.hotfixStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.name == 'Hotfix') {
    return 'release_hotfix_started'
  }
}

release.hotfixCompleted = (taskNow, taskBefore) => {
  if (taskNow.name == 'Hotfix' && (!taskBefore || taskBefore !== '16') && taskNow.status == '16') {
    return 'release_hotfix_completed'
  }
}

release.releaseStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.name == 'Update') {
    return 'release_update_started'
  }
}

release.releaseCompleted = (taskNow, taskBefore) => {
  if (taskNow.name == 'Update' && (!taskBefore || taskBefore !== '16') && taskNow.status == '16') {
    return 'release_update_completed'
  }
}

module.exports = release
