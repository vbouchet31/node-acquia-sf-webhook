const acsf = {}

/**
 * Some tasks are not really giving reliable information as these are fetched
 * in multiple cases. For example, the cron tasks have complex flow and may be
 * considered as daemon instead.
 *
 * @param {array} tasks The list of tasks to filter.
 * @return {array} The filtered list of task.
 */
acsf.filterGenericTasks = (tasks) => {
  const filteredTasksGroupName = [
    'SfVersions',
    'SiteInfoGet',
    'MultisiteCron',
    'CronController',
    'PageViewLogCollector',
    'PageViewLogAnalyzer',
    'DeploySshWrapper',
    'SfLogRotate'
  ]
  return tasks.filter(task => {
    return !(filteredTasksGroupName.includes(task.group_name))
  })
}

/**
 * From a list of tasks, find the most recent event from the various timestamp
 * attributes (completed, added, started).
 *
 * @param {array} tasks The list of task to browse
 * @return {number} The most recent timestamp
 */
acsf.getMostRecentTaskTimestamp = (tasks) => {
  let timestamp = 0
  tasks.forEach(task => {
    if (task.completed != '0' && Number(task.completed) > timestamp) {
      timestamp = Number(task.completed)
    }
    if (task.added != '0' && Number(task.added) > timestamp) {
      timestamp = Number(task.added)
    }
    if (task.started != '0' && Number(task.started) > timestamp) {
      timestamp = Number(task.started)
    }
  })

  return timestamp
}

module.exports = acsf
