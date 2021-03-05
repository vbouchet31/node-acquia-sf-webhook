const release = {}

release.classes = [
  'Acquia\\SfUpdate\\UpdateDirector'
]

release.formatEvent = (event, task) => {
  return {
    'event': event,
    'task_id': task.id,
    'user': task.uid,
    'started': task.started
  }
}

release.events = ['releaseStarted', 'releaseCompleted', 'hotfixStarted', 'hotfixCompleted']

release.hotfixStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.name == 'Hotfix') {
    return release.formatEvent('release_hotfix_started', taskNow)
  }
}

release.hotfixCompleted = (taskNow, taskBefore) => {
  if (taskNow.name == 'Hotfix' && (!taskBefore || taskBefore !== '16') && taskNow.status == '16') {
    return release.formatEvent('release_hotfix_completed', taskNow)
  }
}

release.releaseStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.name == 'Update') {
    return release.formatEvent('release_update_started', taskNow)
  }
}

release.releaseCompleted = (taskNow, taskBefore) => {
  if (taskNow.name == 'Update' && (!taskBefore || taskBefore !== '16') && taskNow.status == '16') {
    return release.formatEvent('release_update_completed', taskNow)
  }
}

module.exports = release
