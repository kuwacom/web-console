// @ts-ignore
import config from "../config.json";
import { Logger } from "tslog"
const logger = new Logger();

import http from "http";
import fs from "fs";
import ws from "ws";
import childProcess from "child_process";

interface REQ {
    type: string;
    data: any;
}

// const proc = childProcess.spawn("bedrock_server.exe",{cwd:"./server/"});
const proc = childProcess.spawn("sh", ["./start.sh"],{ cwd:"/minecraft/" });
logger.info("Start MC Server - PID: " + proc.pid);
proc.stdout.on('data', (data) => {
    if(data.toString() != ""){
        logger.debug(data.toString());
    }
});


const websocket = ws.Server;
const wsServer = new websocket({ port: 8080 });
wsServer.on("connection", ws => {
    proc.stdout.on('data', (data) => {
        if(data.toString() != ""){
            ws.send(data.toString())
        }
    });
    ws.on("message", (message: string) => {
        const json:REQ = JSON.parse(message)
        logger.debug(json);
        if (json.type == "start") {
            ws.send("start from server");
        }
        if (json.type == "terminal") {
            proc.stdin.write(json.data+"\n")
        }
    });
});


const server = http.createServer(function(request, response){
    console.log(request.url)
    let html = "";
    try {
        html = fs.readFileSync("./web/"+request.url, 'utf8');
    } catch (error) {
        html = "NotFound"
    }
    response.writeHead(200,{'Content-Type': 'text/html; charset=utf-8'});
    response.end(html);
})
server.listen(80);