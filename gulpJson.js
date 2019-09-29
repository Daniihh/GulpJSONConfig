"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
/*
  FILE
*/
var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var child = require("child_process");
var config = "gulpconfig.json";
var pathRegex = /((?:[\/\\]?[a-zA-Z.*]+)*)/;
function isTask(item) {
    var props = Object.getOwnPropertyNames(item);
    return [["source", String], ["actions", Array]].every(function (check) {
        return props.some(function (prop) { return check[0] == prop && Object.getPrototypeOf(item[prop]).constructor == check[1]; });
    });
}
function aquire(packName) {
    try {
        return Promise.resolve(require(packName));
    }
    catch (err) {
        return new Promise(function (rs, rj) {
            var callBack = function (err) { return err ? rj(err) : rs(require(packName)); };
            child.exec("npm i " + packName, callBack);
        });
    }
}
function executeTask(task) {
    return __awaiter(this, void 0, void 0, function () {
        var fillPack, npmPacks, stream, _i, npmPacks_1, pack;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pathRegex.test(task.source))
                        throw new TypeError("Source is not a valid path.");
                    fillPack = function (_a) { return __awaiter(_this, void 0, void 0, function () {
                        var path, mod, action;
                        var act = _a.action, rest = __rest(_a, ["action"]);
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    path = act.split(".");
                                    return [4 /*yield*/, aquire(path.shift())];
                                case 1:
                                    mod = _b.sent();
                                    action = path.reduce(function (prev, cur) { return prev[cur]; }, mod);
                                    return [2 /*return*/, __assign({ action: action }, rest)];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Promise.all(task.actions.map(fillPack))];
                case 1:
                    npmPacks = _a.sent();
                    stream = gulp.src(task.source);
                    for (_i = 0, npmPacks_1 = npmPacks; _i < npmPacks_1.length; _i++) {
                        pack = npmPacks_1[_i];
                        stream = stream.pipe(pack.action.apply(pack, (pack.arguments || [])));
                        if (pack.destination) {
                            if (!pathRegex.test(pack.destination))
                                throw new TypeError("Destination is not a valid path.");
                            stream = stream.pipe(gulp.dest(pack.destination));
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function main(args) {
    switch (args[0]) {
        case "run":
            var act = void 0;
            var src = void 0;
            if (args[1] && pathRegex.test(args[1]))
                src = args[1];
            else {
                if (args[2] && pathRegex.test(args[2]))
                    src = args[2];
                act = args[1];
            }
            src = src ? path.join(__dirname, src) : __dirname;
            src = !src || src.endsWith(config) ? src : path.join(src, config);
            var data = void 0;
            var then = [function () { return console.log("Task complete."); }, console.error];
            try {
                data = JSON.parse(fs.readFileSync(src).toString());
            }
            catch (error) {
                console.error(error);
            }
            var promise = void 0;
            if (isTask(data))
                promise = executeTask(data);
            else {
                var task = act ? data[act] : data["default"];
                if (!task)
                    throw new Error("Invalid task.");
                promise = executeTask(task);
            }
            promise.then.apply(promise, then);
            break;
        case undefined:
            break;
        default:
    }
}
main(process.argv.splice(2));
