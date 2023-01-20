const cron = require("node-cron");
const backup = require("./backup");

// Run cron everyday at 3am
cron.schedule("0 3 * * *", () => {
  backup();
});
