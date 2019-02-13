const Path = require('path');
const readdir = require('nobita-readdir');
const Schedule = require('node-schedule');
const requireJS = require('nobita-require');
const scheduleDir = readdir('./app/schedule');

module.exports = app => {
  let timer = {};
  app.router.get('/__schedule', async (ctx) => {
    const { path, cron } = ctx.query;
    const data = requireJS(path);
    const key = Path.basename(path, '.js');

    if (data && cron && data.task) {
      timer[key] && timer[key].cancel();
      timer[key] = Schedule.scheduleJob(cron, () => {
        data.task.call(ctx, ctx);
      });
      ctx.body = { code: 200, data: { path }, msg: 'success' };
    } else {
      throw new Error('schedule参数非法，详细请参照 https://nobitajs.github.io/nobita/#/schedule', 500);
    }
  });

  scheduleDir.map(async path => {
    const { schedule = {} } = requireJS(path);
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
          cron
        }
      });
    }
  });
}
