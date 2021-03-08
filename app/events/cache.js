const cache = {}

cache.classes = [
  'Acquia\\SfSite\\CacheClearD8'
]

cache.events = ['cacheClearStarted', 'cacheClearCompleted']

cache.cacheClearStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.status !== '16') {
    return 'cache_clear_started'
  }
}

cache.cacheClearCompleted = (taskNow, taskBefore) => {
  if ((!taskBefore || taskBefore.status !== '16') && taskNow.status == '16') {
    return 'cache_clear_completed'
  }
}

module.exports = cache
