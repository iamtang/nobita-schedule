const requireJS = require('nobita-require');
module.exports = app => {
  process.messenger && process.messenger.on && process.messenger.on('nobita-schedule', (data) => {
    const { path } = data;
    const { task } = requireJS(path);
    task.call(app.quoteContext, app.quoteContext);
  });
}
