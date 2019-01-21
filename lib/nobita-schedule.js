const readdir = require('nobita-readdir');
const Schedule = require('node-schedule');
const requireJS = require('nobita-require');
const scheduleDir = readdir('./app/schedule');

module.exports = app => {
  app.router.get('/__schedule', async (ctx) => {
    const { path, cron } = ctx.query;
    const data = requireJS(path);

    if (data && cron) {
      Schedule.scheduleJob(cron, () => {
        data.task.call(ctx, ctx);
      });
      ctx.body = { code: 200, msg: 'success' };
    }
  });

  scheduleDir.map(async path => {
    const { schedule } = requireJS(path);
    const { type = 'worker', cron } = schedule;

    if (
      app.config.env == 'prod' && type == 'worker' && process.env.NODE_APP_INSTANCE == 0 ||
      app.config.env == 'prod' && type == 'all' ||
      app.config.env == 'local'
    ) {
      cron && await app.curl({
        url: `http://127.0.0.1:${app.config.listen.port}/__schedule`,
        method: 'get',
        params: {
          path,
          type: type,
          cron
        }
      });
    }
  });
}
