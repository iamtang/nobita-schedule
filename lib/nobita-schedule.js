const readdir = require('nobita-readdir');
const schedule = require('node-schedule');
const requireJS = require('nobita-require');
const scheduleDir = readdir('./app/schedule');

module.exports = app => {
  
  app.router.get('/__schedule', async () => {
    const ctx = this;
    const { path } = ctx.query;
    const js = requireJS(path);
    if (js && js.schedule && js.schedule.interval) {
      schedule.scheduleJob(js.schedule.interval, () => {
        js.task.call(ctx, ctx);
      });
    }
  });

  return function () {
    scheduleDir.map(async src => {
      await curl({
        url: 'http://127.0.0.1:6001/__schedule',
        method: 'GET',
        params: {
          path: src,
        }
      });
    });
  }
}
