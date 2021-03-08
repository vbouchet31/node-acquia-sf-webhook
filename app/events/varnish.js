const varnish = {}

varnish.classes = [
  'Acquia\\SfSite\\FlushDomainsFromVarnish'
]

varnish.events = ['varnishFlushCompleted']

varnish.varnishFlushCompleted = (taskNow, taskBefore) => {
  if ((!taskBefore || taskBefore.status !== '16') && taskNow.status == '16') {
    return 'varnish_flush_completed'
  }
}

module.exports = varnish
