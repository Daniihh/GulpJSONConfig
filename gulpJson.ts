/*
  IMPORTED DEFINITIONS
*/
type Mapper<V, R, F = V[], T = any> = (this: T, current: V, index?: number, object?: F) => R;
type Reducer<V, R, F, I = V> = (accumulator: R | I, current: V, index?: number, object?: F) => R;
type Consumer<V, F, T = any> = Mapper<V, void, F, T>;

declare global {
  interface Array<T> {
    //Better Typed Functions
    every<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
    filter<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T[];
    find<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T;
    findIndex<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): number;
    forEach<TH = any>(callback: Consumer<T, this, TH>, thisArg?: TH): void;
    map<R = void, TH = any>(callback: Mapper<T, R, this, TH>, thisArg?: TH): R[];
    reduce<R = T>(callback: Reducer<T, R, this>): T | R;
    reduce<R = T, I = T>(callback: Reducer<T, R, this, I>, initial: I): R | I;
    reduceRight<R = T>(callback: Reducer<T, R, this>): T | R;
    reduceRight<R = T, I = T>(callback: Reducer<T, R, this, I>, initial: I): R | T;
    some<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
  }
}

/*
  FILE
*/
import fs = require("fs");
import path = require("path");
import gulp = require("gulp");
import child = require("child_process");

const config = "gulpconfig.json";
const pathRegex = /((?:[\/\\]?[a-zA-Z.*]+)*)/;
const isPath = /\/|\\/g;

type Task = {source: string, destination: string, actions: Action[]};
type Action = {action: string, destination?: string, arguments?: any};

function isTask(item: any): item is Task {
  let props = Object.getOwnPropertyNames(item);
  return [["source", String], ["actions", Array]].every((check) => 
    props.some((prop) => check[0] == prop &&
      Object.getPrototypeOf(item[prop]).constructor == check[1]));
}

function aquire(packName: string): Promise<any> {
  try {return Promise.resolve(require(packName));}
  catch (err) {return new Promise((rs, rj) => {
    const callBack = (err) => err ? rj(err) : rs(require(packName));
    child.exec(`npm i ${packName}`, callBack);
  });}
}

async function executeTask(task: Task) {
  if (!pathRegex.test(task.source))
    throw new TypeError("Source is not a valid path.");

  const fillPack = async ({action: act, ...rest}: Action) => {
    let path = act.split(".");
    let mod = await aquire(path.shift());
    let action: Function = path.reduce((prev, cur) => prev[cur], mod);
    return {action, ...rest};
  };
  const npmPacks = await Promise.all(task.actions.map(fillPack));

  let stream = gulp.src(task.source);
  for (let pack of npmPacks) {
    stream = stream.pipe(pack.action(...(pack.arguments || [])));
    if (pack.destination) {
      if (!pathRegex.test(pack.destination))
        throw new TypeError("Destination is not a valid path.");
      stream = stream.pipe(gulp.dest(pack.destination));
    }
  }
}

function main(args: string[]) {
  switch (args[0]) {
    case "run":
      let act: string;
      let src: string;
      if (args[1] && isPath.test(args[1]))
        src = args[1];
      else {
        if (args[2] && isPath.test(args[2]))
          src = args[2];
        act = args[1];
      }
      src = src ? path.join(__dirname, src) : __dirname;
      src = !src || src.endsWith(config) ? src : path.join(src, config);
      
      let data: {[x: string]: Task} | Task;
      const then = [() => console.log("Task complete."), console.error];
      try {data = JSON.parse(fs.readFileSync(src).toString());}
      catch (error) {console.error(error);}
      
      let promise: Promise<void>;
      if (isTask(data)) promise = executeTask(data);
      else {
        let task = act ? data[act] : data.default;
        if (!task) throw new Error("Invalid task.");
        promise = executeTask(task);
      }
      promise.then(...then);
      break;
    case undefined:
      
      break;
    default:

  }
}

main(process.argv.splice(2));
