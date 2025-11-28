#!/usr/bin/env node
const path = require("path");
process.env.DATA_DIR = path.join(__dirname, "data");
require("uptime-kuma");
