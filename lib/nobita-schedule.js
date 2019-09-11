const requireJS = require('nobita-require');
module.exports = app => {
  const ctx = app.createAnonymousContext();
  process.messenger && process.messenger.on && process.messenger.on('nobita-schedule', (data) => {
    const { path } = data;
    const { task } = requireJS(path);
    task.call(ctx, ctx);
  });
}
