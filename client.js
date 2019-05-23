/**
 * 构建TCP客户端
 */
const fs = require('fs');
/* 引入net模块 */
var net = require("net");

var args = {};
process.argv.forEach(function (val, index, array) {

  args[index] = val;
  console.log(index + ': ' + val);
});

function ifpush() {
  return args[2] && args[2] === 'push';
}

async function main(push) {
  let start = new Date().getTime();
  let by = 0;
  for (let i = 0; i < 1; i++) {
    by = await rq(push);
  }

  let end = new Date().getTime();

  let time = (end - start);
  console.log("main time ", time);

  if (push === true) {
    const stats = fs.statSync("./tmpsmall");
    const fileSizeInBytes = stats.size;

    let speed = fileSizeInBytes / time / 1024 / 1024 * 1000;

    console.log("someone end len ", fileSizeInBytes, " time ", time, "speed", speed + "MB/s");
  } else {
    let speed = by / time / 1024 / 1024 * 1000;

    console.log("someone end len ", by, " time ", time, "speed", speed + "MB/s");
  }

}

main(ifpush());



function rq(push) {

  return new Promise(function (resolve, reject) {


    let count = 0;
    /* 创建TCP客户端 */
    var client = net.Socket();

    /* 设置连接的服务器 */
    client.connect(8000, 'xxxx', function () {
      console.log("connect the server");

      client.write(push === true ? 'push' : 'pull');

      /* 向服务器发送数据 */
      console.log("push =", push);
      if (push) {
        var sync = fs.createReadStream('./tmpsmall');

        sync.on('error', function (e) {
          console.error(e);
        });
        sync.on('open', function () {
          console.log("sync open");
          sync.pipe(client);
        });
        sync.on('finish', function () {
          console.log("sync finish");
          //client.end();
        });

        sync.on('end', function () {
          console.log("sync end");
          client.end();
        });
      }



    })

    /* 监听服务器传来的data数据 */
    client.on("data", function (data) {
      count += data.length;
      //console.log("count " + count);
    })

    /* 监听end事件 */
    client.on("end", function () {
      console.log("data end");
      resolve(count);
    })

    client.on("close", function () {
      console.log("data close");
      resolve(count);
    })

    client.on("error", function (e) {
      console.log("data error", e);
      resolve(count);
    })

  });

}
