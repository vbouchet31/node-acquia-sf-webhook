const cache = {}

cache.classes = [
  'Acquia\\SfSite\\CacheClearD8'
]

cache.events = ['cacheClearStarted', 'cacheClearCompleted']

cache.formatEvent = (event, task) => {
  return {
    'event': event,
    'task_id': task.id,
    'site': task.nid,
    'user': task.uid,
    'started': task.started
  }
}

cache.cacheClearStarted = (taskNow, taskBefore) => {
  if (!taskBefore) {
    return cache.formatEvent('cache_clear_started', taskNow)
  }
}

cache.cacheClearCompleted = (taskNow, taskBefore) => {
  if ((!taskBefore || taskBefore !== '16') && taskNow.status == '16') {
    return cache.formatEvent('cache_clear_completed', taskNow)
  }
}

module.exports = cache
