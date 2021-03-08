const update = {}

update.classes = [
  'Acquia\\SfUpdate\\SiteUpdateD8'
]

update.events = ['siteUpdateStarted', 'siteUpdateCompleted']

update.siteUpdateStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.status !== '16') {
    return 'site_update_started'
  }
}

update.siteUpdateCompleted = (taskNow, taskBefore) => {
  if ((!taskBefore || taskBefore.status !== '16') && taskNow.status == '16') {
    return 'site_update_completed'
  }
}

module.exports = update
